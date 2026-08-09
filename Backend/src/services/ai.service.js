const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const intelligenceReportSchema = z.object({
    rawScores: z.object({
        projectRelevance: z.number().describe("0-100: How relevant are the candidate's projects to the job"),
        experience: z.number().describe("0-100: How well does the experience match the job requirements"),
        education: z.number().describe("0-100: Does the education meet the requirements"),
        atsReadability: z.number().describe("0-100: How well is the resume structured and readable"),
        evidenceStrength: z.number().describe("0-100: How strong and clear is the evidence provided for their skills")
    }).describe("Raw sub-scores evaluated by the AI based on qualitative factors"),
    
    interviewQuestions: z.array(z.object({
        question: z.string().describe("The specific interview question"),
        category: z.string().describe("E.g., PROJECT, TECHNICAL, JOB-SPECIFIC, AI/ML CONCEPT, SYSTEM DESIGN, SKILL GAP"),
        difficulty: z.string().describe("Introductory, Intermediate, Deep-dive, or Advanced"),
        reason: z.string().describe("Why this question is being asked based on the resume/JD"),
        relatedSkill: z.string().describe("The core skill being tested"),
        source: z.string().describe("Where this question was derived from (e.g., specific project or missing JD requirement)")
    })).describe("Highly specific, structured interview questions"),
    
    skillAnalysis: z.object({
        strongMatches: z.array(z.object({
            skill: z.string().describe("The explicitly matched skill"),
            category: z.string().describe("Category, e.g. REQUIRED_TECHNOLOGIES, AI_ML_CONCEPTS, etc."),
            status: z.string().describe("DIRECT_MATCH"),
            confidence: z.number().describe("Confidence score 80-100"),
            evidence: z.array(z.string()).describe("Specific sentences/claims extracted from the resume acting as evidence"),
            sources: z.array(z.string()).describe("e.g. ['Experience', 'Projects']")
        })).describe("Strong matches with clear evidence"),
        
        partialMatches: z.array(z.object({
            skill: z.string().describe("The JD skill that is partially matched"),
            status: z.string().describe("RELATED_MATCH or PARTIAL_MATCH"),
            confidence: z.number().describe("Confidence score 30-79"),
            evidence: z.array(z.string()).describe("Evidence of related experience (e.g. used Groq instead of Agentic AI)"),
            remainingGap: z.string().describe("What exactly is still missing to make this a full match")
        })).describe("Partial matches where candidate knows adjacent technologies"),
        
        missingSkills: z.array(z.object({
            skill: z.string().describe("The skill completely missing from the resume"),
            priority: z.enum(["HIGH", "MEDIUM", "LOW"]).describe("Priority based on how critical it is for the role"),
            type: z.string().describe("REQUIRED_NOT_EVIDENCED, PREFERRED_NOT_EVIDENCED, or ADVANCED_OPTIONAL")
        })).describe("Missing skills categorized by priority")
    }).describe("Multi-level evidence-based skill matching analysis"),
    
    preparationRoadmap: z.array(z.object({
        roundNumber: z.number().describe("Round number (1 to 5)"),
        focus: z.string().describe("The main focus (e.g., 'RESUME & FUNDAMENTALS', 'PROJECT DEEP DIVE')"),
        assignedTopic: z.string().describe("Specific topic to prepare"),
        tasks: z.array(z.string()).describe("Specific preparation tasks")
    })).describe("Personalized 5-round preparation roadmap"),
    
    title: z.string().describe("The title of the job"),
    
    resumeProfile: z.object({
        skills: z.array(z.string()),
        projects: z.array(z.string()),
        experience: z.array(z.string()),
        education: z.array(z.string()),
        certifications: z.array(z.string()),
        technologies: z.array(z.string()),
        summary: z.string().describe("A concise 2-3 line summary of the candidate's profile."),
        proficiency: z.string()
    }).describe("A structured profile extracted from the raw resume text")
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate a highly credible "AI-Powered Resume & Interview Intelligence System" report.
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        CRITICAL INSTRUCTIONS:
                        1. JOB DESCRIPTION CLASSIFICATION: Use meaningful categories. Examples: "LLM usage patterns" -> LLM_APPLICATIONS, "API integrations" -> AI_INTEGRATION, "Machine Learning" / "NLP" -> AI_ML_CONCEPTS, "Python" -> PROGRAMMING_LANGUAGE, "React" -> WEB_TECHNOLOGY, "Whisper" -> SPEECH_AI, "Agentic AI" / "Chatbots" -> AI_SYSTEMS, "LangChain" -> AI_FRAMEWORKS.
                        2. MERGE DUPLICATES: Merge related concepts into single missing skills (e.g., "Embeddings and vector search" and "Vector databases" must be merged into one gap: "Vector Search / Vector Databases").
                        3. WHISPER & VOICEBOTS: Whisper is "SPEECH_AI". Do NOT claim complete voicebot development from Whisper alone. Voicebots require STT + LLM + TTS. If only STT exists, Voicebot is a PARTIAL_MATCH (Reason: "Demonstrates STT but not a complete voicebot workflow").
                        4. AGENTIC AI: If candidate has autonomous AI pair-programmer but no formal framework (LangChain/CrewAI), classify Agentic AI as PARTIAL_MATCH. Remaining gap: "No explicit evidence of a dedicated agent framework." Do NOT claim LangChain/CrewAI knowledge from absence.
                        5. SEMANTIC MATCHING & CONFIDENCE: Do not default confidence to 95%. Derive from evidence:
                           - DIRECT skill + project evidence + experience -> 95-100%
                           - DIRECT skill + project evidence -> 85-94%
                           - Technical skills section only -> 70-84%
                           - Related concept only -> 50-69%
                           - Weak semantic relationship -> 30-49%
                           - No evidence -> 0%
                        6. MISSING SKILLS LANGUAGE: If missing, say "Not explicitly evidenced in the resume." NEVER say "Candidate does not know X." Categorize priority as HIGH, MEDIUM, or LOW based on job relevance.
                        7. SUMMARY: Create a concise 2-3 line candidate summary in "resumeProfile.summary" (e.g. "AI-focused software developer with hands-on experience in Machine Learning...").
                        8. INTERVIEW QUESTIONS: Provide 6 structured questions.
                        9. INTERVIEW ROADMAP: Generate exactly 5 rounds: ROUND 1 - RESUME & FUNDAMENTALS, ROUND 2 - PROJECT DEEP DIVE, ROUND 3 - JOB-SPECIFIC TECHNICAL, ROUND 4 - SKILL GAP ASSESSMENT, ROUND 5 - ADVANCED / OPTIONAL.
                        10. RAW SCORES: Evaluate qualitative aspects (projectRelevance, experience, education, atsReadability, evidenceStrength) from 0 to 100.
`

    console.log("Calling Gemini with prompt length:", prompt.length);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(intelligenceReportSchema),
            }
        });
        console.log("Gemini responded successfully");
        const aiData = JSON.parse(response.text);

        // DETERMINISTIC ATS SCORE CALCULATION
        // Required Skills Match = 30%
        // Technical/AI Skills Match = 20%
        // Project Relevance = 15% (from LLM)
        // Experience Match = 10% (from LLM)
        // Keyword Coverage = 10%
        // Education Match = 5% (from LLM)
        // Resume Structure / ATS Readability = 5% (from LLM)
        // Evidence Strength = 5% (from LLM)

        const totalRequired = aiData.skillAnalysis.strongMatches.length + aiData.skillAnalysis.partialMatches.length + aiData.skillAnalysis.missingSkills.length;
        
        let requiredMatchScore = 0;
        let technicalMatchScore = 0;
        let keywordCoverageScore = 0;

        if (totalRequired > 0) {
            // Calculate a weighted coverage based on confidence
            const totalConfidence = [
                ...aiData.skillAnalysis.strongMatches,
                ...aiData.skillAnalysis.partialMatches
            ].reduce((sum, match) => sum + (match.confidence || 0), 0);

            // Required skills match is an average of confidence over all required skills
            requiredMatchScore = Math.min(100, (totalConfidence / totalRequired));
            
            // Technical skills match assumes strong matches carry more weight
            const strongCount = aiData.skillAnalysis.strongMatches.length;
            technicalMatchScore = Math.min(100, ((strongCount * 100) + (aiData.skillAnalysis.partialMatches.length * 50)) / totalRequired);
            
            // Keyword coverage is just the raw presence
            keywordCoverageScore = Math.min(100, ((strongCount + (aiData.skillAnalysis.partialMatches.length * 0.5)) / totalRequired) * 100);
        }

        const scoreBreakdown = {
            requiredSkills: Math.round(requiredMatchScore),
            technicalSkills: Math.round(technicalMatchScore),
            projectRelevance: Math.round(aiData.rawScores.projectRelevance || 0),
            experience: Math.round(aiData.rawScores.experience || 0),
            keywordCoverage: Math.round(keywordCoverageScore),
            education: Math.round(aiData.rawScores.education || 0),
            atsReadability: Math.round(aiData.rawScores.atsReadability || 0),
            evidenceStrength: Math.round(aiData.rawScores.evidenceStrength || 0)
        };

        const overallScore = Math.round(
            (scoreBreakdown.requiredSkills * 0.30) +
            (scoreBreakdown.technicalSkills * 0.20) +
            (scoreBreakdown.projectRelevance * 0.15) +
            (scoreBreakdown.experience * 0.10) +
            (scoreBreakdown.keywordCoverage * 0.10) +
            (scoreBreakdown.education * 0.05) +
            (scoreBreakdown.atsReadability * 0.05) +
            (scoreBreakdown.evidenceStrength * 0.05)
        );

        // Format to match the expected return structure of the application
        return {
            title: aiData.title,
            matchScore: overallScore,
            scoreBreakdown,
            skillAnalysis: aiData.skillAnalysis,
            interviewQuestions: aiData.interviewQuestions,
            preparationPlan: aiData.preparationRoadmap, // map to existing key for backward compatibility
            resumeProfile: aiData.resumeProfile,
            // Fallback old arrays to empty so frontend doesn't crash if it looks for them
            technicalQuestions: [],
            behavioralQuestions: [],
            skillGaps: [],
            matchedSkills: [],
            roadmap: []
        };
    } catch (e) {
        console.error("Gemini call failed:", e);
        throw e;
    }
}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription, theme = 'Classic ATS', aiInstruction = '' }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    let themeStyles = "";
    if (theme === 'Modern Professional') {
        themeStyles = `
            font-family: 'Inter', sans-serif;
            --primary-color: #2563eb;
            --text-color: #1f2937;
            --accent-border: 4px solid var(--primary-color);
            h1 { font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            h2 { font-size: 16px; font-weight: 600; color: var(--primary-color); border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
            .header-info { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; color: #4b5563; margin-top: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; }
        `;
    } else if (theme === 'Minimal') {
        themeStyles = `
            font-family: 'Source Sans 3', sans-serif;
            --primary-color: #111827;
            --text-color: #374151;
            h1 { font-size: 30px; font-weight: 300; color: var(--primary-color); margin-bottom: 2px; }
            h2 { font-size: 15px; font-weight: 600; color: var(--primary-color); margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 2px; }
            .header-info { display: flex; flex-wrap: wrap; gap: 16px; font-size: 11px; color: #6b7280; margin-top: 6px; }
        `;
    } else if (theme === 'Executive') {
        themeStyles = `
            font-family: 'Playfair Display', serif;
            --primary-color: #1e3a8a;
            --text-color: #111827;
            body { text-align: justify; }
            .header-container { text-align: center; margin-bottom: 20px; }
            h1 { font-size: 34px; font-weight: 700; color: var(--primary-color); margin-bottom: 4px; }
            h2 { font-size: 16px; font-weight: 600; color: var(--primary-color); text-align: center; border-bottom: 1px double #9ca3af; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase; }
            .header-info { display: flex; justify-content: center; gap: 16px; font-size: 11px; color: #374151; margin-top: 8px; }
        `;
    } else if (theme === 'Developer') {
        themeStyles = `
            font-family: 'IBM Plex Sans', sans-serif;
            --primary-color: #0f766e;
            --text-color: #1f2937;
            h1 { font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 2px; font-family: 'IBM Plex Mono', monospace; }
            h2 { font-size: 16px; font-weight: 600; color: var(--primary-color); margin-top: 22px; padding-bottom: 4px; font-family: 'IBM Plex Mono', monospace; }
            h2::before { content: "// "; color: #9ca3af; }
            h2::after { content: " ==================="; color: #e5e7eb; }
            .header-info { display: flex; flex-wrap: wrap; gap: 12px; font-size: 11px; color: #4b5563; margin-top: 8px; font-family: 'IBM Plex Mono', monospace; }
            .skill-group { font-family: 'IBM Plex Mono', monospace; }
        `;
    } else { // Classic ATS
        themeStyles = `
            font-family: 'Arial', sans-serif;
            --primary-color: #000000;
            --text-color: #222222;
            h1 { font-size: 32px; font-weight: 700; color: var(--primary-color); margin-bottom: 2px; text-align: center; }
            h2 { font-size: 15px; font-weight: 700; color: var(--primary-color); border-bottom: 1.5px solid #000; padding-bottom: 2px; margin-top: 20px; text-transform: uppercase; }
            .header-info { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: #333; margin-top: 6px; }
        `;
    }

    const aiPromptInstruction = aiInstruction 
        ? `Additionally, perform this AI modification to the content before generating the HTML: "${aiInstruction}". Rewrite the summary or achievements accordingly to satisfy this requirement.` 
        : "";

    const prompt = `Generate a premium, recruiter-friendly, ATS-optimized resume for a candidate.
                        Raw Resume Data: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
                        Requested Template Theme: ${theme}

                        CRITICAL INSTRUCTIONS:
                        1. The output must be a single JSON object containing only a single field "html" containing full HTML markup.
                        2. Use this exact CSS theme structure inside the <style> block of the HTML:
                           \`\`\`css
                           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&family=Source+Sans+3:wght@300;400;600;700&family=Playfair+Display:wght@400;700&display=swap');
                           @page { size: A4; margin: 20mm 15mm 20mm 15mm; }
                           body {
                               margin: 0;
                               padding: 0;
                               color: var(--text-color);
                               line-height: 1.5;
                               font-size: 11px;
                               ${themeStyles}
                           }
                           .section { margin-bottom: 18px; page-break-inside: avoid; }
                           .bullet-list { margin: 4px 0 0 0; padding-left: 20px; }
                           .bullet-list li { margin-bottom: 4px; }
                           .link-item { color: var(--primary-color); text-decoration: none; font-weight: 600; }
                           .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 8px; page-break-inside: avoid; }
                           \`\`\`
                        3. Avoid HTML tables, floating graphics, custom shapes, or nested columns that violate standard ATS parse rules.
                        4. Limit the professional summary to 3-4 concise lines highlighting key expertise.
                        5. Group technical skills in sections (e.g. Languages, Frontend, Backend, Databases, AI, Tools).
                        6. Format project links and code links cleanly as visible inline hyperlinks (e.g. "GitHub", "Live Demo").
                        7. Highlight quantified, impact-oriented achievements (e.g., "reduced latency by 30%", "built AI-powered Resume Analyzer that reduced resume evaluation time by 80%").
                        8. Insert this footer at the bottom of the HTML page: "Generated using Interview Master AI Resume Builder"
                        ${aiPromptInstruction}
                    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}


const evaluationSchema = z.object({
    finalScore: z.number().describe("The final overall score between 1 and 10"),
    metrics: z.object({
        technicalAccuracy: z.number().describe("Score for technical accuracy (/10)"),
        conceptClarity: z.number().describe("Score for conceptual clarity (/10)"),
        problemSolving: z.number().describe("Score for problem solving approach (/10)"),
        projectKnowledge: z.number().describe("Score for knowledge of projects (/10)"),
        confidence: z.number().describe("Score for confidence and tone (/10)"),
        communication: z.number().describe("Score for communication and structure (/10)")
    }),
    strengths: z.array(z.string()).describe("List of strengths in the candidate's answer"),
    weaknesses: z.array(z.string()).describe("List of weaknesses or missing points"),
    suggestions: z.array(z.string()).describe("Actionable suggestions for improvement (bullet points)"),
    improvedAnswer: z.string().describe("A complete, ideal, sample answer"),
    communicationAnalysis: z.object({
        speakingConfidence: z.number().describe("Percentage score (0-100) for speaking confidence"),
        fluency: z.number().describe("Percentage score (0-100) for fluency and flow"),
        grammar: z.number().describe("Percentage score (0-100) for grammatical correctness"),
        clarity: z.number().describe("Percentage score (0-100) for clarity of speech and explanation"),
        fillerWordsCount: z.number().describe("Estimated count of filler words (um, uh, basically, actually, like) found in their response"),
        fillerWordsFound: z.array(z.string()).describe("Specific filler words detected in their text")
    }).describe("Communication analysis breakdown")
})

async function evaluateMockInterviewAnswer({ question, userAnswer, intention, expectedAnswer, role, difficulty }) {
    
    let difficultyInstructions = "";
    if (difficulty === "Beginner" || difficulty === "Fresher") {
        difficultyInstructions = "More lenient scoring. Accept partial answers. Provide hints in suggestions. Encourage learning. Be very supportive.";
    } else if (difficulty === "Intermediate") {
        difficultyInstructions = "Moderate strictness. Expect reasonable explanations and decent technical depth.";
    } else if (difficulty === "Advanced" || difficulty === "Senior" || difficulty === "FAANG") {
        difficultyInstructions = "Strict grading. Expect highly optimized answers. Penalize incorrect terminology. Judge like a real Senior/Staff level interviewer.";
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.
    
    Role: ${role || "Software Engineer"}
    Difficulty Level: ${difficulty || "Intermediate"}
    
    Grading Instructions based on Difficulty:
    ${difficultyInstructions}
    
    Question: ${question}
    Intention of question: ${intention}
    Ideal expected points: ${expectedAnswer}
    
    Candidate's Answer: ${userAnswer}
    
    Evaluate the candidate's answer based on the intention, expected points, and the difficulty level. 
    Provide scores out of 10 for each metric, lists of strengths/weaknesses, actionable suggestions, and a perfect ideal answer.
    
    In addition, analyze the candidate's verbal delivery and communication based on the text. Assess their grammar, fluency, clarity, and confidence. Find and count any filler words used in the answer transcript (specifically: "um", "uh", "basically", "actually", "like").`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(evaluationSchema),
            }
        })

        return JSON.parse(response.text)
    } catch (error) {
        console.error("Gemini Evaluation Error:", error);
        return {
            finalScore: 5,
            metrics: {
                technicalAccuracy: 5,
                conceptClarity: 5,
                problemSolving: 5,
                projectKnowledge: 5,
                confidence: 5,
                communication: 5
            },
            strengths: ["Attempted to answer the question"],
            weaknesses: ["Response could not be fully evaluated due to an AI error"],
            suggestions: ["Please try answering again or rephrasing your points"],
            improvedAnswer: "The AI was unable to generate an improved answer at this time.",
            communicationAnalysis: {
                speakingConfidence: 50,
                fluency: 50,
                grammar: 50,
                clarity: 50,
                fillerWordsCount: 0,
                fillerWordsFound: []
            }
        };
    }
}

const finalFeedbackSchema = z.object({
    overallScore: z.number().describe("The final overall score between 1 and 100 based on the entire interview performance"),
    communicationFeedback: z.string().describe("A paragraph describing their communication skills throughout the interview"),
    technicalFeedback: z.string().describe("A paragraph describing their technical depth and accuracy"),
    strengths: z.array(z.string()).describe("List of core strengths demonstrated"),
    improvements: z.array(z.string()).describe("List of areas to improve"),
    aiSuggestions: z.array(z.string()).describe("Actionable suggestions for their next interview")
})

async function generateFinalInterviewFeedback({ role, difficulty, qnaHistory }) {
    const prompt = `You are an expert technical interviewer evaluating a candidate's complete mock interview.
    
    Role: ${role || "Software Engineer"}
    Difficulty Level: ${difficulty || "Intermediate"}
    
    Here is the complete history of questions asked and the candidate's answers, along with your previous per-question evaluations:
    ${JSON.stringify(qnaHistory, null, 2)}
    
    Generate a final, comprehensive performance report for this candidate. Provide an overall score out of 100, detailed communication and technical feedback paragraphs, a list of their core strengths, areas for improvement, and actionable suggestions for their next interview.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(finalFeedbackSchema),
        }
    })

    return JSON.parse(response.text)
}

const nextQuestionSchema = z.object({
    question: z.string().describe("The interview question to ask next"),
    intention: z.string().describe("The reason/intention behind asking this specific question"),
    expectedAnswer: z.string().describe("The ideal points/topics the candidate should cover in their answer"),
    extractedSkills: z.array(z.string()).describe("List of exact skills/technologies from the resume that this question is strictly testing")
})

async function generateNextQuestion({ resumeProfile, jobDescription, role, difficulty, qnaHistory, currentRound, currentRoundPlan, coveredTopics, interviewId }) {
    const prompt = `You are a Senior Technical Interviewer conducting a mock interview for the role of ${role || "Software Engineer"}.
    Difficulty Level: ${difficulty || "Intermediate"}
    
    Candidate's Resume Profile (JSON):
    ${JSON.stringify(resumeProfile, null, 2)}
    
    Job Description: ${jobDescription || "Not provided"}
    
    Current Interview Round: ${currentRound} (out of 5)
    Current Round Plan: ${JSON.stringify(currentRoundPlan)}
    Previously Covered Topics: ${JSON.stringify(coveredTopics)}
    
    Complete QnA History so far:
    ${JSON.stringify(qnaHistory, null, 2)}
    
    CRITICAL INSTRUCTIONS:
    1. EXPLICITLY reference the Candidate's Resume Profile. Your question MUST be derived from their listed skills, projects, experience, or education.
    2. NEVER ask about technologies, tools, or concepts that DO NOT exist in the resume profile. If the resume has "React" but not "Angular", do not ask about Angular.
    3. NO GENERIC QUESTIONS. Act like a senior engineer who read this specific resume.
    4. PREVENT DUPLICATES. Do not ask about topics already in "Previously Covered Topics" or "QnA History" unless you are doing a deep-dive follow-up.
    5. FOLLOW-UP BEHAVIOR: If the last answer in the QnA history was weak, incomplete, or interesting, prioritize asking a contextual follow-up question digging deeper into their previous answer over strictly following the new topic plan.
    6. If you are not doing a follow-up, formulate exactly ONE clear question based on the 'Current Round Plan'.
    7. Ensure the difficulty matches the target: ${currentRoundPlan?.difficultyTarget || difficulty}.
    8. You must return the 'extractedSkills' array containing the exact resume technologies/skills you are testing with this question.`

    const profileStr = resumeProfile ? JSON.stringify(resumeProfile) : "{}";
    const profileLength = profileStr.length;
    console.log(`\n--- NEW QUESTION GENERATION ---`);
    console.log(`[Session ID / Resume ID: ${interviewId}]`);
    console.log(`Parsed Resume Profile Length: ${profileLength}`);
    console.log(`Prompt sent to LLM: \n${prompt.substring(0, 300)}...[TRUNCATED]`);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(nextQuestionSchema),
            }
        });
        const result = JSON.parse(response.text);
        console.log(`Number of extracted skills: ${result.extractedSkills?.length || 0} (${result.extractedSkills?.join(', ')})`);
        console.log(`-------------------------------\n`);
        return result;
    } catch (e) {
        console.error("Gemini next-question call failed:", e);
        // Fallback to prevent interview crash
        return {
            question: "Could you tell me more about your recent projects and the technologies you used?",
            intention: "Fallback question to continue the interview due to an AI error.",
            expectedAnswer: "The candidate should discuss their technical background and relevant experience.",
            extractedSkills: []
        };
    }
}

module.exports = { 
    generateInterviewReport, 
    generateResumePdf, 
    evaluateMockInterviewAnswer, 
    generateFinalInterviewFeedback,
    generateNextQuestion
}