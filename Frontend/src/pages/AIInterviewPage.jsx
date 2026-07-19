import React, { useEffect, useState } from 'react'
import { History, Target, ArrowRight, Play, Trash2, Brain } from 'lucide-react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useInterview } from '../features/interview/hooks/useInterview'
import '../features/profile/style/profile.scss'

const AIInterviewPage = () => {
    const navigate = useNavigate()
    const { getHistory, deleteHistory, reports } = useInterview()
    
    const [historyList, setHistoryList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            const data = await getHistory()
            if (data) {
                setHistoryList(data)
            }
            setLoading(false)
        }
        fetchHistory()
    }, [])

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this mock interview record?")) {
            const success = await deleteHistory(id)
            if (success) {
                setHistoryList(prev => prev.filter(item => item._id !== id))
            }
        }
    }

    return (
        <div className="dashboard-page profile-page">
            <div className="page-grid">
                
                {/* Header Section */}
                <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                    <motion.div 
                        className="glass-card" 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem'}}
                    >
                        <div>
                            <h2 style={{fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>AI Mock Interviews</h2>
                            <p style={{color: 'var(--text-secondary)'}}>Practice technical and behavioral questions tailored to your resume.</p>
                        </div>
                        
                        <button 
                            className="button primary-button" 
                            style={{padding: '0.75rem 1.5rem'}}
                            onClick={() => {
                                if (reports && reports.length > 0) {
                                    navigate(`/mock-interview/${reports[0]._id}`)
                                } else {
                                    alert("Please generate a Resume Analysis first before starting a Mock Interview.")
                                    navigate('/resume-analysis')
                                }
                            }}
                        >
                            <Play size={18} fill="currentColor"/> Start New Interview
                        </button>
                    </motion.div>
                </div>

                {/* History Section */}
                <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                    <motion.div 
                        className="glass-card" 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="widget-header" style={{padding: '2rem 2rem 0 2rem'}}>
                            <h3><History size={20} /> Interview History</h3>
                        </div>
                        
                        <div style={{padding: '2rem'}}>
                            {loading ? (
                                <div style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem'}}>Loading history...</div>
                            ) : historyList.length > 0 ? (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    {historyList.map(h => (
                                        <div key={h._id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                                                
                                                <div style={{
                                                    width: '56px', height: '56px', 
                                                    borderRadius: '50%', 
                                                    border: `3px solid ${h.overallScore > 75 ? '#4ade80' : h.overallScore > 50 ? '#facc15' : '#f87171'}`,
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                    background: 'var(--bg-card)'
                                                }}>
                                                    <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{h.overallScore}</span>
                                                </div>

                                                <div>
                                                    <h4 style={{margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                                        <Target size={16}/> {h.targetRole}
                                                    </h4>
                                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                                        {new Date(h.createdAt).toLocaleDateString()} at {new Date(h.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                                <div style={{textAlign: 'right', marginRight: '1rem'}}>
                                                    <span style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Questions</span>
                                                    <span style={{fontWeight: 'bold'}}>{h.qnaHistory?.length || 0} Answered</span>
                                                </div>
                                                <button className="button secondary-button" onClick={() => navigate(`/mock-interview-report/${h._id}`)}>
                                                    View Report <ArrowRight size={16}/>
                                                </button>
                                                <button className="button" style={{padding: '0.5rem', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)'}} onClick={() => handleDelete(h._id)}>
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                                    <Brain size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
                                    <h2 style={{color: 'var(--text-primary)', marginBottom: '0.5rem'}}>No mock interviews completed.</h2>
                                    <p style={{marginBottom: '2rem'}}>Start a mock interview to get AI feedback on your answers.</p>
                                    <button className="button primary-button" onClick={() => {
                                        if (reports && reports.length > 0) {
                                            navigate(`/mock-interview/${reports[0]._id}`)
                                        } else {
                                            alert("Please generate a Resume Analysis first before starting a Mock Interview.")
                                            navigate('/resume-analysis')
                                        }
                                    }} style={{margin: '0 auto'}}>
                                        <Play size={16} fill="currentColor" style={{marginRight: '0.5rem'}}/> Start Mock Interview
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default AIInterviewPage
