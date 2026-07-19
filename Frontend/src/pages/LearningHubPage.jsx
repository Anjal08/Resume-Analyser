import React, { useEffect, useState } from 'react'
import { BookOpen, BrainCircuit, ExternalLink, AlertTriangle } from 'lucide-react'
import { useInterview } from '../features/interview/hooks/useInterview'
import '../features/profile/style/profile.scss'

const LearningHubPage = () => {
    const { getHistory } = useInterview()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const data = await getHistory()
            if (data) {
                setHistory(data)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="dashboard-page profile-page" style={{padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading Recommendations...</div>
    }

    // Extract unique improvements across all history
    const allImprovements = history.flatMap(h => h.improvements || [])
    const uniqueImprovements = [...new Set(allImprovements)].slice(0, 5) // top 5 unique weaknesses

    return (
        <div className="dashboard-page profile-page">
            <div className="page-grid" style={{maxWidth: '1000px', margin: '0 auto'}}>
                <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                    
                    <div className="widget-header" style={{marginBottom: '2rem'}}>
                        <h2 style={{fontSize: '1.8rem', color: 'var(--text-primary)'}}><BookOpen style={{display: 'inline', marginRight: '0.5rem'}}/> Personalized Learning Hub</h2>
                        <p style={{color: 'var(--text-secondary)'}}>AI-curated learning paths based on your mock interview weaknesses.</p>
                    </div>

                    <div className="glass-card" style={{padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(248, 113, 113, 0.2)'}}>
                        <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171'}}>
                            <AlertTriangle size={20} /> Identified Weaknesses
                        </h3>
                        {uniqueImprovements.length > 0 ? (
                            <ul style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)'}}>
                                {uniqueImprovements.map((imp, idx) => (
                                    <li key={idx}>{imp}</li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{color: 'var(--text-secondary)'}}>Complete a mock interview to identify your weak areas.</p>
                        )}
                    </div>

                    <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)'}}>
                        <BrainCircuit size={20} /> Recommended Resources
                    </h3>

                    {uniqueImprovements.length > 0 ? (
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                            {/* Dynamically generating mock resource cards based on weaknesses */}
                            {uniqueImprovements.map((imp, idx) => {
                                const topic = imp.split(" ")[0] || "General"
                                return (
                                    <div key={idx} className="glass-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                        <div style={{background: 'rgba(96, 165, 250, 0.1)', padding: '0.5rem 1rem', borderRadius: '4px', width: 'fit-content', color: '#60a5fa', fontSize: '0.8rem'}}>
                                            {topic} Concept
                                        </div>
                                        <h4 style={{fontSize: '1.1rem'}}>{`Mastering ${topic}`}</h4>
                                        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1}}>
                                            Targeted practice to address: "{imp}"
                                        </p>
                                        <button className="button secondary-button" style={{width: '100%', justifyContent: 'center'}}>
                                            View Resource <ExternalLink size={14} style={{marginLeft: '0.5rem'}}/>
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="glass-card" style={{padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                            <BookOpen size={48} style={{opacity: 0.2, margin: '0 auto 1rem auto'}} />
                            <p>Once you complete a mock interview, personalized study materials will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LearningHubPage
