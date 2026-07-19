import React, { useMemo } from 'react'
import { BarChart2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const AnalyticsTab = ({ reports }) => {
    
    // Sort reports chronologically for the trend chart
    const chartData = useMemo(() => {
        if (!reports || reports.length < 2) return [];
        return [...reports].reverse().map((r, i) => ({
            name: `Analysis ${i + 1}`,
            date: new Date(r.createdAt).toLocaleDateString(),
            score: r.matchScore
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
                        <h3><BarChart2 size={20} /> ATS Score Trend</h3>
                    </div>
                    
                    <div style={{padding: '2rem'}}>
                        {chartData.length >= 2 ? (
                            <div style={{width: '100%', height: '300px'}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <RechartsTooltip cursor={{stroke: 'rgba(255,255,255,0.1)'}} contentStyle={{backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px'}} />
                                        <Line type="monotone" dataKey="score" stroke="#4ade80" strokeWidth={3} dot={{r: 4, fill: '#4ade80'}} activeDot={{r: 6}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="empty-state" style={{padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                                <BarChart2 size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
                                <p>Complete more analyses to unlock analytics.</p>
                                <span style={{fontSize: '0.85rem'}}>We need at least 2 resume analyses to show your improvement trend.</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default AnalyticsTab
