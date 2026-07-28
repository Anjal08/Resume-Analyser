import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import { User, FileText, History, BarChart2, Settings, HelpCircle, LogOut, Menu, Search, Moon, Sun, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import './Header.scss'

const Header = ({ openAuthModal, setIsSidebarOpen }) => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()
    const [ isDropdownOpen, setIsDropdownOpen ] = useState(false)
    const [ theme, setTheme ] = useState('dark') // Default seems to be dark based on body
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    useEffect(() => {
        // Initialize theme based on document attribute or localStorage
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(currentTheme);
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    const handleNotificationClick = () => {
        toast("No new notifications.", { icon: '🔔' });
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            toast.success(`Searching for: ${e.target.value}`);
            e.target.value = '';
            e.target.blur();
        }
    }

    const onLogout = async () => {
        if (window.confirm("Are you sure you want to logout?")) {
            await handleLogout()
            navigate('/')
        }
    }

    const navigateToPage = (e, path) => {
        e.stopPropagation()
        setIsDropdownOpen(false)
        navigate(path)
    }

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const getInitial = () => user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    const formatName = (name) => {
        if (!name) return 'Anjali';
        const n = name.split(' ')[0];
        return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    };

    return (
        <header className='top-nav'>
            <button 
                className="mobile-menu-btn" 
                onClick={() => setIsSidebarOpen(true)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Menu size={24} />
            </button>
            
            <div className="header-search">
                <Search size={16} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    ref={searchInputRef}
                    onKeyDown={onSearchSubmit}
                />
                <span className="search-shortcut">⌘K</span>
            </div>

            <div className='nav-spacer' />
            
            <div className="header-actions">
                <button className="icon-btn" title="Toggle Theme" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
                </button>
                <button className="icon-btn" title="Notifications" onClick={handleNotificationClick}>
                    <Bell size={18}/>
                </button>
            </div>
            
            {!user ? (
                <div className='auth-buttons' style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className='button secondary-button' onClick={() => navigate('/login')} style={{ padding: '0.5rem 1rem' }}>Login</button>
                    <button className='button primary-button' onClick={() => navigate('/register')} style={{ padding: '0.5rem 1rem' }}>Sign Up</button>
                </div>
            ) : (
                <div className='profile-section' ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <div className='user-info'>
                        <span className='username' style={{ fontWeight: 'bold' }}>{formatName(user.username)}</span>
                        <span className='role'>Software Engineer</span>
                    </div>
                    
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="avatar" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="avatar">{getInitial()}</div>
                    )}

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={(e) => navigateToPage(e, '/profile')}>
                                <User size={18} />
                                <span>My Profile</span>
                            </div>
                            <div className="dropdown-item" onClick={(e) => navigateToPage(e, '/resume-analysis')}>
                                <FileText size={18} />
                                <span>Resume Analysis</span>
                            </div>
                            <div className="dropdown-item" onClick={(e) => navigateToPage(e, '/ai-interview')}>
                                <History size={18} />
                                <span>AI Mock Interviews</span>
                            </div>
                            <div className="dropdown-item" onClick={(e) => navigateToPage(e, '/analytics')}>
                                <BarChart2 size={18} />
                                <span>Performance Analytics</span>
                            </div>
                            <div className="dropdown-item" onClick={(e) => navigateToPage(e, '/settings')}>
                                <Settings size={18} />
                                <span>Settings</span>
                            </div>
                            
                            <div className="dropdown-divider"></div>
                            
                            <div className="dropdown-item danger" onClick={onLogout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}

export default Header
