const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        CRITICAL INSTRUCTIONS:
                        1. Limit the preparationPlan to EXACTLY 5 days to keep the response concise.
                        2. Provide exactly 3 technical questions and 3 behavioral questions.
                        3. Keep all answers and descriptions brief and straight to the point.
`

    console.log("Calling Gemini with prompt length:", prompt.length);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema),
            }
        });
        console.log("Gemini responded successfully");
        return JSON.parse(response.text);
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
        communication: z.number().describe("Score for communication and clarity (/10)"),
        confidence: z.number().describe("Score for confidence and tone (/10)"),
        problemSolving: z.number().describe("Score for problem solving approach (/10)")
    }),
    strengths: z.array(z.string()).describe("List of strengths in the candidate's answer"),
    weaknesses: z.array(z.string()).describe("List of weaknesses or missing points"),
    suggestions: z.array(z.string()).describe("Actionable suggestions for improvement (bullet points)"),
    improvedAnswer: z.string().describe("A complete, ideal, sample answer")
})

async function evaluateMockInterviewAnswer({ question, userAnswer, intention, expectedAnswer, role, difficulty }) {
    
    let difficultyInstructions = "";
    if (difficulty === "Beginner") {
        difficultyInstructions = "More lenient scoring. Accept partial answers. Provide hints in suggestions. Encourage learning. Be very supportive.";
    } else if (difficulty === "Intermediate") {
        difficultyInstructions = "Moderate strictness. Expect reasonable explanations and decent technical depth.";
    } else if (difficulty === "Advanced") {
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
    Provide scores out of 10 for each metric, lists of strengths/weaknesses, actionable suggestions, and a perfect ideal answer.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(evaluationSchema),
        }
    })

    return JSON.parse(response.text)
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

module.exports = { generateInterviewReport, generateResumePdf, evaluateMockInterviewAnswer, generateFinalInterviewFeedback }