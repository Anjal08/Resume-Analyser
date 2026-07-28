import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/mock-interview.scss'
import { Loader, Send, Star, Target, Brain, Award, MessageSquare, User, Bot, CheckCircle, Download, RotateCcw, Trophy, Mic, Square, Play, Volume2 } from 'lucide-react'

const ROLES = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Other'
]

const MockInterview = () => {
    const { interviewId } = useParams()
    const navigate = useNavigate()
    const { report, getReportById, loading, evaluateMockAnswer, generateFinalFeedback, saveHistory, getNextQuestion } = useInterview()
    const { user } = useAuth()
    const candidateName = user?.name || 'Anjali'

    // Wizard/Interview States
    const [ interviewStep, setInterviewStep ] = useState('initialLoading') // initialLoading -> modeSelection -> difficultySelection -> ready -> interviewing -> finished
    const [ role, setRole ] = useState('Software Engineer')
    const [ mode, setMode ] = useState('Quick Practice')
    const [ difficulty, setDifficulty ] = useState('Intermediate')

    const [ activeQuestions, setActiveQuestions ] = useState([]) 
    const [ currentIndex, setCurrentIndex ] = useState(0)
    
    // Chat States
    const [ messages, setMessages ] = useState([])
    const [ qnaHistory, setQnaHistory ] = useState([])
    const [ inputText, setInputText ] = useState("")
    const [ isTyping, setIsTyping ] = useState(false)
    const [ evalStatus, setEvalStatus ] = useState(null) // null | 'evaluating' | 'generating_final' 
    const [ coveredTopics, setCoveredTopics ] = useState([])
    
    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)

    // Voice & Timer States
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [audioUrl, setAudioUrl] = useState(null)
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [isVoiceUsed, setIsVoiceUsed] = useState(false)

    const recognitionRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const recIntervalRef = useRef(null)
    const audioRef = useRef(null)

    // Interview Elapsed Timer
    useEffect(() => {
        let timer;
        if (interviewStep === 'interviewing') {
            timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(timer);
    }, [interviewStep]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Initialize Web Speech API for transcription
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (transcript) {
                    setInputText(prev => prev + (prev ? " " : "") + transcript);
                }
            };

            rec.onerror = (e) => {
                console.error("Speech recognition error:", e);
            };

            recognitionRef.current = rec;
        }
    }, []);

    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Your browser does not support audio recording.");
            return;
        }

        try {
            audioChunksRef.current = [];
            setAudioUrl(null);
            setRecordingDuration(0);
            setIsVoiceUsed(true);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();

            if (recognitionRef.current) {
                recognitionRef.current.start();
            }

            setIsRecording(true);

            recIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Failed to start recording:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (recIntervalRef.current) {
            clearInterval(recIntervalRef.current);
        }
        setIsRecording(false);
    };

    const playRecording = () => {
        if (audioUrl) {
            if (!audioRef.current) {
                audioRef.current = new Audio(audioUrl);
            } else {
                audioRef.current.src = audioUrl;
            }
            audioRef.current.play();
        }
    };

    const reRecord = () => {
        setInputText("");
        setAudioUrl(null);
        setRecordingDuration(0);
        setIsVoiceUsed(false);
        startRecording();
    };

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping, evalStatus])

    // Fetch report logic
    useEffect(() => {
        if (!report || report._id !== interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    // Reset State on Mount & Unmount
    useEffect(() => {
        setMessages([]);
        setInterviewStep('initialLoading');
        setCurrentIndex(0);
        setIsTyping(false);
        setEvalStatus(null);
        setInputText("");
        setCoveredTopics([]);
        
        return () => {
            setMessages([]);
            setInterviewStep('initialLoading');
            setActiveQuestions([]);
            setCoveredTopics([]);
        };
    }, [interviewId]);

    // Initial Welcome Flow
    useEffect(() => {
        if (report && interviewStep === 'initialLoading') {
            const foundRole = ROLES.find(r => report.title && report.title.toLowerCase().includes(r.toLowerCase()))
            const assignedRole = foundRole || report.title || 'Software Engineer'
            setRole(assignedRole)

            // Simulate AI "typing" the first big message
            setIsTyping(true)
            setTimeout(() => {
                setIsTyping(false)
                setInterviewStep('modeSelection')
                setMessages([{
                    id: Date.now(),
                    sender: 'ai',
                    type: 'welcome',
                    text: `Hello! 👋\n\nI've finished analyzing your resume.\n\nBased on your skills, projects, and experience, I've prepared a personalized mock interview for the **${assignedRole}** role.\n\nDuring this interview I'll evaluate:\n✓ Technical Knowledge\n✓ Communication Skills\n✓ Problem Solving\n✓ Confidence\n\nAt the end you'll receive an AI-generated performance report with detailed suggestions for improvement.\n\nWhich interview would you like to begin today?`,
                    summaryCard: {
                        role: assignedRole,
                        projects: 3, // Mocked for UI polish
                        skills: 'React • Node.js • Python • System Design', // Mocked for UI polish
                        questions: 5,
                        time: '15-20 Minutes'
                    },
                    quickReplies: [
                        { label: '🎯 Full Interview (Technical + Behavioral | 15 min)', value: 'Complete Interview', actionType: 'mode', grid: false },
                        { label: '⚡ Quick Practice (5 Questions | 5 min)', value: 'Quick Practice', actionType: 'mode', grid: false }
                    ]
                }])
            }, 800)
        }
    }, [ report, interviewStep ])

    if (loading || !report || interviewStep === 'initialLoading') {
        return (
            <div className='chat-interface'>
                <header className='chat-header'>
                    <div className='chat-header-info'>
                        <h2>AI Mock Interview</h2>
                        <div className='ai-status-badge'>AI Initializing</div>
                    </div>
                </header>
                <main className='chat-timeline'>
                    <div className='chat-messages-container'>
                        <div className='chat-bubble-wrapper is-ai typing-indicator'>
                            <div className='chat-avatar'><Bot size={20} /></div>
                            <div className='chat-bubble'>
                                <div className='dots'><span></span><span></span><span></span></div>
                                <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#8b949e'}}>
                                    {evalStatus === 'generating_final' 
                                         ? '🤖 AI is generating your final report...' 
                                         : '🤖 AI Interviewer is preparing...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    const handleQuickReply = (reply) => {
        setMessages(prev => {
            const newMsgs = [...prev]
            if (newMsgs.length > 0) {
                newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], quickReplies: undefined }
            }
            return newMsgs
        })

        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: reply.label }])
        setIsTyping(true)

        setTimeout(() => {
            if (reply.actionType === 'mode') {
                setMode(reply.value)
                setInterviewStep('difficultySelection')
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'ai',
                    type: 'setup',
                    text: `Great choice! 🎯\n\nYou selected **${reply.value}**.\n\nNow choose your difficulty.`,
                    quickReplies: [
                        { label: 'Fresher', value: 'Fresher', actionType: 'difficulty', grid: true },
                        { label: 'Intermediate', value: 'Intermediate', actionType: 'difficulty', grid: true },
                        { label: 'Senior', value: 'Senior', actionType: 'difficulty', grid: true },
                        { label: 'FAANG', value: 'FAANG', actionType: 'difficulty', grid: true }
                    ]
                }])
            } else if (reply.actionType === 'difficulty') {
                setDifficulty(reply.value)
                setInterviewStep('ready')
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'ai',
                    type: 'setup',
                    text: `Perfect!\n\nI'll evaluate every answer in real time and provide:\n✓ Technical Accuracy\n✓ Concept Clarity\n✓ Problem Solving\n✓ Project Knowledge\n✓ Confidence\n✓ Communication\n\nReady?`,
                    quickReplies: [
                        { label: 'Start Interview', value: 'start', actionType: 'start' }
                    ]
                }])
            } else if (reply.actionType === 'start') {
                startInterviewFlow(mode)
            }
            setIsTyping(false)
        }, 800)
    }

    const startInterviewFlow = async (selectedMode) => {
        setInterviewStep('interviewing')
        setCurrentIndex(0)
        setIsTyping(true)

        // Show introduction message
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            type: 'intro',
            text: `Hi ${candidateName}, welcome to your ${role} interview. I have analyzed your resume and the job description. I'll ask technical and behavioral questions based on your profile. Let's begin.`
        }])

        try {
            const currentRoundPlan = report.roadmap?.[0] || null;
            const firstQuestionData = await getNextQuestion({
                interviewId: report._id,
                resumeProfile: report.resumeProfile,
                jobDescription: report.jobDescription,
                role,
                difficulty,
                qnaHistory: [],
                currentRound: 1,
                currentRoundPlan,
                coveredTopics: []
            });

            if (firstQuestionData) {
                if (currentRoundPlan && currentRoundPlan.assignedTopic) {
                    setCoveredTopics([currentRoundPlan.assignedTopic]);
                }
                setActiveQuestions([firstQuestionData]);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    type: 'question',
                    text: firstQuestionData.question,
                    badge: `Round 1: Introductory`,
                    intention: firstQuestionData.intention,
                    expectedAnswer: firstQuestionData.expectedAnswer
                }]);
            } else {
                throw new Error("Failed to generate first question");
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                type: 'error',
                text: "Sorry, I had trouble starting the interview. Please try again."
            }]);
        } finally {
            setIsTyping(false);
        }
    }

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || isTyping || evalStatus || interviewStep !== 'interviewing') return;

        // If user submits while recording, stop recording first
        if (isRecording) {
            stopRecording();
        }

        const currentQ = activeQuestions[activeQuestions.length - 1];
        const userMessage = inputText.trim();
        
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }])
        setInputText("")
        
        setEvalStatus('evaluating');

        try {
            // Calculate WPM if voice was used
            let speakingSpeed = 0;
            if (isVoiceUsed && recordingDuration > 0) {
                const wordCount = userMessage.split(/\s+/).filter(Boolean).length;
                speakingSpeed = Math.round((wordCount / recordingDuration) * 60);
            }

            // Evaluate Answer
            const evaluation = await evaluateMockAnswer({
                question: currentQ.question,
                userAnswer: userMessage,
                intention: currentQ.intention,
                expectedAnswer: currentQ.expectedAnswer,
                role,
                difficulty,
                speakingSpeed,
                isVoice: isVoiceUsed
            });

            // Safely parse suggestions
            let feedbackText = "No feedback provided.";
            if (evaluation?.suggestions) {
                if (Array.isArray(evaluation.suggestions)) {
                    feedbackText = evaluation.suggestions.join(" ");
                } else if (typeof evaluation.suggestions === 'string') {
                    feedbackText = evaluation.suggestions;
                }
            }

            // Update QnA History
            const newQna = {
                question: currentQ.question,
                userAnswer: userMessage,
                aiScore: evaluation?.finalScore || 0,
                aiFeedback: feedbackText,
                intention: currentQ.intention,
                isVoice: isVoiceUsed,
                voiceMetrics: evaluation?.communicationAnalysis ? {
                    ...evaluation.communicationAnalysis,
                    speakingSpeed
                } : null
            };

            // Reset voice state for next question
            setAudioUrl(null);
            setRecordingDuration(0);
            setIsVoiceUsed(false);

            const updatedHistory = [...qnaHistory, newQna];
            setQnaHistory(updatedHistory);
            setEvalStatus(null);

            // Add Feedback Message
            setMessages(msgPrev => [...msgPrev, {
                id: Date.now(),
                sender: 'ai',
                type: 'feedback',
                evaluation: evaluation || { finalScore: 0, feedback: "Evaluation failed.", improvedAnswer: "" }
            }]);

            // Proceed to next question or finish
        const nextRound = updatedHistory.length + 1;
        const maxRounds = 5;

        if (nextRound <= maxRounds) {
            setIsTyping(true);
            try {
                const currentRoundPlan = report.roadmap?.[nextRound - 1] || null;
                const nextQuestionData = await getNextQuestion({
                    interviewId: report._id,
                    resumeProfile: report.resumeProfile,
                    jobDescription: report.jobDescription,
                    role,
                    difficulty,
                    qnaHistory: updatedHistory,
                    currentRound: nextRound,
                    currentRoundPlan,
                    coveredTopics
                });

                if (nextQuestionData) {
                    if (currentRoundPlan && currentRoundPlan.assignedTopic) {
                        setCoveredTopics(prev => [...prev, currentRoundPlan.assignedTopic]);
                    }
                    setActiveQuestions(prev => [...prev, nextQuestionData]);
                    setCurrentIndex(nextRound - 1);
                    
                    let roundBadge = "";
                    if (nextRound === 2) roundBadge = "Round 2: Resume-based";
                    else if (nextRound === 3) roundBadge = "Round 3: Technical Deep-dive";
                    else if (nextRound === 4) roundBadge = "Round 4: Architecture & Design";
                    else if (nextRound === 5) roundBadge = "Round 5: Advanced & Scaling";

                    setMessages(msgPrev => [...msgPrev, {
                        id: Date.now(),
                        sender: 'ai',
                        type: 'question',
                        text: nextQuestionData.question,
                        badge: roundBadge,
                        intention: nextQuestionData.intention,
                        expectedAnswer: nextQuestionData.expectedAnswer
                    }]);
                } else {
                    throw new Error("Failed to generate next question");
                }
            } catch (error) {
                    // Automatically move to final step if question generation fails
                    setInterviewStep('completed');
                    finishInterview(updatedHistory);
                } finally {
                    setIsTyping(false);
                }
            } else {
                setInterviewStep('completed');
                finishInterview(updatedHistory);
            }
        } catch (criticalError) {
            console.error("Critical error in handleSendMessage:", criticalError);
            setEvalStatus(null);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                type: 'error',
                text: "A critical error occurred while processing your answer. Please try again or refresh the page."
            }]);
        }
    }

    const finishInterview = async (finalQnaHistory) => {
        setIsTyping(true)
        setEvalStatus('generating_final')
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            type: 'dashboard',
            text: "You have completed the interview! I am now analyzing your overall performance and generating a final report..."
        }])

        const finalReport = await generateFinalFeedback({
            role,
            difficulty,
            qnaHistory: finalQnaHistory
        });

        if (finalReport) {
            // Save to Database
            const historyData = {
                reportId: report._id,
                targetRole: role,
                overallScore: finalReport.overallScore,
                strengths: finalReport.strengths,
                improvements: finalReport.improvements,
                communicationFeedback: finalReport.communicationFeedback,
                technicalFeedback: finalReport.technicalFeedback,
                aiSuggestions: finalReport.aiSuggestions,
                qnaHistory: finalQnaHistory
            }
            const savedHistory = await saveHistory(historyData);
            
            setEvalStatus(null)
            setIsTyping(false)
            setInterviewStep('finished')
            
            if (savedHistory && savedHistory._id) {
                navigate(`/mock-interview-report/${savedHistory._id}`);
            }
        } else {
            setEvalStatus(null)
            setIsTyping(false)
            setInterviewStep('finished')
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                type: 'dashboard',
                text: "There was an error generating the final report. Please try again later."
            }])
        }
    }

    const renderStars = (score) => {
        const stars = Math.round(score / 2); 
        return (
            <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < stars ? "#facc15" : "transparent"} color={i < stars ? "#facc15" : "#4b5563"} />
                ))}
            </div>
        )
    }

    // ── Chat Interface Render ──────────────────────────────────────────────────
    return (
        <div className='chat-interface'>
            <header className='chat-header'>
                <div className='chat-header-info'>
                    <h2>AI Mock Interview</h2>
                    <div className='ai-status-badge'>AI Ready</div>
                    {interviewStep === 'interviewing' && (
                        <div style={{fontSize: '0.85rem', color: '#8b949e', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', marginLeft: '1rem', display: 'inline-block'}}>
                            ⏱ Elapsed: {formatTime(elapsedTime)}
                        </div>
                    )}
                </div>
                <div className='chat-progress'>
                    {interviewStep === 'finished' ? 'Completed' : 
                     interviewStep === 'interviewing' ? (
                          <>
                            <span>Question {currentIndex + 1} of 5</span>
                            <div className='progress-bar-container'>
                                <div className='progress-fill' style={{width: `${((currentIndex + 1)/5)*100}%`}}></div>
                            </div>
                          </>
                      ) : 'Setup'}
                </div>
            </header>

            <main className='chat-timeline' ref={chatContainerRef}>
                <div className='chat-messages-container'>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'is-user' : 'is-ai'}`}>
                            <div className='chat-avatar'>
                                {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            
                            <div className='chat-bubble-container' style={{width: msg.type === 'dashboard' ? '100%' : 'auto'}}>
                                <div className={`chat-bubble ${msg.type === 'dashboard' ? 'msg-dashboard' : ''}`}>
                                    {(msg.type === 'welcome' || msg.type === 'setup' || msg.type === 'intro') && (
                                        <>
                                            {msg.summaryCard && (
                                                <div className='resume-summary-card'>
                                                    <div className='summary-item'>
                                                        <span className='summary-label'>📄 Role</span>
                                                        <span className='summary-value'>{msg.summaryCard.role}</span>
                                                    </div>
                                                    <div className='summary-item'>
                                                        <span className='summary-label'>💼 Projects</span>
                                                        <span className='summary-value'>{msg.summaryCard.projects}</span>
                                                    </div>
                                                    <div className='summary-item'>
                                                        <span className='summary-label'>🛠 Skills</span>
                                                        <span className='summary-value'>{msg.summaryCard.skills}</span>
                                                    </div>
                                                    <div className='summary-item'>
                                                        <span className='summary-label'>❓ Questions</span>
                                                        <span className='summary-value'>{msg.summaryCard.questions} Generated</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className='msg-text' dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}}></div>
                                        </>
                                    )}
                                    
                                    {msg.type === 'question' && (
                                        <div className='msg-question'>
                                            <span className={`badge badge--technical`}>
                                                {msg.badge}
                                            </span>
                                            <p>{msg.text}</p>
                                        </div>
                                    )}
                                    
                                    {msg.type === 'dashboard' && (
                                        <>
                                            <Trophy className='trophy-icon' color="#facc15" />
                                            <h3>Interview Completed</h3>
                                            
                                            <div className='score-circle'>
                                                <span className='score-val'>8.5</span>
                                                <span className='score-lbl'>Overall Score</span>
                                            </div>

                                            <p style={{color: '#8b949e', marginBottom: '2rem'}}>Great job! You showed strong understanding of core concepts. You can review your detailed feedback for each question above.</p>

                                            <div className='dashboard-actions'>
                                                <button onClick={() => navigate(`/interview/${interviewId}`)} className='btn-secondary'>
                                                    Back to Dashboard
                                                </button>
                                                <button onClick={() => window.location.reload()} className='btn-primary'>
                                                    <RotateCcw size={16}/> Retake Interview
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    
                                    {!msg.type && ( // Regular User Text
                                        <div className='msg-text'>{msg.text}</div>
                                    )}

                                    {msg.type === 'error' && (
                                        <div className='msg-error' style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.95rem' }}>{msg.text}</p>
                                        </div>
                                    )}
                                    
                                    {msg.type === 'feedback' && (
                                        <div className='msg-feedback'>
                                            <div className='feedback-header-row'>
                                                <div>
                                                    <h4 style={{margin: 0, color: '#e6edf3', fontSize: '1rem'}}>AI Evaluation</h4>
                                                    {renderStars(msg.evaluation.finalScore)}
                                                </div>
                                                <div className='score-badge'>
                                                    {msg.evaluation.finalScore}/10
                                                </div>
                                            </div>
                                            
                                            {msg.evaluation.metrics && (
                                                <div className='metrics-grid' style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem'}}>
                                                    <div className='metric-item'>
                                                        <span className='metric-label' style={{display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'}}><Target size={14}/> Tech Accuracy</span>
                                                        <span className='metric-value' style={{fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)'}}>{msg.evaluation.metrics.technicalAccuracy}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label' style={{display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'}}><Brain size={14}/> Concept Clarity</span>
                                                        <span className='metric-value' style={{fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)'}}>{msg.evaluation.metrics.conceptClarity}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label' style={{display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'}}><Star size={14}/> Prob Solving</span>
                                                        <span className='metric-value' style={{fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)'}}>{msg.evaluation.metrics.problemSolving}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label' style={{display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'}}><Award size={14}/> Proj Knowledge</span>
                                                        <span className='metric-value' style={{fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)'}}>{msg.evaluation.metrics.projectKnowledge}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label' style={{display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'}}><User size={14}/> Confidence</span>
                                                        <span className='metric-value' style={{fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)'}}>{msg.evaluation.metrics.confidence}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label' style={{display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'}}><MessageSquare size={14}/> Comm Score</span>
                                                        <span className='metric-value' style={{fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)'}}>{msg.evaluation.metrics.communication}/10</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className='feedback-lists'>
                                                <div className='list-col strengths'>
                                                    <h5>✔ Strengths</h5>
                                                    <ul>
                                                        {(msg.evaluation.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                                <div className='list-col weaknesses'>
                                                    <h5>✖ Weak Areas</h5>
                                                    <ul>
                                                        {(msg.evaluation.weaknesses || []).map((w, i) => <li key={i}>{w}</li>)}
                                                    </ul>
                                                </div>
                                            </div>

                                            {msg.evaluation.communicationAnalysis && (
                                                <div className='suggestions-box' style={{background: 'rgba(168, 85, 247, 0.05)', borderLeft: '3px solid #a855f7', padding: '1rem', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '1.25rem'}}>
                                                    <h5 style={{color: '#c084fc', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem'}}><Mic size={16}/> Communication Analysis</h5>
                                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem'}}>
                                                        <div style={{background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'}}>
                                                            <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Confidence</span>
                                                            <span style={{fontSize: '1rem', fontWeight: '700', color: '#fff'}}>{msg.evaluation.communicationAnalysis.speakingConfidence}%</span>
                                                        </div>
                                                        <div style={{background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'}}>
                                                            <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Fluency</span>
                                                            <span style={{fontSize: '1rem', fontWeight: '700', color: '#fff'}}>{msg.evaluation.communicationAnalysis.fluency}%</span>
                                                        </div>
                                                        <div style={{background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'}}>
                                                            <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Grammar</span>
                                                            <span style={{fontSize: '1rem', fontWeight: '700', color: '#fff'}}>{msg.evaluation.communicationAnalysis.grammar}%</span>
                                                        </div>
                                                        <div style={{background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'}}>
                                                            <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Clarity</span>
                                                            <span style={{fontSize: '1rem', fontWeight: '700', color: '#fff'}}>{msg.evaluation.communicationAnalysis.clarity}%</span>
                                                        </div>
                                                        <div style={{background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'}}>
                                                            <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Speed</span>
                                                            <span style={{fontSize: '1rem', fontWeight: '700', color: '#fff'}}>{msg.evaluation.communicationAnalysis.speakingSpeed || 0} WPM</span>
                                                        </div>
                                                        <div style={{background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'}}>
                                                            <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Filler Words</span>
                                                            <span style={{fontSize: '1rem', fontWeight: '700', color: '#fff'}}>{msg.evaluation.communicationAnalysis.fillerWordsCount || 0}</span>
                                                        </div>
                                                    </div>
                                                    {msg.evaluation.communicationAnalysis.fillerWordsFound?.length > 0 && (
                                                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                                            Filler Words Detected: <span style={{color: '#f87171'}}>{msg.evaluation.communicationAnalysis.fillerWordsFound.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className='improved-box'>
                                                <h5><Star size={16}/> Ideal Answer</h5>
                                                <p>{msg.evaluation.improvedAnswer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {msg.quickReplies && (
                                    <div className='quick-replies' style={{flexDirection: msg.quickReplies[0].grid ? 'row' : 'column'}}>
                                        {msg.quickReplies.map((reply, idx) => (
                                            <button 
                                                key={idx} 
                                                className={`quick-reply-btn ${reply.actionType === 'start' ? 'quick-reply-start' : ''} ${reply.grid ? 'grid-mode' : ''}`}
                                                onClick={() => handleQuickReply(reply)}
                                                disabled={isTyping}
                                            >
                                                {reply.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {evalStatus === 'evaluating' && (
                        <div className='chat-bubble-wrapper is-ai'>
                            <div className='chat-avatar'><Bot size={20} /></div>
                            <div className='chat-bubble'>
                                <div className='evaluating-status'>
                                    <div className='status-header'>
                                        <Loader className='spinner' size={16}/> 
                                        🧠 Evaluating answer...
                                    </div>
                                    <div className='status-step active'>✓ Understanding response</div>
                                    <div className='status-step active'>✓ Checking technical accuracy</div>
                                    <div className='status-step active'>✓ Generating AI feedback</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {evalStatus === 'generating_final' && (
                        <div className='chat-bubble-wrapper is-ai'>
                            <div className='chat-avatar'><Bot size={20} /></div>
                            <div className='chat-bubble'>
                                <div className='evaluating-status'>
                                    <div className='status-header'>
                                        <Loader className='spinner' size={16}/> 
                                        🧠 Analyzing overall performance...
                                    </div>
                                    <div className='status-step active'>✓ Synthesizing answers</div>
                                    <div className='status-step active'>✓ Calculating final score</div>
                                    <div className='status-step active'>✓ Generating AI suggestions</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isTyping && !evalStatus && (
                        <div className='chat-bubble-wrapper is-ai typing-indicator'>
                            <div className='chat-avatar'><Bot size={20} /></div>
                            <div className='chat-bubble'>
                                <div className='dots'><span></span><span></span><span></span></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} style={{height: '20px'}} />
                </div>
            </main>

            {/* Sticky Input Area */}
            <footer className='chat-footer'>
                {audioUrl && (
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '800px', background: 'rgba(59, 130, 246, 0.05)', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '0.75rem', boxSizing: 'border-box'}}>
                        <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Voice Answer recorded:</span>
                        <button type="button" onClick={playRecording} style={{background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                            <Volume2 size={14}/> Replay
                        </button>
                        <button type="button" onClick={reRecord} style={{background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                            <RotateCcw size={14}/> Re-record
                        </button>
                    </div>
                )}
                
                <form className='chat-input-wrapper' onSubmit={handleSendMessage} style={{maxWidth: '800px', width: '100%', display: 'flex', alignItems: 'center'}}>
                    {isRecording ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', background: '#221528', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', width: '100%', border: '1px solid #a855f7'}}>
                            <div style={{width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite'}} />
                            <span style={{fontSize: '0.9rem', color: '#e9d5ff', fontWeight: '500'}}>Recording Answer... ({recordingDuration}s)</span>
                            <button type="button" onClick={stopRecording} style={{marginLeft: 'auto', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem'}}>
                                <Square size={12} fill="#ef4444"/> Stop Recording
                            </button>
                        </div>
                    ) : (
                        <>
                            {interviewStep === 'interviewing' && !audioUrl && (
                                <button 
                                    type="button" 
                                    onClick={startRecording}
                                    style={{background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', marginRight: '0.75rem', flexShrink: 0}}
                                    disabled={isTyping || evalStatus}
                                    title="Answer by speaking"
                                >
                                    <Mic size={18} />
                                </button>
                            )}
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={
                                    interviewStep === 'finished' ? "Interview complete." : 
                                    interviewStep !== 'interviewing' ? "Please select an option above..." :
                                    "Type or speak your answer here..."
                                }
                                disabled={isTyping || evalStatus || interviewStep !== 'interviewing'}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                rows={1}
                                ref={(el) => {
                                    if(el) {
                                        el.style.height = 'auto';
                                        el.style.height = (el.scrollHeight > 150 ? 150 : el.scrollHeight) + 'px';
                                    }
                                }}
                            />
                            <button 
                                type="submit"
                                className='send-btn'
                                disabled={isTyping || evalStatus || !inputText.trim() || interviewStep !== 'interviewing'}
                            >
                                <Send size={18} />
                            </button>
                        </>
                    )}
                </form>
                <div className='chat-footer-hint'>
                    {interviewStep === 'interviewing' ? (isVoiceUsed ? "Click send to submit your voice answer or Re-record to try again." : "Press Enter to send, or click the mic button to speak.") : "Use the buttons above to proceed."}
                </div>
            </footer>
        </div>
    )
}

export default MockInterview
