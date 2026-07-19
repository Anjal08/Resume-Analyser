import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Settings, Shield, Bell, Moon, LogOut, Lock, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { changePassword } from '../features/auth/services/auth.api'
import '../features/profile/style/profile.scss'

const SettingsPage = () => {
    const navigate = useNavigate()
    const { user, handleLogout, handleDeleteAccount } = useAuth()
    const { theme, setTheme } = useTheme()
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Password states
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passLoading, setPassLoading] = useState(false)
    const [passStatus, setPassStatus] = useState(null) // { type: 'success'|'error', msg: '' }

    const handleSignOut = async () => {
        const success = await handleLogout()
        if (success) {
            setIsLogoutModalOpen(false)
            navigate('/login')
        }
    }

    const handleDeleteAccountConfirm = async () => {
        setDeleteLoading(true)
        const success = await handleDeleteAccount()
        setDeleteLoading(false)
        if (success) {
            setIsDeleteModalOpen(false)
            navigate('/register')
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setPassStatus(null)

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPassStatus({ type: 'error', msg: 'All password fields are required.' })
            return
        }

        if (newPassword !== confirmPassword) {
            setPassStatus({ type: 'error', msg: 'New password and confirm password do not match.' })
            return
        }

        if (newPassword.length < 6) {
            setPassStatus({ type: 'error', msg: 'Password must be at least 6 characters.' })
            return
        }

        setPassLoading(true)
        try {
            const res = await changePassword({ currentPassword, newPassword })
            setPassStatus({ type: 'success', msg: res.message || 'Password changed successfully.' })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setTimeout(() => {
                setIsModalOpen(false)
                setPassStatus(null)
            }, 1500)
        } catch (err) {
            setPassStatus({ type: 'error', msg: err.message || 'Failed to change password. Please check your current password.' })
        } finally {
            setPassLoading(false)
        }
    }

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
    }

    const getInitial = () => user?.username ? user.username.charAt(0).toUpperCase() : 'U'

    return (
        <div className="dashboard-page profile-page">
            <div className="page-grid" style={{maxWidth: '800px', margin: '0 auto'}}>
                <div className="main-content-col" style={{gridColumn: '1 / -1'}}>
                    
                    <div className="widget-header" style={{marginBottom: '2rem'}}>
                        <h2 style={{fontSize: '1.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <Settings /> Account Settings
                        </h2>
                    </div>

                    {/* Profile Summary Header */}
                    {user && (
                        <div className="glass-card" style={{padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Avatar" style={{width: '64px', height: '64px', borderRadius: '50%'}} referrerPolicy="no-referrer" />
                            ) : (
                                <div style={{width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', fontSize: '1.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    {getInitial()}
                                </div>
                            )}
                            <div>
                                <h3 style={{fontSize: '1.4rem', margin: '0 0 0.25rem 0', color: 'var(--text-primary)'}}>{user.username}</h3>
                                <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{user.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Security Card with Trigger Button */}
                    <div className="glass-card" style={{padding: '2rem', marginBottom: '2rem'}}>
                        <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa'}}>
                            <Shield size={20} /> Security & Privacy
                        </h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                                <div>
                                    <h4 style={{margin: '0 0 0.25rem 0'}}>Change Password</h4>
                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Update your account credentials</p>
                                </div>
                                <button className="button secondary-button" onClick={() => setIsModalOpen(true)}>
                                    <Lock size={14} style={{marginRight: '0.5rem'}}/> Update
                                </button>
                            </div>
                            
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <h4 style={{margin: '0 0 0.25rem 0'}}>Two-Factor Authentication</h4>
                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Add an extra layer of security</p>
                                </div>
                                <span style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '4px'}}>Coming Soon</span>
                            </div>
                        </div>
                    </div>

                    {/* Preferences & Theme Section */}
                    <div className="glass-card" style={{padding: '2rem', marginBottom: '2rem'}}>
                        <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc'}}>
                            <Moon size={20} /> Preferences
                        </h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                                <div>
                                    <h4 style={{margin: '0 0 0.25rem 0'}}>Dark Mode</h4>
                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Toggle dark theme on or off</p>
                                </div>
                                <button className="button secondary-button" onClick={toggleTheme}>
                                    {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="glass-card" style={{padding: '2rem', marginBottom: '2rem'}}>
                        <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15'}}>
                            <Bell size={20} /> Notifications
                        </h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', opacity: 0.5}}>
                                <div>
                                    <h4 style={{margin: '0 0 0.25rem 0'}}>Email Notifications <span style={{fontSize: '0.8rem', marginLeft: '0.5rem', color: '#facc15', background: 'rgba(250,204,21,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px'}}>Disabled</span></h4>
                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Receive weekly progress reports (Coming Soon)</p>
                                </div>
                                <input type="checkbox" disabled />
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5}}>
                                <div>
                                    <h4 style={{margin: '0 0 0.25rem 0'}}>Interview Reminders <span style={{fontSize: '0.8rem', marginLeft: '0.5rem', color: '#facc15', background: 'rgba(250,204,21,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px'}}>Disabled</span></h4>
                                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Get notified to practice before real interviews (Coming Soon)</p>
                                </div>
                                <input type="checkbox" disabled />
                            </div>
                        </div>
                    </div>

                    {/* Logout / Danger Zone */}
                    <div className="glass-card" style={{padding: '2rem', border: '1px solid rgba(248, 113, 113, 0.2)', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171'}}>
                            Danger Zone
                        </h3>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(248, 113, 113, 0.1)'}}>
                            <div>
                                <h4 style={{margin: '0 0 0.25rem 0', color: 'var(--text-primary)'}}>Log Out</h4>
                                <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Sign out of your account session</p>
                            </div>
                            <button 
                                className="button" 
                                style={{background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)'}}
                                onClick={() => setIsLogoutModalOpen(true)}
                            >
                                <LogOut size={16} style={{marginRight: '0.5rem', display: 'inline'}}/> Sign Out
                            </button>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <h4 style={{margin: '0 0 0.25rem 0', color: '#ef4444'}}>Delete Account</h4>
                                <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Permanently delete your account and all data</p>
                            </div>
                            <button 
                                className="button" 
                                style={{background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)'}}
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <Trash2 size={16} style={{marginRight: '0.5rem', display: 'inline'}}/> Delete Account
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── CHANGE PASSWORD POPUP MODAL ── */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, padding: '1.5rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '450px', width: '100%', padding: '2rem', 
                        position: 'relative', border: '1px solid var(--border-color)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <button 
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            onClick={() => { setIsModalOpen(false); setPassStatus(null); }}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa'}}>
                            <Lock size={20} /> Change Password
                        </h3>
                        
                        <form onSubmit={handlePasswordChange} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Current Password</label>
                                <input 
                                    type="password" 
                                    className="panel__textarea" 
                                    style={{minHeight: '40px', padding: '0.5rem 1rem'}}
                                    value={currentPassword} 
                                    onChange={e => setCurrentPassword(e.target.value)} 
                                />
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>New Password</label>
                                <input 
                                    type="password" 
                                    className="panel__textarea" 
                                    style={{minHeight: '40px', padding: '0.5rem 1rem'}}
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                />
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className="panel__textarea" 
                                    style={{minHeight: '40px', padding: '0.5rem 1rem'}}
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                />
                            </div>

                            {passStatus && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                    padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem',
                                    background: passStatus.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                                    color: passStatus.type === 'success' ? '#4ade80' : '#f85149'
                                }}>
                                    {passStatus.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                                    {passStatus.msg}
                                </div>
                            )}

                            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                                <button type="button" className="button secondary-button" style={{flex: 1}} onClick={() => { setIsModalOpen(false); setPassStatus(null); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="button primary-button" style={{flex: 1}} disabled={passLoading}>
                                    {passLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── LOGOUT CONFIRMATION POPUP MODAL ── */}
            {isLogoutModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, padding: '1.5rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '400px', width: '100%', padding: '2rem', 
                        position: 'relative', border: '1px solid var(--border-color)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center'
                    }}>
                        <button 
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            onClick={() => setIsLogoutModalOpen(false)}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            width: '48px', height: '48px',
                            background: 'rgba(248, 113, 113, 0.1)',
                            borderRadius: '50%', color: '#f87171',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <LogOut size={24} />
                        </div>

                        <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>Confirm Logout</h3>
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem'}}>Are you sure you want to log out of your session?</p>

                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button type="button" className="button secondary-button" style={{flex: 1}} onClick={() => setIsLogoutModalOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="button" style={{flex: 1, background: '#f87171', color: '#fff'}} onClick={handleSignOut}>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE ACCOUNT CONFIRMATION POPUP MODAL ── */}
            {isDeleteModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, padding: '1.5rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '400px', width: '100%', padding: '2rem', 
                        position: 'relative', border: '1px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)', textAlign: 'center'
                    }}>
                        <button 
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            width: '48px', height: '48px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderRadius: '50%', color: '#ef4444',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <AlertCircle size={24} />
                        </div>

                        <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ef4444'}}>Delete Account?</h3>
                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem'}}>
                            Are you absolutely sure? This action is permanent and will delete all your data and interview reports forever.
                        </p>

                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button type="button" className="button secondary-button" style={{flex: 1}} onClick={() => setIsDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="button" style={{flex: 1, background: '#ef4444', color: '#fff'}} onClick={handleDeleteAccountConfirm} disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SettingsPage
