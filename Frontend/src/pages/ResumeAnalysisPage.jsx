import React, { useState } from 'react'
import { History, FileText, ArrowRight, Trash2, X, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useInterview } from '../features/interview/hooks/useInterview'
import '../features/profile/style/profile.scss'

const ResumeAnalysisPage = () => {
    const navigate = useNavigate()
    const { reports, deleteReport } = useInterview()
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [reportToDelete, setReportToDelete] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleDeleteReportConfirm = async () => {
        if (!reportToDelete) return
        setDeleteLoading(true)
        await deleteReport(reportToDelete)
        setDeleteLoading(false)
        setDeleteModalOpen(false)
        setReportToDelete(null)
    }

    return (
        <div className="dashboard-page profile-page">
            <div className="page-grid">
                <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                    <motion.div 
                        className="glass-card" 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="widget-header" style={{padding: '2rem 2rem 0 2rem'}}>
                            <h3><History size={20} /> Resume Analysis History</h3>
                        </div>
                        
                        <div style={{padding: '2rem'}}>
                            {reports && reports.length > 0 ? (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    {reports.map(r => (
                                        <div key={r._id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                                <div style={{width: '48px', height: '48px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <h4 style={{margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                                        {r.title || 'Role'}
                                                    </h4>
                                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                                        Analyzed on {new Date(r.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
                                                <div style={{textAlign: 'right'}}>
                                                    <span style={{display: 'block', fontSize: '1.5rem', fontWeight: '700', color: r.matchScore > 75 ? '#4ade80' : '#facc15'}}>{r.matchScore}%</span>
                                                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>ATS Score</span>
                                                </div>
                                                <div style={{width: '1px', height: '40px', background: 'var(--border-color)'}}></div>
                                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                                    <button className="button secondary-button" onClick={() => navigate(`/interview/${r._id}`)}>
                                                        View Report <ArrowRight size={16}/>
                                                    </button>
                                                    <button className="button" style={{padding: '0.5rem', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)'}} onClick={() => { setReportToDelete(r._id); setDeleteModalOpen(true); }}>
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                                    <FileText size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
                                    <h2 style={{color: 'var(--text-primary)', marginBottom: '0.5rem'}}>No analyses generated yet.</h2>
                                    <p style={{marginBottom: '2rem'}}>Upload a resume to get your first AI analysis.</p>
                                    <button className="button primary-button" onClick={() => navigate('/')} style={{margin: '0 auto'}}>
                                        Go to Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── DELETE REPORT CONFIRMATION POPUP MODAL ── */}
            {deleteModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, padding: '1.5rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '400px', width: '100%', padding: '2rem', 
                        position: 'relative', border: '1px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)', textAlign: 'center'
                    }}>
                        <button 
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            onClick={() => { setDeleteModalOpen(false); setReportToDelete(null); }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            width: '48px', height: '48px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderRadius: '50%', color: '#ef4444',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <AlertCircle size={24} />
                        </div>

                        <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ef4444'}}>Delete Analysis Report?</h3>
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem'}}>
                            Are you sure you want to delete this resume analysis report? This action cannot be undone.
                        </p>

                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button type="button" className="button secondary-button" style={{flex: 1}} onClick={() => { setDeleteModalOpen(false); setReportToDelete(null); }}>
                                Cancel
                            </button>
                            <button type="button" className="button" style={{flex: 1, background: '#ef4444', color: '#fff'}} onClick={handleDeleteReportConfirm} disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResumeAnalysisPage
