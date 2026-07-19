import React from 'react'
import './LearningHub.scss'
import { CheckCircle2, Circle, Clock, PlayCircle, Sparkles, BookOpen, ExternalLink, Brain, Target } from 'lucide-react'

const LearningHub = () => {
    return (
        <div className="learning-hub">
            {/* Top Grid: Focus Score & Recommended Topics */}
            <div className="hub-grid">
                
                {/* Focus Score Card */}
                <div className="hub-card glass-card">
                    <h3><Target size={20} color="#4ade80" /> Focus Score</h3>
                    
                    <div className="focus-score">
                        <span className="score-val">72%</span>
                        <span className="score-lbl">Ready</span>
                    </div>

                    <div className="goal-section">
                        <h4>Current Goal</h4>
                        <p>Become Interview Ready in 14 Days</p>
                    </div>

                    <div className="goal-section" style={{marginBottom: 0}}>
                        <h4>Today's Goal</h4>
                        <div className="checklist">
                            <div className="check-item">
                                <CheckCircle2 className="check-icon completed" size={20} />
                                <span>Complete SQL Roadmap</span>
                            </div>
                            <div className="check-item">
                                <Circle className="check-icon" size={20} />
                                <span>Practice 2 Interview Questions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommended Topics Card */}
                <div className="hub-card glass-card">
                    <h3><Brain size={20} color="#a78bfa" /> Recommended Topics</h3>
                    
                    <div className="topic-list">
                        <div className="topic-item">
                            <div className="topic-header">
                                <span className="t-name">SQL</span>
                                <span className="t-val">65%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        
                        <div className="topic-item">
                            <div className="topic-header">
                                <span className="t-name">System Design</span>
                                <span className="t-val">30%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                        
                        <div className="topic-item">
                            <div className="topic-header">
                                <span className="t-name">Operating System</span>
                                <span className="t-val">80%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                        
                        <div className="topic-item">
                            <div className="topic-header">
                                <span className="t-name">DBMS</span>
                                <span className="t-val">55%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '55%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Recommendation Highlight */}
            <div className="ai-recommendation">
                <h3><Sparkles size={20} /> AI Recommendation</h3>
                <p className="ai-text">
                    Based on your last interview: You struggled with <strong>SQL joins</strong> and <strong>API rate limiting</strong>.
                    I recommend focusing on these topics today to improve your overall readiness score.
                </p>
                <div className="rec-tags">
                    <span className="r-tag"><CheckCircle2 size={14} /> SQL</span>
                    <span className="r-tag"><CheckCircle2 size={14} /> REST APIs</span>
                </div>
                <div className="study-time">
                    <Clock size={16} /> Estimated study time: 2 hours today.
                </div>
            </div>

            {/* Bottom Grid: Roadmap & Resources */}
            <div className="hub-grid">
                
                {/* 14-Day Roadmap */}
                <div className="hub-card glass-card">
                    <h3><Clock size={20} color="#58a6ff" /> 14-Day Roadmap</h3>
                    
                    <div className="roadmap-timeline">
                        <div className="roadmap-day">
                            <div className="day-icon completed"><CheckCircle2 size={14} /></div>
                            <div className="day-content">
                                <span className="day-lbl">Day 1</span>
                                <span className="day-title">SQL Basics</span>
                            </div>
                        </div>
                        
                        <div className="roadmap-day">
                            <div className="day-icon completed"><CheckCircle2 size={14} /></div>
                            <div className="day-content">
                                <span className="day-lbl">Day 2</span>
                                <span className="day-title">Joins</span>
                            </div>
                        </div>
                        
                        <div className="roadmap-day">
                            <div className="day-icon current"><PlayCircle size={14} /></div>
                            <div className="day-content">
                                <span className="day-lbl">Day 3 (Today)</span>
                                <span className="day-title" style={{color: '#58a6ff'}}>Indexing</span>
                            </div>
                        </div>
                        
                        <div className="roadmap-day faded">
                            <div className="day-icon"><Circle size={14} /></div>
                            <div className="day-content">
                                <span className="day-lbl">Day 4</span>
                                <span className="day-title">System Design</span>
                            </div>
                        </div>
                        
                        <div className="roadmap-day faded">
                            <div className="day-icon"><Circle size={14} /></div>
                            <div className="day-content">
                                <span className="day-lbl">Day 5</span>
                                <span className="day-title">REST APIs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning Resources */}
                <div className="hub-card glass-card">
                    <h3><BookOpen size={20} color="#facc15" /> Learning Resources</h3>
                    
                    <div className="resources-grid">
                        <button className="resource-btn">
                            <PlayCircle size={20} />
                            SQL Tutorial
                            <ExternalLink size={16} style={{marginLeft: 'auto'}} />
                        </button>
                        
                        <button className="resource-btn">
                            <BookOpen size={20} />
                            React Interview Questions
                            <ExternalLink size={16} style={{marginLeft: 'auto'}} />
                        </button>
                        
                        <button className="resource-btn">
                            <BookOpen size={20} />
                            Node.js Guide
                            <ExternalLink size={16} style={{marginLeft: 'auto'}} />
                        </button>
                        
                        <button className="resource-btn">
                            <PlayCircle size={20} />
                            REST API Best Practices
                            <ExternalLink size={16} style={{marginLeft: 'auto'}} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

// Target icon is missing from import, adding it here or just using another icon
// Wait, I should import Target from lucide-react above
export default LearningHub
