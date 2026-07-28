import React, { useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { 
    Download, Target, PlayCircle, Clock, CheckCircle2, 
    AlertCircle, FileText, Calendar, BrainCircuit, History 
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

    const missingSkills = report.skillGaps ? report.skillGaps.filter(g => g.severity === 'high' || g.severity === 'medium') : [];
    const matchedSkills = report.skillGaps ? report.skillGaps.filter(g => g.severity === 'low') : [];
    
    // Fallback parsing if backend roadmap/profile wasn't generated
    const roadmap = report.roadmap || report.preparationPlan || [];
    const resumeProfile = report.resumeProfile || {};

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
                    <p className="stat-label">ATS Score</p>
                    <h3 className={`stat-value ${report.matchScore > 75 ? 'text-success' : 'text-warning'}`}>
                        {report.matchScore}%
                    </h3>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Resume Score</p>
                    <h3 className="stat-value text-primary">
                        {resumeProfile.proficiency || 'Intermediate'}
                    </h3>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Missing Skills</p>
                    <h3 className="stat-value text-danger">{missingSkills.length}</h3>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Matched Skills</p>
                    <h3 className="stat-value text-success">{matchedSkills.length}</h3>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Questions Generated</p>
                    <h3 className="stat-value">
                        {(report.technicalQuestions?.length || 0) + (report.behavioralQuestions?.length || 0)}
                    </h3>
                </div>
            </motion.section>

            {/* 3. Skill Gap Analysis */}
            <motion.section className="content-section" variants={itemVariants}>
                <h2 className="section-title"><Target size={20}/> Skill Gap Analysis</h2>
                <div className="card large-card skill-analysis">
                    <div className="skill-group">
                        <h4 className="group-title text-danger">Critical Missing Skills</h4>
                        <div className="chip-container">
                            {missingSkills.length > 0 ? missingSkills.map((gap, i) => (
                                <span key={i} className="chip chip-danger">{gap.skill}</span>
                            )) : <p className="empty-text">No critical skills missing.</p>}
                        </div>
                    </div>
                    
                    <div className="skill-group">
                        <h4 className="group-title text-success">Matched Skills</h4>
                        <div className="chip-container">
                            {matchedSkills.length > 0 ? matchedSkills.map((gap, i) => (
                                <span key={i} className="chip chip-success">{gap.skill}</span>
                            )) : <p className="empty-text">No matches found.</p>}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 4. AI Preparation Roadmap */}
            <motion.section className="content-section" variants={itemVariants}>
                <h2 className="section-title"><Clock size={20}/> AI Preparation Roadmap</h2>
                <div className="roadmap-timeline">
                    {roadmap.map((step, i) => (
                        <div key={i} className="timeline-item card">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <h4>{step.roundNumber ? `Round ${step.roundNumber}` : `Day ${step.day}`}</h4>
                                    <span className="badge">{step.difficultyTarget || step.focus || 'Focus'}</span>
                                </div>
                                <p className="timeline-topic">{step.assignedTopic || (step.tasks && step.tasks.join(', ')) || 'General Review'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* 5. Mock Interview Preview */}
            <motion.section className="content-section" variants={itemVariants}>
                <h2 className="section-title"><FileText size={20}/> Mock Interview Preview</h2>
                <div className="preview-grid">
                    {report.technicalQuestions?.slice(0, 3).map((q, i) => (
                        <div key={i} className="card question-card">
                            <div className="q-header">
                                <span className="q-badge">Technical</span>
                            </div>
                            <p className="q-text">{q.question}</p>
                            <p className="q-intention"><strong>Focus:</strong> {q.intention}</p>
                        </div>
                    ))}
                    {report.behavioralQuestions?.slice(0, 2).map((q, i) => (
                        <div key={i} className="card question-card">
                            <div className="q-header">
                                <span className="q-badge behavioral">Behavioral</span>
                            </div>
                            <p className="q-text">{q.question}</p>
                            <p className="q-intention"><strong>Focus:</strong> {q.intention}</p>
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