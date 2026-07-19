import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { FileText, Target, Zap, MessageSquare, ArrowRight, Download, BrainCircuit, History, Trash2, BookOpen, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'


const QuestionCard = ({ item, index }) => {
    return (
        <div style={{background: 'var(--bg-page)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            <strong style={{color: 'var(--text-primary)', fontSize: '1.05rem'}}>Q{index + 1}: {item.question}</strong>
            <div style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-blue)'}}>
                <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Why they ask</span>
                <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{item.intention}</p>
            </div>
            <div style={{background: 'rgba(74, 222, 128, 0.05)', padding: '1rem', borderRadius: '6px', borderLeft: '3px solid #4ade80'}}>
                <span style={{display: 'block', fontSize: '0.75rem', color: '#4ade80', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>AI Suggested Answer</span>
                <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{item.answer}</p>
            </div>
        </div>
    )
}

const Interview = () => {
    const navigate = useNavigate()
    const { report, getReportById, loading, getResumePdf, getResumePdfBlob, reports, deleteReport } = useInterview()
    const { interviewId } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()

    const defaultTab = searchParams.get('tab') === 'resume' ? 'resume' : 'analysis';
    const [activeTab, setActiveTab] = useState(defaultTab) // 'analysis' | 'resume'
    const [selectedTheme, setSelectedTheme] = useState('Classic ATS')
    const [zoom, setZoom] = useState(100)
    const [aiInstruction, setAiInstruction] = useState('')
    const [pdfUrl, setPdfUrl] = useState(null)
    const [previewLoading, setPreviewLoading] = useState(false)

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    // Update activeTab if searchParam tab changes
    useEffect(() => {
        const tabParam = searchParams.get('tab')
        if (tabParam === 'resume') {
            setActiveTab('resume')
        } else if (tabParam === 'analysis') {
            setActiveTab('analysis')
        }
    }, [searchParams])

    // Load PDF Preview
    const loadPdfPreview = async () => {
        if (!interviewId) return;
        setPreviewLoading(true)
        const url = await getResumePdfBlob(interviewId, selectedTheme, aiInstruction)
        if (url) {
            setPdfUrl(url)
        }
        setPreviewLoading(false)
    }

    useEffect(() => {
        if (activeTab === 'resume' && interviewId) {
            loadPdfPreview()
        }
    }, [activeTab, selectedTheme, interviewId])

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading AI Analysis...</h1>
            </main>
        )
    }

    const missingSkills = report.skillGaps ? report.skillGaps.filter(g => g.severity === 'high' || g.severity === 'medium') : [];
    const matchedSkills = report.skillGaps ? report.skillGaps.filter(g => g.severity === 'low') : [];

    return (
        <div className='dashboard-page' style={{paddingTop: '2rem'}}>
            <div className='page-grid'>
                
                {/* ── Main Content Column ── */}
                <div className='main-content-col'>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                        <div>
                            <h1 style={{fontSize: '2rem', margin: '0 0 0.5rem 0'}}>{report.title || 'Role'} Strategy</h1>
                            
                            {/* Tabs Switcher */}
                            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                                <button 
                                    className={`button ${activeTab === 'analysis' ? 'primary-button' : 'secondary-button'}`}
                                    onClick={() => setSearchParams({})}
                                    title="View missing skills, matched skills, day-wise prep plan, and generated questions"
                                >
                                    <Target size={16}/> 📋 View Interview Strategy & Prep
                                </button>
                                <button 
                                    className={`button ${activeTab === 'resume' ? 'primary-button' : 'secondary-button'}`}
                                    onClick={() => setSearchParams({ tab: 'resume' })}
                                    title="Customize and download your ATS-optimized resume"
                                >
                                    <FileText size={16}/> 📄 View & Customize ATS Resume
                                </button>
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                            <button onClick={() => navigate('/')} className="button secondary-button">
                                <BrainCircuit size={16}/> New Analysis
                            </button>
                            {activeTab === 'resume' ? (
                                <button onClick={() => getResumePdf(interviewId, selectedTheme, aiInstruction)} className="button primary-button">
                                    <Download size={16}/> Export PDF
                                </button>
                            ) : (
                                <button onClick={() => navigate(`/mock-interview/${interviewId}`)} className="button primary-button">
                                    Start Mock Interview <ArrowRight size={16}/>
                                </button>
                            )}
                        </div>
                    </div>

                    {activeTab === 'analysis' ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--grid-gap)'}}>
                            {/* Keyword Match & Missing Skills */}
                            <div className="glass-card" style={{padding: '2rem'}}>
                                <h3 style={{margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Zap size={20}/> Skill Gap Analysis</h3>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                                    <div>
                                        <h4 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>Missing Critical Skills</h4>
                                        {missingSkills.length > 0 ? (
                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                                                {missingSkills.map((gap, i) => (
                                                    <span key={i} style={{padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', background: gap.severity === 'high' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(250, 204, 21, 0.1)', color: gap.severity === 'high' ? '#f87171' : '#facc15', border: `1px solid ${gap.severity === 'high' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`}}>
                                                        {gap.skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>No critical skills missing.</p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>Matched Skills</h4>
                                        {matchedSkills.length > 0 ? (
                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                                                {matchedSkills.map((gap, i) => (
                                                    <span key={i} style={{padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: `1px solid rgba(74, 222, 128, 0.2)`}}>
                                                        {gap.skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>No strong matches found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AI Suggestions (Preparation Plan) */}
                            <div className="glass-card" style={{padding: '2rem'}}>
                                <h3 style={{margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><BookOpen size={20}/> AI Preparation Plan</h3>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    {report.preparationPlan && report.preparationPlan.map((day, i) => (
                                        <div key={i} style={{background: 'var(--bg-page)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                            <h4 style={{margin: '0 0 0.5rem 0', color: 'var(--accent-blue)'}}>Day {day.day}: {day.focus}</h4>
                                            <ul style={{margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                                                {day.tasks.map((task, idx) => (
                                                    <li key={idx} style={{marginBottom: '0.25rem'}}>{task}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Generated Interview Questions */}
                            <div className="glass-card" style={{padding: '2rem'}}>
                                <h3 style={{margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><MessageSquare size={20}/> AI Generated Interview Questions</h3>
                                
                                <h4 style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>Technical Questions</h4>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem'}}>
                                    {report.technicalQuestions && report.technicalQuestions.map((q, i) => (
                                        <QuestionCard key={`tech-${i}`} item={q} index={i} />
                                    ))}
                                </div>

                                <h4 style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>Behavioral Questions</h4>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    {report.behavioralQuestions && report.behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={`behav-${i}`} item={q} index={i} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── PREMIUM PDF PREVIEWER & CUSTOMIZER ── */
                        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>

                            {/* Optional AI Enhancement */}
                            <div className="glass-card" style={{padding: '1.5rem'}}>
                                <h4 style={{margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem'}}>
                                    <BrainCircuit size={18} color="var(--accent-blue)"/> AI Resume Enhancements
                                </h4>
                                <div style={{display: 'flex', gap: '1rem'}}>
                                    <input 
                                        type="text"
                                        className="panel__textarea"
                                        placeholder="e.g. 'Quantify achievements', 'Condense to exactly 1 page', 'Make summary sound more executive'..."
                                        value={aiInstruction}
                                        onChange={(e) => setAiInstruction(e.target.value)}
                                        style={{flex: 1, minHeight: '40px', padding: '0.5rem 1rem'}}
                                    />
                                    <button className="button primary-button" onClick={loadPdfPreview} disabled={previewLoading}>
                                        {previewLoading ? <RefreshCw className="spinner" size={16}/> : 'Apply AI Rewrite'}
                                    </button>
                                </div>
                            </div>

                            {/* PDF Render Window */}
                            <div className="glass-card" style={{padding: '2rem', display: 'flex', justifyContent: 'center', background: '#1e1e24', minHeight: '600px', overflow: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                                {previewLoading ? (
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)'}}>
                                        <RefreshCw className="spinner" size={32}/>
                                        <span>Regenerating ATS PDF Preview...</span>
                                    </div>
                                ) : pdfUrl ? (
                                    <iframe 
                                        src={`${pdfUrl}#zoom=${zoom}`} 
                                        style={{
                                            width: '100%', 
                                            height: '750px',
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            transform: `scale(${zoom / 100})`,
                                            transformOrigin: 'top center',
                                            transition: 'transform 0.2s ease'
                                        }}
                                        title="ATS Resume Preview"
                                    />
                                ) : (
                                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)'}}>
                                        Failed to load PDF preview. Click Apply AI Rewrite to retry.
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {/* ── Right Sidebar Column ── */}
                <div className="right-sidebar-col">
                    {/* Analysis Summary */}
                    <div className="widget glass-card">
                        <div className="widget-header">
                            <h3><Target size={18}/> Analysis Summary</h3>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            <div style={{textAlign: 'center', padding: '1.5rem', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                <span style={{display: 'block', fontSize: '3.5rem', fontWeight: '800', lineHeight: 1, color: report.matchScore > 75 ? '#4ade80' : '#facc15', marginBottom: '0.5rem'}}>{report.matchScore}%</span>
                                <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>ATS Keyword Match</span>
                            </div>
                            
                            <div style={{display: 'flex', justifycontent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
                                <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Missing Skills</span>
                                <span style={{fontWeight: '700', color: '#f87171'}}>{missingSkills.length}</span>
                            </div>
                            
                            <div style={{display: 'flex', justifycontent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>
                                <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Generated Questions</span>
                                <span style={{fontWeight: '700'}}>{(report.technicalQuestions?.length || 0) + (report.behavioralQuestions?.length || 0)}</span>
                            </div>

                            <div style={{display: 'flex', justifycontent: 'space-between', alignItems: 'center'}}>
                                <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Analyzed On</span>
                                <span style={{fontWeight: '500', fontSize: '0.9rem'}}>{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            <button className="button primary-button" style={{width: '100%', marginTop: '0.5rem'}} onClick={() => navigate(`/mock-interview/${interviewId}`)}>
                                Start Mock Interview <ArrowRight size={16}/>
                            </button>
                        </div>
                    </div>

                    {/* Analysis History */}
                    <div className="widget glass-card">
                        <div className="widget-header">
                            <h3><History size={18}/> History</h3>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                            {reports && reports.length > 0 ? (
                                reports.map((r) => (
                                    <div 
                                        key={r._id} 
                                        style={{
                                            padding: '1rem', 
                                            background: r._id === interviewId ? 'rgba(88, 166, 255, 0.1)' : 'var(--bg-page)', 
                                            border: `1px solid ${r._id === interviewId ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/interview/${r._id}`)}
                                    >
                                        <div style={{display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                                            <h4 style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)'}}>{r.title || 'Role'}</h4>
                                            <span style={{fontWeight: '700', color: r.matchScore > 75 ? '#4ade80' : '#facc15', fontSize: '0.85rem'}}>{r.matchScore}%</span>
                                        </div>
                                        <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifycontent: 'space-between'}}>
                                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                            {r._id !== interviewId && (
                                                <button onClick={(e) => { e.stopPropagation(); deleteReport(r._id); }} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0}}>
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : null}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Interview