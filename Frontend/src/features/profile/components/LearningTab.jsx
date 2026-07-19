import React, { useMemo } from 'react'
import { BookOpen, AlertCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const LearningTab = ({ reports }) => {
    
    // Extract missing skills directly from the latest report
    const recommendedSkills = useMemo(() => {
        if (!reports || reports.length === 0) return [];
        const latest = reports[0];
        if (!latest.skillGaps) return [];
        
        return latest.skillGaps.map(gap => ({
            skill: gap.skill,
            severity: gap.severity,
            reason: `Identified as missing from your latest uploaded resume for the ${latest.title || 'Target'} role.`
        }));
    }, [reports]);

    return (
        <div className="page-grid">
            <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                <motion.div 
                    className="glass-card" 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="widget-header" style={{padding: '2rem 2rem 0 2rem'}}>
                        <h3><BookOpen size={20} /> Recommended Skills</h3>
                    </div>
                    
                    <div style={{padding: '2rem'}}>
                        {recommendedSkills.length > 0 ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                {recommendedSkills.map((rec, i) => (
                                    <div key={i} style={{padding: '1.5rem', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                        <div>
                                            <h4 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                                {rec.skill}
                                                <span style={{fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', background: rec.severity === 'high' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(250, 204, 21, 0.1)', color: rec.severity === 'high' ? '#f87171' : '#facc15'}}>
                                                    {rec.severity === 'high' ? 'Critical Missing Skill' : 'Recommended Addition'}
                                                </span>
                                            </h4>
                                            <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{rec.reason}</p>
                                        </div>
                                        <button className="button secondary-button" style={{padding: '0.5rem 1rem', fontSize: '0.85rem'}}>
                                            Find Resources <ArrowRight size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                                <AlertCircle size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
                                <p>No recommendations available.</p>
                                <span style={{fontSize: '0.85rem'}}>Generate an AI Resume Analysis to see which skills you should learn next.</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default LearningTab
