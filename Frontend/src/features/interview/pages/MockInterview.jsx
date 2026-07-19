import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview'
import '../style/mock-interview.scss'
import { Loader, Send, Star, Target, Brain, Award, MessageSquare, User, Bot, CheckCircle, Download, RotateCcw, Trophy } from 'lucide-react'

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
    const { report, getReportById, loading, evaluateMockAnswer, generateFinalFeedback, saveHistory } = useInterview()

    // Wizard/Interview States
    const [ interviewStep, setInterviewStep ] = useState('initialLoading') // initialLoading -> modeSelection -> difficultySelection -> ready -> interviewing -> finished
    const [ role, setRole ] = useState('Software Engineer')
    const [ mode, setMode ] = useState('Quick Practice')
    const [ difficulty, setDifficulty ] = useState('Intermediate')

    const [ allQuestions, setAllQuestions ] = useState([]) 
    const [ activeQuestions, setActiveQuestions ] = useState([]) 
    const [ currentIndex, setCurrentIndex ] = useState(0)
    
    // Chat States
    const [ messages, setMessages ] = useState([])
    const [ qnaHistory, setQnaHistory ] = useState([])
    const [ inputText, setInputText ] = useState("")
    const [ isTyping, setIsTyping ] = useState(false)
    const [ evalStatus, setEvalStatus ] = useState(null) // null | 'evaluating' | 'generating_final' 
    
    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)

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

    // **BUG FIX**: Reset State on Mount & Unmount
    useEffect(() => {
        // Clear everything when entering the page to avoid "Previous Conversation" bug
        setMessages([]);
        setInterviewStep('initialLoading');
        setCurrentIndex(0);
        setIsTyping(false);
        setEvalStatus(null);
        setInputText("");
        
        return () => {
            // Cleanup on unmount
            setMessages([]);
            setInterviewStep('initialLoading');
            setActiveQuestions([]);
        };
    }, [interviewId]);

    // Initial Welcome Flow
    useEffect(() => {
        if (report && interviewStep === 'initialLoading') {
            const foundRole = ROLES.find(r => report.title && report.title.toLowerCase().includes(r.toLowerCase()))
            const assignedRole = foundRole || report.title || 'Software Engineer'
            setRole(assignedRole)

            const techQs = (report.technicalQuestions || []).map(q => ({ ...q, type: 'Technical' }))
            const behavQs = (report.behavioralQuestions || []).map(q => ({ ...q, type: 'Behavioral' }))
            setAllQuestions([ ...techQs, ...behavQs ])

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
                        questions: techQs.length + behavQs.length,
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
                        { label: 'Beginner', value: 'Beginner', actionType: 'difficulty', grid: true },
                        { label: 'Intermediate', value: 'Intermediate', actionType: 'difficulty', grid: true },
                        { label: 'Advanced', value: 'Advanced', actionType: 'difficulty', grid: true }
                    ]
                }])
            } else if (reply.actionType === 'difficulty') {
                setDifficulty(reply.value)
                setInterviewStep('ready')
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'ai',
                    type: 'setup',
                    text: `Perfect!\n\nI'll evaluate every answer in real time and provide:\n✓ Technical Accuracy\n✓ Communication\n✓ Confidence\n✓ Suggestions\n✓ Ideal Answer\n\nReady?`,
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

    const startInterviewFlow = (selectedMode) => {
        setInterviewStep('interviewing')
        let selectedQuestions = []

        if (selectedMode === 'Quick Practice') {
            const techQs = allQuestions.filter(q => q.type === 'Technical').sort(() => 0.5 - Math.random())
            const behavQs = allQuestions.filter(q => q.type === 'Behavioral').sort(() => 0.5 - Math.random())
            selectedQuestions = [ ...techQs.slice(0, 3), ...behavQs.slice(0, 2) ]
            if (selectedQuestions.length < 5) selectedQuestions = allQuestions.slice(0, 5)
        } else {
            selectedQuestions = [ ...allQuestions ]
        }

        setActiveQuestions(selectedQuestions)
        setCurrentIndex(0)
        
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            type: 'question',
            text: selectedQuestions[0].question,
            badge: selectedQuestions[0].type
        }])
    }

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || isTyping || evalStatus || interviewStep !== 'interviewing') return;

        const currentQ = activeQuestions[currentIndex];
        const userMessage = inputText.trim();
        
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }])
        setInputText("")
        
        // Show evaluating status instead of standard typing
        setEvalStatus('evaluating');

        // Evaluate Answer
        const evaluation = await evaluateMockAnswer({
            question: currentQ.question,
            userAnswer: userMessage,
            intention: currentQ.intention,
            expectedAnswer: currentQ.answer,
            role,
            difficulty
        })

        // Update QnA History
        const newQna = {
            question: currentQ.question,
            userAnswer: userMessage,
            aiScore: evaluation?.finalScore || 0,
            aiFeedback: evaluation?.suggestions?.join(" ") || "No feedback provided.",
            intention: currentQ.intention
        };
        
        setQnaHistory(prev => {
            const updated = [...prev, newQna];
            
            // Remove eval status
            setEvalStatus(null);

            // Add Feedback Message
            setMessages(msgPrev => [...msgPrev, {
                id: Date.now(),
                sender: 'ai',
                type: 'feedback',
                evaluation: evaluation || { finalScore: 0, feedback: "Evaluation failed.", improvedAnswer: "" }
            }])

            // Prepare Next Question
            const nextIndex = currentIndex + 1;
            if (nextIndex < activeQuestions.length) {
                setIsTyping(true)
                setTimeout(() => {
                    setMessages(msgPrev => [...msgPrev, {
                        id: Date.now(),
                        sender: 'ai',
                        type: 'question',
                        text: activeQuestions[nextIndex].question,
                        badge: activeQuestions[nextIndex].type
                    }])
                    setCurrentIndex(nextIndex)
                    setIsTyping(false)
                }, 1000)
            } else {
                // End of Interview -> Generate Final Report
                finishInterview(updated);
            }
            return updated;
        });
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
                </div>
                <div className='chat-progress'>
                    {interviewStep === 'finished' ? 'Completed' : 
                     interviewStep === 'interviewing' ? (
                         <>
                            <span>Question {currentIndex + 1} of {activeQuestions.length}</span>
                            <div className='progress-bar-container'>
                                <div className='progress-fill' style={{width: `${((currentIndex + 1)/activeQuestions.length)*100}%`}}></div>
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
                                    {(msg.type === 'welcome' || msg.type === 'setup') && (
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
                                            <span className={`badge ${msg.badge === 'Technical' ? 'badge--technical' : 'badge--behavioral'}`}>
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
                                                <div className='metrics-grid'>
                                                    <div className='metric-item'>
                                                        <span className='metric-label'><Target size={14}/> Tech</span>
                                                        <span className='metric-value'>{msg.evaluation.metrics.technicalAccuracy}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label'><MessageSquare size={14}/> Comm</span>
                                                        <span className='metric-value'>{msg.evaluation.metrics.communication}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label'><Award size={14}/> Conf</span>
                                                        <span className='metric-value'>{msg.evaluation.metrics.confidence}/10</span>
                                                    </div>
                                                    <div className='metric-item'>
                                                        <span className='metric-label'><Brain size={14}/> Logic</span>
                                                        <span className='metric-value'>{msg.evaluation.metrics.problemSolving}/10</span>
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
                <form className='chat-input-wrapper' onSubmit={handleSendMessage}>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={
                            interviewStep === 'finished' ? "Interview complete." : 
                            interviewStep !== 'interviewing' ? "Please select an option above..." :
                            "Type your answer here..."
                        }
                        disabled={isTyping || evalStatus || interviewStep !== 'interviewing'}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        rows={1}
                        // Auto-grow height based on scrollHeight, max 150px
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
                </form>
                <div className='chat-footer-hint'>
                    {interviewStep === 'interviewing' ? "Press Enter to send, Shift + Enter for new line." : "Use the buttons above to proceed."}
                </div>
            </footer>
        </div>
    )
}

export default MockInterview
