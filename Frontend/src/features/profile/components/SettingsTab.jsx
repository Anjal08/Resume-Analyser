import React from 'react'
import { Settings, User, Lock, Bell, Shield, Trash2, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../auth/hooks/useAuth'

const SettingsTab = () => {
    const { user } = useAuth()

    return (
        <div className="page-grid">
            <div className="main-content-col" style={{gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto'}}>
                <motion.div 
                    className="glass-card" 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="widget-header" style={{padding: '2rem 2rem 0 2rem'}}>
                        <h3><Settings size={20} /> Account Settings</h3>
                    </div>
                    
                    <div style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                        
                        {/* Personal Info */}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem'}}><User size={16}/> Personal Information</h4>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                    <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Username</label>
                                    <input type="text" className="panel__textarea" value={user?.username || ''} readOnly style={{minHeight: '40px', height: '40px'}} />
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                    <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Email Address</label>
                                    <input type="text" className="panel__textarea" value={user?.email || ''} readOnly style={{minHeight: '40px', height: '40px'}} />
                                </div>
                            </div>
                        </div>

                        <hr style={{borderColor: 'var(--border-color)', opacity: 0.5}} />

                        {/* Password */}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem'}}><Lock size={16}/> Password</h4>
                            <button className="button secondary-button" style={{width: 'fit-content'}}>Change Password</button>
                        </div>

                        <hr style={{borderColor: 'var(--border-color)', opacity: 0.5}} />

                        {/* Theme */}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem'}}><Moon size={16}/> Theme</h4>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <button className="button primary-button" style={{width: 'fit-content'}}>Dark Mode</button>
                                <button className="button secondary-button" style={{width: 'fit-content', opacity: 0.5}}>Light Mode</button>
                            </div>
                        </div>

                        <hr style={{borderColor: 'var(--border-color)', opacity: 0.5}} />

                        {/* Notifications */}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem'}}><Bell size={16}/> Notifications</h4>
                            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                                <input type="checkbox" defaultChecked /> Email me when a new AI analysis is ready
                            </label>
                        </div>

                        <hr style={{borderColor: 'var(--border-color)', opacity: 0.5}} />

                        {/* Privacy & Delete */}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem'}}><Shield size={16}/> Privacy & Data</h4>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(248, 113, 113, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.2)'}}>
                                <div>
                                    <h5 style={{margin: '0 0 0.25rem 0', color: '#f87171'}}>Delete Account</h5>
                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Permanently delete your account and all resume data.</p>
                                </div>
                                <button className="button" style={{background: '#f87171', color: '#fff', border: 'none'}} onClick={() => window.confirm('Are you absolutely sure?')}>
                                    <Trash2 size={16} /> Delete Account
                                </button>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default SettingsTab
