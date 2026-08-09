import React, { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { 
    Download, Target, PlayCircle, Clock, CheckCircle2, 
    AlertCircle, FileText, Calendar, BrainCircuit, History,
    Check, ChevronDown, ChevronUp, AlertTriangle, XCircle, Info
} from 'lucide-react'

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
}

const Interview = () => {
    const navigate = useNavigate()
    const { report, getReportById, loading, reports, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    const [expandedMatches, setExpandedMatches] = useState({});
    const [showAllStrong, setShowAllStrong] = useState(false);
    const [showAllPartial, setShowAllPartial] = useState(false);

    const toggleMatch = (id) => {
        setExpandedMatches(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    if (loading || !report) {
        return (
            <div className="report-loading">
                <BrainCircuit className="spinner" size={40} />
                <p>Loading your AI Analysis...</p>
            </div>
        )
    }

    const strongMatches = report.skillAnalysis?.strongMatches || (report.matchedSkills 
        ? report.matchedSkills.map(skill => ({ skill })) 
        : (report.skillGaps ? report.skillGaps.filter(g => g.severity === 'low') : []));
    
    const partialMatches = report.skillAnalysis?.partialMatches || [];
    
    const missingSkills = report.skillAnalysis?.missingSkills || (report.skillGaps ? report.skillGaps.filter(g => g.severity === 'high' || g.severity === 'medium') : []);
    
    const requiredMissing = missingSkills.filter(m => m.type !== 'PREFERRED_NOT_EVIDENCED' && m.type !== 'ADVANCED_OPTIONAL');
    const preferredMissing = missingSkills.filter(m => m.type === 'PREFERRED_NOT_EVIDENCED' || m.type === 'ADVANCED_OPTIONAL');

    const visibleStrong = showAllStrong ? strongMatches : strongMatches.slice(0, 4);
    const visiblePartial = showAllPartial ? partialMatches : partialMatches.slice(0, 3);

    // Fallback parsing if backend roadmap/profile wasn't generated
    const roadmap = report.preparationPlan || report.roadmap || [];
    const resumeProfile = report.resumeProfile || {};
    
    // Fallback questions array
    const questions = report.interviewQuestions?.length > 0 ? report.interviewQuestions : 
                     (report.technicalQuestions || []).concat(report.behavioralQuestions || []);

    const handleStartInterview = () => navigate(`/mock-interview/${interviewId}`)
    const handleDownloadPdf = () => getResumePdf(interviewId, 'Classic ATS', '')

    return (
        <motion.div 
            className="saas-report-page"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* 1. Page Header */}
            <motion.header className="report-header" variants={itemVariants}>
                <div className="header-info">
                    <h1 className="report-title">{report.title || 'Software Engineer'}</h1>
                    <div className="report-meta">
                        <span className="meta-tag"><Calendar size={14}/> Analyzed on {new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.matchScore > 75 ? (
                            <span className="meta-tag success"><CheckCircle2 size={14}/> Interview Ready</span>
                        ) : (
                            <span className="meta-tag warning"><AlertCircle size={14}/> Needs Preparation</span>
                        )}
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={handleDownloadPdf}>
                        <Download size={16}/> Export ATS PDF
                    </button>
                    <button className="btn-primary" onClick={handleStartInterview}>
                        <PlayCircle size={16}/> Start Mock Interview
                    </button>
                </div>
            </motion.header>

            {/* 2. Quick Stats */}
            <motion.section className="quick-stats-grid" variants={itemVariants}>
                <div className="stat-card">
                    <p className="stat-label">ATS Compatibility</p>
                    <h3 className={`stat-value ${report.matchScore > 75 ? 'text-success' : 'text-warning'}`}>
                        {report.matchScore}%
                    </h3>
                </div>
                <div className="stat-card profile-stat-card">
                    <p className="stat-label">Candidate Profile</p>
                    <p className="stat-value summary-text">
                        {resumeProfile.summary || resumeProfile.proficiency || 'Intermediate candidate'}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Missing Skills</p>
                    <h3 className="stat-value text-danger">{requiredMissing.length}</h3>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Matched Skills</p>
                    <h3 className="stat-value text-success">{strongMatches.length}</h3>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Questions Generated</p>
                    <h3 className="stat-value">
                        {questions.length}
                    </h3>
                </div>
            </motion.section>

            {/* ATS Score Breakdown */}
            {report.scoreBreakdown && (
                <motion.section className="content-section" variants={itemVariants}>
                    <h2 className="section-title"><Target size={20}/> ATS Compatibility Breakdown</h2>
                    <div className="card large-card breakdown-grid">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Required Skills ({report.scoreBreakdown.requiredSkills}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.requiredSkills}%` }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Technical Skills ({report.scoreBreakdown.technicalSkills}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.technicalSkills}%` }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Project Relevance ({report.scoreBreakdown.projectRelevance}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.projectRelevance}%` }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Experience ({report.scoreBreakdown.experience}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.experience}%` }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Keyword Coverage ({report.scoreBreakdown.keywordCoverage}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.keywordCoverage}%` }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Education ({report.scoreBreakdown.education}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.education}%` }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">ATS Readability ({report.scoreBreakdown.atsReadability}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.atsReadability}%` }}></div></div>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Evidence Strength ({report.scoreBreakdown.evidenceStrength}%)</span>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${report.scoreBreakdown.evidenceStrength}%` }}></div></div>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* 3. Skill Match Analysis */}
            <motion.section className="content-section" variants={itemVariants}>
                <h2 className="section-title"><Target size={20}/> Skill Match Analysis</h2>
                <div className="card large-card skill-analysis">
                    
                    <div className="skill-group">
                        <h4 className="group-title text-success">🟢 Strong Matches</h4>
                        <div className="matches-grid">
                            {visibleStrong.length > 0 ? visibleStrong.map((match, i) => {
                                const isExpanded = expandedMatches[`strong-${i}`];
                                return (
                                    <div key={i} className="match-card">
                                        <div className="match-header">
                                            <div className="match-title-row">
                                                <div className="title-left">
                                                    <Check size={18} className="icon-success" />
                                                    <span className="match-name">{match.skill}</span>
                                                </div>
                                                {match.confidence && <div className="title-right">{match.confidence}%</div>}
                                            </div>
                                            <div className="match-meta-row">
                                                {match.category && <span className="category-badge">{match.category}</span>}
                                                <span className="short-evidence">
                                                    {Array.isArray(match.evidence) ? match.evidence[0] : match.evidence}
                                                </span>
                                            </div>
                                            <button className="expand-btn" onClick={() => toggleMatch(`strong-${i}`)}>
                                                {isExpanded ? 'Hide Evidence' : 'View Evidence'} {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                            </button>
                                        </div>
                                        <div className={`match-details ${isExpanded ? 'expanded' : ''}`}>
                                            {match.evidence && (
                                                <div className="evidence-box">
                                                    {Array.isArray(match.evidence) 
                                                        ? match.evidence.map((ev, j) => <p key={j} className="evidence-text">• {ev}</p>) 
                                                        : <p className="evidence-text">• {match.evidence}</p>}
                                                </div>
                                            )}
                                            {match.sources && match.sources.length > 0 && <p className="detail-text"><strong>Source:</strong> {match.sources.join(' + ')}</p>}
                                        </div>
                                    </div>
                                );
                            }) : <p className="empty-text">No strong matches found.</p>}
                        </div>
                        {strongMatches.length > 4 && (
                            <button className="show-more-btn" onClick={() => setShowAllStrong(!showAllStrong)}>
                                {showAllStrong ? 'Show Less' : `Show All (${strongMatches.length})`}
                            </button>
                        )}
                    </div>

                    <div className="skill-group" style={{ marginTop: '1.5rem' }}>
                        <h4 className="group-title text-warning">🟡 Partial / Related Matches</h4>
                        <div className="matches-list">
                            {visiblePartial.length > 0 ? visiblePartial.map((match, i) => {
                                const isExpanded = expandedMatches[`partial-${i}`];
                                return (
                                    <div key={i} className="match-row">
                                        <div className="match-header">
                                            <div className="title-left">
                                                <AlertTriangle size={18} className="icon-warning" />
                                                <span className="match-name">{match.skill}</span>
                                            </div>
                                            <div className="meta-center">
                                                {match.confidence && <span className="confidence-text">{match.confidence}%</span>}
                                                {match.remainingGap && <span className="priority-badge severity-medium-gap">Medium Gap</span>}
                                            </div>
                                            <div className="action-right">
                                                <button className="expand-btn" onClick={() => toggleMatch(`partial-${i}`)}>
                                                    Details {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </button>
                                            </div>
                                        </div>
                                        <div className={`match-details ${isExpanded ? 'expanded' : ''}`}>
                                            {match.evidence && (
                                                <div className="evidence-box">
                                                    {Array.isArray(match.evidence) 
                                                        ? match.evidence.map((ev, j) => <p key={j} className="evidence-text">• {ev}</p>) 
                                                        : <p className="evidence-text">• {match.evidence}</p>}
                                                </div>
                                            )}
                                            {match.remainingGap && <p className="detail-text gap-text"><strong>Remaining Gap:</strong> {match.remainingGap}</p>}
                                        </div>
                                    </div>
                                );
                            }) : <p className="empty-text">No partial matches found.</p>}
                        </div>
                        {partialMatches.length > 3 && (
                            <button className="show-more-btn" onClick={() => setShowAllPartial(!showAllPartial)}>
                                {showAllPartial ? 'Show Less' : `Show All (${partialMatches.length})`}
                            </button>
                        )}
                    </div>

                    <div className="skill-group" style={{ marginTop: '1.5rem' }}>
                        <h4 className="group-title text-danger">🔴 Required & Not Evidenced</h4>
                        <div className="matches-list">
                            {requiredMissing.length > 0 ? requiredMissing.map((match, i) => {
                                const isExpanded = expandedMatches[`required-${i}`];
                                return (
                                    <div key={i} className="match-row">
                                        <div className="match-header">
                                            <div className="title-left">
                                                <XCircle size={18} className="icon-danger" />
                                                <span className="match-name">{match.skill}</span>
                                            </div>
                                            <div className="meta-center">
                                                {match.priority && <span className={`priority-badge priority-${match.priority.toLowerCase()}`}>{match.priority} PRIORITY</span>}
                                            </div>
                                            <div className="action-right">
                                                <button className="expand-btn" onClick={() => toggleMatch(`required-${i}`)}>
                                                    Details {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </button>
                                            </div>
                                        </div>
                                        <div className={`match-details ${isExpanded ? 'expanded' : ''}`}>
                                            <p className="detail-text"><strong>Missing Evidence:</strong> Not explicitly evidenced in the resume.</p>
                                        </div>
                                    </div>
                                );
                            }) : <p className="empty-text">No critical skills missing.</p>}
                        </div>
                    </div>

                    <div className="skill-group" style={{ marginTop: '1.5rem' }}>
                        <h4 className="group-title text-secondary" style={{color: 'var(--text-secondary)'}}>⚪ Preferred / Advanced</h4>
                        <div className="matches-list">
                            {preferredMissing.length > 0 ? preferredMissing.map((match, i) => {
                                const isExpanded = expandedMatches[`preferred-${i}`];
                                return (
                                    <div key={i} className="match-row">
                                        <div className="match-header">
                                            <div className="title-left">
                                                <Info size={18} className="icon-secondary" />
                                                <span className="match-name">{match.skill}</span>
                                            </div>
                                            <div className="meta-center">
                                                {match.priority && <span className={`priority-badge priority-${match.priority.toLowerCase()}`}>{match.priority} PRIORITY</span>}
                                            </div>
                                            <div className="action-right">
                                                <button className="expand-btn" onClick={() => toggleMatch(`preferred-${i}`)}>
                                                    Details {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </button>
                                            </div>
                                        </div>
                                        <div className={`match-details ${isExpanded ? 'expanded' : ''}`}>
                                            <p className="detail-text"><strong>Information:</strong> Optional or preferred skill not explicitly evidenced.</p>
                                        </div>
                                    </div>
                                );
                            }) : <p className="empty-text">No preferred skills requested.</p>}
                        </div>
                    </div>

                </div>
            </motion.section>

            {/* 4. AI Preparation Roadmap */}
            <motion.section className="content-section" variants={itemVariants}>
                <h2 className="section-title"><Clock size={20}/> AI Preparation Roadmap</h2>
                <div className="roadmap-timeline">
                    {roadmap.length > 0 ? roadmap.map((step, i) => (
                        <div key={i} className="timeline-item card">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                        <h4>{step.sectionName || (step.roundNumber ? `Round ${step.roundNumber}` : (step.day ? `Day ${step.day}` : `Round ${i + 1}`))}</h4>
                                        <span className="badge">{step.focus || step.difficultyTarget || 'Focus'}</span>
                                    </div>
                                    {(step.priority || step.difficulty) && (
                                        <span className={`priority-badge priority-${(step.priority || step.difficulty).toLowerCase()}`}>{step.priority || step.difficulty}</span>
                                    )}
                                </div>
                                <div className="timeline-topic" style={{marginTop: '0.75rem'}}>
                                    <strong style={{color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase'}}>Preparation Topics:</strong> 
                                    <ul style={{margin: '0.5rem 0 0 1.25rem', padding: 0, color: 'var(--text-primary)', fontSize: '0.95rem'}}>
                                        {Array.isArray(step.tasks) ? step.tasks.slice(0, 5).map((t, idx) => (
                                            <li key={idx} style={{marginBottom: '0.35rem'}}>{t}</li>
                                        )) : <li>{step.assignedTopic || 'General Review'}</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )) : <p className="empty-text" style={{marginLeft: '1.5rem', color: 'var(--text-secondary)'}}>No preparation roadmap available.</p>}
                </div>
            </motion.section>

            {/* 5. Mock Interview Preview */}
            <motion.section className="content-section" variants={itemVariants}>
                <h2 className="section-title"><FileText size={20}/> Mock Interview Preview</h2>
                <div className="preview-grid">
                    {questions.slice(0, 6).map((q, i) => (
                        <div key={i} className="card question-card">
                            <div className="q-header">
                                <span className={`q-badge ${q.category?.toLowerCase() || ''}`}>{q.category || (q.intention ? 'Technical' : 'Question')}</span>
                                {q.difficulty && <span className="q-badge-difficulty">{q.difficulty}</span>}
                            </div>
                            <p className="q-text">{q.question}</p>
                            {q.reason && <p className="q-intention"><strong>Reason:</strong> {q.reason}</p>}
                            {q.intent && <p className="q-intention"><strong>Intent:</strong> {q.intent}</p>}
                            {q.priority && <p className="q-intention"><strong>Priority:</strong> <span className={`priority-badge priority-${q.priority.toLowerCase()}`}>{q.priority}</span></p>}
                            {q.relatedSkill && <p className="q-intention"><strong>Tests:</strong> {q.relatedSkill}</p>}
                            {q.strongAnswerPoints && q.strongAnswerPoints.length > 0 && (
                                <p className="q-intention" style={{marginTop: '0.5rem'}}>
                                    <strong>Strong Answer covers:</strong> 
                                    <ul style={{margin: '0.2rem 0 0 1rem', padding: 0}}>
                                        {q.strongAnswerPoints.slice(0, 3).map((p, idx) => <li key={idx}>{p}</li>)}
                                    </ul>
                                </p>
                            )}
                            {q.intention && !q.reason && !q.intent && <p className="q-intention"><strong>Focus:</strong> {q.intention}</p>}
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* 6. History */}
            <motion.section className="content-section history-section" variants={itemVariants}>
                <h2 className="section-title"><History size={20}/> Previous Reports</h2>
                <div className="history-grid">
                    {reports && reports.length > 0 ? (
                        reports.map((r) => (
                            <div 
                                key={r._id} 
                                className={`card history-card ${r._id === interviewId ? 'active' : ''}`}
                                onClick={() => navigate(`/interview/${r._id}`)}
                            >
                                <div className="history-header">
                                    <h4>{r.title || 'Role'}</h4>
                                    <span className={`score ${r.matchScore > 75 ? 'text-success' : 'text-warning'}`}>{r.matchScore}%</span>
                                </div>
                                <span className="history-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))
                    ) : (
                        <p className="empty-text">No previous reports found.</p>
                    )}
                </div>
            </motion.section>

        </motion.div>
    )
}

export default Interview