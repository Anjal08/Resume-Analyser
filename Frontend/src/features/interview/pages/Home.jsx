import React, { useState, useRef, useMemo } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import { Trash2, FileText, Mic, BookOpen, Star, Target, ArrowUp, Zap, MessageSquare, AlertCircle, ArrowRight, BrainCircuit, History } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useOutletContext } from 'react-router'
import { motion } from 'framer-motion'

import ScanningLoader from '../../../components/ScanningLoader'
import Loading from '../../../components/Loading'

const Home = () => {
    const { loading, generating, generateReport, reports, deleteReport } = useInterview()
    const { user } = useAuth()
    const context = useOutletContext()
    const openAuthModal = context?.openAuthModal
    const strategyRef = useRef(null)
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ isDragging, setIsDragging ] = useState(false)
    const [ errorMsg, setErrorMsg ] = useState("")

    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        if (!user) {
            if (openAuthModal) openAuthModal();
            else navigate('/login');
            return
        }
        setErrorMsg("")
        if (!jobDescription || jobDescription.trim() === '') {
            setErrorMsg('Please provide a Target Job Description. It is required to generate the interview strategy.')
            return;
        }

        const result = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (result && result.data && result.data._id) {
            navigate(`/interview/${result.data._id}`)
        } else {
            setErrorMsg(result?.error || 'Failed to generate interview strategy. Ensure the resume is a valid PDF and the backend is running.')
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    }
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    }
    
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setResumeFile(e.dataTransfer.files[0]);
        }
    }
    
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if(window.confirm("Are you sure you want to delete this interview plan?")) {
            await deleteReport(id)
        }
    }

    // --- Dynamic Computations from Real Data ---
    const latestReport = reports && reports.length > 0 ? reports[0] : null;
    const latestResumeScore = latestReport?.matchScore || 0;
    const hasResume = !!latestReport?.resume;

    // Missing skills strictly from the latest report
    const missingSkills = useMemo(() => {
        if (!latestReport || !latestReport.skillGaps) return [];
        return latestReport.skillGaps.filter(g => g.severity === 'high' || g.severity === 'medium');
    }, [latestReport]);

    // Top Questions from the latest report
    const topQuestions = useMemo(() => {
        if (!latestReport) return [];
        const qs = [];
        if (latestReport.technicalQuestions?.length > 0) qs.push(latestReport.technicalQuestions[0]);
        if (latestReport.behavioralQuestions?.length > 0) qs.push(latestReport.behavioralQuestions[0]);
        return qs;
    }, [latestReport]);

    // AI Suggestions from latest report
    const aiSuggestions = useMemo(() => {
        if (!latestReport || !latestReport.preparationPlan) return [];
        return latestReport.preparationPlan.slice(0, 2);
    }, [latestReport]);

    // Timeline Activity from all reports
    const recentActivity = useMemo(() => {
        if (!reports) return [];
        return reports.slice(0, 5).map(r => ({
            id: r._id,
            title: `Analyzed: ${r.title || 'Role'}`,
            score: r.matchScore,
            time: new Date(r.createdAt).toLocaleDateString(),
            icon: Target,
            color: 'var(--accent-blue)'
        }));
    }, [reports]);

    if (generating) {
        return <ScanningLoader />
    }

    if (loading) {
        return <Loading />
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    // Rendering unauthenticated landing state
    if (!user) {
        return (
            <div className='dashboard-page'>
                <div className='page-grid'>
                    <motion.div className='main-content-col' initial="hidden" animate="visible" variants={containerVariants} style={{ gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
                        <motion.div variants={itemVariants} style={{marginBottom: '2rem'}}>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 1rem 0', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Interview AI
                            </h1>
                            <h2 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>
                                Intelligent Resume Analysis & Strategy
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                                Upload your resume and paste a job description. Our AI will analyze ATS compatibility, identify missing skills, and generate a personalized interview prep plan.
                            </p>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
                            <button className='button primary-button' onClick={() => { if(openAuthModal) openAuthModal(); else navigate('/login'); }} style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}>
                                Get Started
                            </button>
                            <button className='button secondary-button' onClick={() => { if(openAuthModal) openAuthModal(); else navigate('/login'); }} style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}>
                                Login
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className='dashboard-page'>
            <div className='page-grid'>
                {/* Main Content Area */}
                <motion.div 
                    className='main-content-col'
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    {/* Dashboard Header / Hero */}
                    <motion.header className='dashboard-header' variants={itemVariants}>
                        <div className='greeting'>
                            <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.username} 👋</h1>
                            <p>Ready to analyze your resume and prepare for your next interview?</p>
                        </div>
                    </motion.header>

                    {/* Generate Strategy Tool - MOVED TO TOP */}
                    <motion.section ref={strategyRef} className='strategy-section' variants={itemVariants}>
                        <h2 className='section-title'>Generate AI Analysis</h2>
                        <div className='interview-card glass-card' style={{width: '100%'}}>
                            <div className='interview-card__body'>

                                {/* Left Panel - Profile & Resume */}
                                <div className='panel panel--left'>
                                    <div className='panel__header'>
                                        <span className='panel__icon'><FileText size={18}/></span>
                                        <h2>1. Upload Resume</h2>
                                    </div>

                                    <div className='upload-section' style={{marginBottom: '1rem'}}>
                                        <label 
                                            className={`dropzone ${isDragging ? 'dragging' : ''} ${resumeFile ? 'has-file' : ''}`} 
                                            htmlFor='resume'
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            style={{minHeight: '120px'}}
                                        >
                                            <span className='dropzone__icon'><FileText size={24}/></span>
                                            {resumeFile ? (
                                                <>
                                                    <p className='dropzone__title'>{resumeFile.name}</p>
                                                    <p className='dropzone__subtitle'>Click or drag to replace</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                                    <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                                </>
                                            )}
                                            <input 
                                                hidden 
                                                type='file' 
                                                id='resume' 
                                                name='resume' 
                                                accept='.pdf,.docx'
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                    
                                    <div className='or-divider'><span>OR</span></div>

                                    <div className='self-description'>
                                        <label className='section-label' htmlFor='selfDescription'>Quick Background</label>
                                        <textarea
                                            value={selfDescription}
                                            onChange={(e) => { setSelfDescription(e.target.value) }}
                                            id='selfDescription'
                                            name='selfDescription'
                                            className='panel__textarea panel__textarea--short'
                                            placeholder="Briefly describe your experience and skills..."
                                            style={{minHeight: '80px'}}
                                        />
                                    </div>
                                </div>

                                {/* Vertical Divider */}
                                <div className='panel-divider' />

                                {/* Right Panel - Job Description */}
                                <div className='panel panel--right'>
                                    <div className='panel__header'>
                                        <span className='panel__icon'><BookOpen size={18}/></span>
                                        <h2>2. Target Job Description</h2>
                                        <span className='badge badge--required'>Required</span>
                                    </div>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => { setJobDescription(e.target.value) }}
                                        className='panel__textarea'
                                        placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React...'`}
                                        maxLength={5000}
                                        style={{height: '100%', minHeight: '260px'}}
                                    />
                                    <div className='char-counter' style={{textAlign: 'right'}}>{jobDescription.length} / 5000 chars</div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className='interview-card__footer'>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                    {errorMsg && (
                                        <div style={{ color: '#f85149', background: 'rgba(248, 81, 73, 0.1)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertCircle size={16} /> {errorMsg}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <span className='footer-info'>AI Analysis takes approx 30 seconds</span>
                                        <button onClick={handleGenerateReport} className='button primary-button generate-btn'>
                                            <BrainCircuit size={16} />
                                            Analyze & Generate Strategy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Latest Analysis Results Area */}
                    {latestReport ? (
                        <motion.section className='latest-analysis' variants={itemVariants} style={{marginTop: '3rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                                <h2 className='section-title' style={{margin: 0}}>Latest Analysis: {latestReport.title || 'Role'}</h2>
                                <button className='button secondary-button' style={{fontSize: '0.85rem', padding: '0.5rem 1rem'}} onClick={() => navigate(`/interview/${latestReport._id}`)}>
                                    View Full Report <ArrowRight size={16} />
                                </button>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                                
                                {/* ATS Score Card */}
                                <div className="glass-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)'}}>
                                        <Target size={18} /> <span style={{fontWeight: '600'}}>ATS Keyword Match</span>
                                    </div>
                                    <div style={{fontSize: '3rem', fontWeight: '800', color: latestResumeScore > 75 ? 'var(--success)' : 'var(--warning)', lineHeight: '1'}}>
                                        {latestResumeScore}%
                                    </div>
                                    <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0}}>
                                        Based on your latest uploaded resume ({latestReport.resume || 'Manual Input'}) compared to the job description.
                                    </p>
                                </div>

                                {/* Missing Skills Card */}
                                <div className="glass-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)'}}>
                                        <Zap size={18} /> <span style={{fontWeight: '600'}}>Missing Keywords & Skills</span>
                                    </div>
                                    {missingSkills.length > 0 ? (
                                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                                            {missingSkills.map((gap, i) => (
                                                <span key={i} style={{
                                                    padding: '0.35rem 0.75rem', 
                                                    borderRadius: '2rem', 
                                                    fontSize: '0.85rem',
                                                    background: gap.severity === 'high' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                                    color: gap.severity === 'high' ? '#f87171' : '#facc15',
                                                    border: `1px solid ${gap.severity === 'high' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`
                                                }}>
                                                    {gap.skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Excellent! No critical skill gaps detected.</p>
                                    )}
                                </div>
                                
                                {/* AI Prep Suggestions Card */}
                                <div className="glass-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: '1 / -1'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)'}}>
                                        <MessageSquare size={18} /> <span style={{fontWeight: '600'}}>Preview: AI Generated Interview Questions</span>
                                    </div>
                                    {topQuestions.length > 0 ? (
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                            {topQuestions.map((q, i) => (
                                                <div key={i} style={{background: 'var(--bg-page)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                                    <strong style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>Q: {q.question}</strong>
                                                    <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}><strong>Why they ask:</strong> {q.intention}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>No questions generated.</p>
                                    )}
                                </div>
                            </div>
                        </motion.section>
                    ) : (
                         <motion.section className='latest-analysis' variants={itemVariants} style={{marginTop: '3rem'}}>
                            <div className="glass-card" style={{padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                                <BrainCircuit size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
                                <h3>No Analyses Yet</h3>
                                <p>Upload your resume and a target job description above to generate your first AI analysis and interview strategy.</p>
                            </div>
                        </motion.section>
                    )}
                </motion.div>

                {/* Right Sidebar Column */}
                <motion.div 
                    className='right-sidebar-col'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{display: 'flex', flexDirection: 'column', gap: 'var(--grid-gap)'}}
                >
                    {/* Previous Resume Analyses */}
                    <div className="widget glass-card">
                        <h3 className="widget-title"><History size={18} color="var(--text-secondary)"/> Previous Analyses</h3>
                        <div className="widget-content">
                            {reports && reports.length > 0 ? (
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                    {reports.map((report) => (
                                        <li 
                                            key={report._id} 
                                            style={{
                                                padding: '1rem', 
                                                background: 'var(--bg-page)', 
                                                border: '1px solid var(--border-color)', 
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                            onClick={() => navigate(`/interview/${report._id}`)}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                        >
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                                                <h4 style={{margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)'}}>{report.title || 'Role'}</h4>
                                                <span style={{fontWeight: '700', color: report.matchScore > 75 ? 'var(--success)' : 'var(--warning)', fontSize: '0.9rem'}}>{report.matchScore}%</span>
                                            </div>
                                            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between'}}>
                                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                                <button onClick={(e) => handleDelete(e, report._id)} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0}}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="empty-state" style={{padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                                    <p>Your analysis history will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Home