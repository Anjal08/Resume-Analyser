import React from 'react'
import { Mic, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'

const HistoryTab = () => {
    const navigate = useNavigate()

    return (
        <div className="page-grid">
            <div className="main-content-col">
                <motion.div 
                    className="glass-card" 
                    style={{padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)'}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Mic size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
                    <h2 style={{color: 'var(--text-primary)', marginBottom: '0.5rem'}}>No interviews completed yet.</h2>
                    <p style={{marginBottom: '2rem'}}>You have not completed any AI mock interview sessions.</p>
                    
                    <button className="button primary-button" onClick={() => navigate('/')} style={{margin: '0 auto'}}>
                        Start First Interview <ArrowRight size={18}/>
                    </button>
                </motion.div>
            </div>
            
            <div className="right-sidebar-col">
                <div className="widget glass-card">
                    <div className="widget-header">
                        <h3>Recent Interviews</h3>
                    </div>
                    <div className="empty-state" style={{padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                        <p>No recent interviews.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HistoryTab
