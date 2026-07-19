import React, { useState } from 'react'
import { User, FileText, History, Settings, Download, Trash2, MapPin, Mail, Briefcase, CheckCircle2, ArrowRight, Upload, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import EditProfileModal from './EditProfileModal'

const ProfileTab = ({ user, extendedProfile, setExtendedProfile, reports, getResumePdf, deleteReport, historyList = [] }) => {
    const navigate = useNavigate()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const getInitial = () => user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    const latestReport = reports && reports.length > 0 ? reports[0] : null;
    const latestResumeScore = latestReport?.matchScore || 0;
    const hasResume = !!latestReport?.resume;

    // ── 1. Profile Completion Checklist ──
    const checklist = [
        { label: "Account Created", completed: true },
        { label: "Resume Uploaded", completed: hasResume },
        { label: "Resume Analysis Completed", completed: reports && reports.length > 0 },
        { label: "AI Interview Completed", completed: historyList && historyList.length > 0 },
        { label: "Profile Information Updated", completed: !!(extendedProfile?.name || extendedProfile?.targetRole || extendedProfile?.location) }
    ]
    const completedCount = checklist.filter(item => item.completed).length
    const completionPercentage = Math.round((completedCount / checklist.length) * 100)

    // ── 2. Combined Activity Feed ──
    const activities = []
    if (reports) {
        reports.forEach(r => {
            activities.push({
                id: r._id,
                type: 'resume',
                title: `Resume Analyzed: ${r.title || 'Role'}`,
                date: new Date(r.createdAt),
                path: `/interview/${r._id}`
            })
        })
    }
    if (historyList) {
        historyList.forEach(h => {
            activities.push({
                id: h._id,
                type: 'interview',
                title: `Completed Mock Interview: ${h.targetRole}`,
                date: new Date(h.createdAt),
                path: `/mock-interview-report/${h._id}`
            })
        })
    }
    const sortedActivities = activities.sort((a, b) => b.date - a.date).slice(0, 5)

    // ── 3. Skills from Latest Resume Analysis ──
    const skillsList = latestReport?.skillGaps 
        ? latestReport.skillGaps.map(g => g.skill)
        : [];

    const animationProps = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
    };

    return (
        <div className="page-grid">
            {/* ── Main Content Column ── */}
            <div className="main-content-col">
                
                {/* Profile Hero */}
                <motion.div className="glass-card profile-hero" {...animationProps}>
                    <div className="hero-background" style={{height: '100px'}}></div>
                    <div className="hero-content">
                        <div className="hero-left">
                            <div className="avatar-wrapper">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="hero-avatar" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="hero-avatar placeholder">{getInitial()}</div>
                                )}
                            </div>
                            <div className="hero-info">
                                <h1>{extendedProfile.name || user?.username || 'Guest User'}</h1>
                                {extendedProfile.targetRole && <h3 className="target-role">{extendedProfile.targetRole}</h3>}
                                
                                <div className="hero-meta">
                                    {extendedProfile.location && <span className="meta-item"><MapPin size={16}/> {extendedProfile.location}</span>}
                                    <span className="meta-item"><Mail size={16}/> {user?.email}</span>
                                    {extendedProfile.degree && <span className="meta-item"><Briefcase size={16}/> {extendedProfile.degree}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="hero-right">
                            <button className="button primary-button edit-btn" onClick={() => setIsEditModalOpen(true)}>
                                <Settings size={18} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Professional Bio */}
                <motion.div className="glass-card" style={{padding: '2rem'}} {...animationProps} transition={{delay: 0.05}}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.2rem'}}><User size={18}/> Professional Bio</h3>
                    {extendedProfile.bio ? (
                        <p style={{color: 'var(--text-secondary)', lineHeight: '1.6'}}>{extendedProfile.bio}</p>
                    ) : (
                        <div className="empty-state" style={{padding: '1rem', color: 'var(--text-secondary)'}}>
                            <p>No bio added. Click Edit Profile to add your background details.</p>
                        </div>
                    )}
                </motion.div>

                {/* Profile Overview Section */}
                <motion.div className="glass-card" style={{padding: '2rem'}} {...animationProps} transition={{delay: 0.1}}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', fontSize: '1.2rem'}}><User size={18}/> Profile Overview</h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem'}}>
                        <div style={{background: 'var(--bg-page)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                            <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Total Resume Analyses</span>
                            <span style={{display: 'block', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#60a5fa'}}>{reports?.length || 0}</span>
                        </div>
                        <div style={{background: 'var(--bg-page)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                            <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Total AI Interviews</span>
                            <span style={{display: 'block', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#4ade80'}}>{historyList?.length || 0}</span>
                        </div>
                        <div style={{background: 'var(--bg-page)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                            <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Member Since</span>
                            <span style={{display: 'block', fontSize: '1.1rem', fontWeight: '600', marginTop: '0.9rem', color: 'var(--text-primary)'}}>
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Resume Management */}
                <motion.div className="glass-card" style={{padding: '2rem'}} {...animationProps} transition={{delay: 0.15}}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.2rem'}}><FileText size={18}/> Resume</h3>
                    {hasResume ? (
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-page)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                <div style={{width: '48px', height: '48px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 style={{margin: '0 0 0.25rem 0'}}>{latestReport.resume || 'Uploaded Resume'}</h4>
                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                        <Calendar size={12}/> Analyzed on {new Date(latestReport.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{display: 'block', fontSize: '1.5rem', fontWeight: '700', color: latestResumeScore > 75 ? '#4ade80' : '#facc15'}}>{latestResumeScore}%</span>
                                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>ATS Score</span>
                                </div>
                                <div style={{width: '1px', height: '40px', background: 'var(--border-color)', margin: '0 1rem'}}></div>
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button className="button secondary-button" onClick={() => navigate(`/interview/${latestReport._id}?tab=resume`)}>View</button>
                                    <button className="button" style={{padding: '0.5rem', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)'}} onClick={() => { if(window.confirm('Delete this report?')) deleteReport(latestReport._id); }}><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state" style={{padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-page)', borderRadius: '8px', border: '1px dashed var(--border-color)'}}>
                            <FileText size={40} style={{opacity: 0.3, marginBottom: '0.75rem'}} />
                            <h4 style={{color: 'var(--text-primary)', marginBottom: '0.25rem'}}>No Resume Uploaded</h4>
                            <p style={{fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto'}}>Upload your resume and pair it with a target job description to get a full ATS report and tailored questions.</p>
                            <button className="button primary-button" onClick={() => navigate('/')} style={{margin: '0 auto'}}>
                                <Upload size={16} style={{marginRight: '0.5rem'}}/> Upload Resume
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Skills Section */}
                <motion.div className="glass-card" style={{padding: '2rem'}} {...animationProps} transition={{delay: 0.2}}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.2rem'}}><CheckCircle2 size={18} color="#4ade80"/> Skills Identified</h3>
                    {skillsList.length > 0 ? (
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                            {skillsList.map((skill, i) => (
                                <span key={i} style={{padding: '0.5rem 1rem', background: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-primary)'}}>{skill}</span>
                            ))}
                        </div>
                    ) : (
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0}}>
                            Skills will appear after your first resume analysis.
                        </p>
                    )}
                </motion.div>

                {/* Recent Activity Timeline */}
                <motion.div className="glass-card" style={{padding: '2rem'}} {...animationProps} transition={{delay: 0.25}}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', fontSize: '1.2rem'}}><History size={18}/> Recent Activity</h3>
                    {sortedActivities.length > 0 ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            {sortedActivities.map(act => (
                                <div key={act.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-page)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: act.type === 'resume' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                            color: act.type === 'resume' ? '#60a5fa' : '#4ade80',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {act.type === 'resume' ? <FileText size={18}/> : <History size={18}/>}
                                        </div>
                                        <div>
                                            <p style={{margin: '0 0 0.25rem 0', fontWeight: '600', color: 'var(--text-primary)'}}>{act.title}</p>
                                            <p style={{margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{act.date.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button className="button secondary-button" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => navigate(act.path)}>
                                        View Report
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                            <p>No recent activity recorded.</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Right Sidebar Column ── */}
            <div className="right-sidebar-col">
                {/* Profile Completion Checklist widget */}
                <div className="widget glass-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <h3 style={{margin: 0, fontSize: '1rem'}}>Profile Completion</h3>
                        <span style={{fontWeight: '700', color: '#60a5fa'}}>{completionPercentage}%</span>
                    </div>
                    
                    <div style={{height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem'}}>
                        <div style={{height: '100%', width: `${completionPercentage}%`, background: '#60a5fa', borderRadius: '3px', transition: 'width 0.3s ease'}}></div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                        {checklist.map((item, idx) => (
                            <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: item.completed ? 1 : 0.4}}>
                                <CheckCircle2 size={16} color={item.completed ? '#4ade80' : 'var(--text-secondary)'} />
                                <span style={{fontSize: '0.85rem', color: 'var(--text-primary)'}}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="widget glass-card">
                    <div className="widget-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                        <button className="button primary-button" style={{width: '100%', justifyContent: 'space-between'}} onClick={() => navigate('/')}>
                            Upload Resume <ArrowRight size={16}/>
                        </button>
                        <button className="button secondary-button" style={{width: '100%', justifyContent: 'space-between'}} onClick={() => navigate('/ai-interview')}>
                            Mock Interviews <ArrowRight size={16}/>
                        </button>
                    </div>
                </div>
            </div>

            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                user={user}
                onSave={(data) => setExtendedProfile(data)}
            />
        </div>
    )
}

export default ProfileTab
