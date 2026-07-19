import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Target, Trophy, MessageSquare, Brain, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { useInterview } from '../features/interview/hooks/useInterview'
import '../features/profile/style/profile.scss'

const MockInterviewReportPage = () => {
    const { historyId } = useParams()
    const navigate = useNavigate()
    const { getHistoryById } = useInterview()
    
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            const data = await getHistoryById(historyId)
            if (data) {
                setReport(data)
            }
            setLoading(false)
        }
        fetchHistory()
    }, [historyId])

    if (loading) {
        return (
            <div className="dashboard-page profile-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
                <div style={{color: 'var(--text-secondary)'}}>Loading Report...</div>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="dashboard-page profile-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
                <div style={{color: 'var(--text-secondary)', textAlign: 'center'}}>
                    <h2>Report Not Found</h2>
                    <button className="button secondary-button" onClick={() => navigate(-1)} style={{marginTop: '1rem'}}>Go Back</button>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-page profile-page">
            <div className="page-grid" style={{maxWidth: '1000px', margin: '0 auto'}}>
                <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                    
                    <button className="button secondary-button" onClick={() => navigate(-1)} style={{marginBottom: '2rem'}}>
                        <ArrowLeft size={16} /> Back to History
                    </button>

                    <div className="glass-card" style={{marginBottom: '2rem'}}>
                        <div style={{padding: '3rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)'}}>
                            <h2 style={{fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>Mock Interview Report</h2>
                            <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem'}}>Role: {report.targetRole}</p>
                            
                            <div style={{
                                width: '150px', height: '150px', 
                                borderRadius: '50%', 
                                border: `8px solid ${report.overallScore > 75 ? '#4ade80' : report.overallScore > 50 ? '#facc15' : '#f87171'}`,
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                margin: '2rem auto 0 auto',
                                background: 'var(--bg-page)'
                            }}>
                                <span style={{fontSize: '3rem', fontWeight: 'bold'}}>{report.overallScore}</span>
                                <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Overall Score</span>
                            </div>
                        </div>

                        <div className="stats-grid" style={{gridTemplateColumns: '1fr 1fr', padding: '2rem', gap: '2rem', background: 'var(--bg-card)'}}>
                            <div>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#4ade80'}}><Brain size={20} /> Technical Feedback</h3>
                                <p style={{color: 'var(--text-secondary)', lineHeight: 1.6}}>{report.technicalFeedback}</p>
                            </div>
                            <div>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#60a5fa'}}><MessageSquare size={20} /> Communication Feedback</h3>
                                <p style={{color: 'var(--text-secondary)', lineHeight: 1.6}}>{report.communicationFeedback}</p>
                            </div>
                        </div>

                        <div style={{padding: '2rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem'}}>
                            <div>
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', marginBottom: '1rem'}}><CheckCircle size={18}/> Strengths</h4>
                                <ul style={{paddingLeft: '1.5rem', color: 'var(--text-secondary)'}}>
                                    {(report.strengths || []).map((s, i) => <li key={i} style={{marginBottom: '0.5rem'}}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '1rem'}}><AlertTriangle size={18}/> Improvements</h4>
                                <ul style={{paddingLeft: '1.5rem', color: 'var(--text-secondary)'}}>
                                    {(report.improvements || []).map((s, i) => <li key={i} style={{marginBottom: '0.5rem'}}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15', marginBottom: '1rem'}}><Lightbulb size={18}/> Suggestions</h4>
                                <ul style={{paddingLeft: '1.5rem', color: 'var(--text-secondary)'}}>
                                    {(report.aiSuggestions || []).map((s, i) => <li key={i} style={{marginBottom: '0.5rem'}}>{s}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <h3 style={{marginBottom: '1rem'}}>Question & Answer History</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        {report.qnaHistory && report.qnaHistory.map((qna, idx) => (
                            <div key={idx} className="glass-card" style={{padding: '2rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem'}}>
                                    <h4 style={{fontSize: '1.2rem', color: 'var(--text-primary)', maxWidth: '80%'}}>Q{idx + 1}: {qna.question}</h4>
                                    <span style={{padding: '0.5rem 1rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '1rem', fontWeight: 'bold'}}>
                                        Score: {qna.aiScore}/10
                                    </span>
                                </div>
                                <div style={{marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-page)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)'}}>
                                    <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Your Answer</span>
                                    <p style={{marginTop: '0.5rem', color: 'var(--text-primary)'}}>{qna.userAnswer}</p>
                                </div>
                                <div>
                                    <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>AI Feedback</span>
                                    <p style={{marginTop: '0.5rem', color: 'var(--text-secondary)'}}>{qna.aiFeedback}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default MockInterviewReportPage
