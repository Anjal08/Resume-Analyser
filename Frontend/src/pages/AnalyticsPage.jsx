import React, { useEffect, useState } from 'react'
import { BarChart2, Target, Brain, TrendingUp } from 'lucide-react'
import { useInterview } from '../features/interview/hooks/useInterview'
import '../features/profile/style/profile.scss'

const AnalyticsPage = () => {
    const { getHistory, reports } = useInterview()
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
        return <div className="dashboard-page profile-page" style={{padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading Analytics...</div>
    }

    const totalInterviews = history.length;
    const avgScore = totalInterviews > 0 
        ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / totalInterviews)
        : 0;
    
    const latestScore = totalInterviews > 0 ? history[0].overallScore : 0;
    
    // Calculate top weaknesses across all interviews
    const weaknessesMap = {};
    history.forEach(h => {
        if (h.improvements) {
            h.improvements.forEach(imp => {
                const keyword = imp.split(" ")[0].toLowerCase(); // basic grouping
                weaknessesMap[keyword] = (weaknessesMap[keyword] || 0) + 1;
            })
        }
    });

    return (
        <div className="dashboard-page profile-page">
            <div className="page-grid" style={{maxWidth: '1200px', margin: '0 auto'}}>
                <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                    <div className="widget-header" style={{marginBottom: '2rem'}}>
                        <h2 style={{fontSize: '1.8rem', color: 'var(--text-primary)'}}><BarChart2 style={{display: 'inline', marginRight: '0.5rem'}}/> Performance Analytics</h2>
                        <p style={{color: 'var(--text-secondary)'}}>Insights generated from your actual mock interviews.</p>
                    </div>

                    <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem'}}>
                        <div className="glass-card" style={{padding: '2rem', textAlign: 'center'}}>
                            <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#60a5fa'}}>{totalInterviews}</div>
                            <div style={{color: 'var(--text-secondary)'}}>Mock Interviews</div>
                        </div>
                        <div className="glass-card" style={{padding: '2rem', textAlign: 'center'}}>
                            <div style={{fontSize: '3rem', fontWeight: 'bold', color: avgScore > 75 ? '#4ade80' : avgScore > 50 ? '#facc15' : '#f87171'}}>{avgScore}</div>
                            <div style={{color: 'var(--text-secondary)'}}>Average Score</div>
                        </div>
                        <div className="glass-card" style={{padding: '2rem', textAlign: 'center'}}>
                            <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#c084fc'}}>{reports?.length || 0}</div>
                            <div style={{color: 'var(--text-secondary)'}}>Resumes Analyzed</div>
                        </div>
                        <div className="glass-card" style={{padding: '2rem', textAlign: 'center'}}>
                            <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#2dd4bf'}}>{latestScore}</div>
                            <div style={{color: 'var(--text-secondary)'}}>Latest Score</div>
                        </div>
                    </div>

                    <div className="glass-card" style={{padding: '2rem'}}>
                        <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <TrendingUp size={20} color="#facc15" /> Recent Interview Scores
                        </h3>
                        {history.length > 0 ? (
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '200px', marginTop: '2rem'}}>
                                {history.slice().reverse().map((h, i) => (
                                    <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
                                        <div style={{
                                            width: '100%', 
                                            maxWidth: '40px',
                                            background: `linear-gradient(to top, ${h.overallScore > 75 ? '#4ade80' : h.overallScore > 50 ? '#facc15' : '#f87171'}44, ${h.overallScore > 75 ? '#4ade80' : h.overallScore > 50 ? '#facc15' : '#f87171'})`,
                                            height: `${h.overallScore}%`,
                                            borderRadius: '4px 4px 0 0'
                                        }}></div>
                                        <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Int {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                                Complete a mock interview to see your score trend.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage
