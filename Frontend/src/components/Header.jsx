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
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('')
    const [searchHistory, setSearchHistory] = useState([])
    const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false)
    
    // Notification states
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Your ATS Resume Analysis is ready!', time: '2 mins ago', read: false },
        { id: 2, text: 'You have a mock interview scheduled for tomorrow.', time: '1 hour ago', read: false }
    ])
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)
    const searchContainerRef = useRef(null)
    const notificationsRef = useRef(null)

    useEffect(() => {
        // Initialize theme based on document attribute or localStorage
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(currentTheme);
        document.documentElement.setAttribute('data-theme', currentTheme);

        // Load search history from local storage
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    const handleNotificationClick = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    }

    const markNotificationsAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
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
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            toast.success(`Searching for: ${searchQuery}`);
            
            // Add to history
            const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 5);
            setSearchHistory(newHistory);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            
            setSearchQuery('');
            setIsSearchHistoryOpen(false);
            e.target.blur();
        }
    }

    const onHistoryItemClick = (item) => {
        toast.success(`Searching for: ${item}`);
        setSearchQuery('');
        setIsSearchHistoryOpen(false);
        if (searchInputRef.current) searchInputRef.current.blur();
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

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchHistoryOpen(false)
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
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
            
            <div className="header-search" ref={searchContainerRef}>
                <Search size={16} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={onSearchSubmit}
                    onFocus={() => setIsSearchHistoryOpen(true)}
                />
                <span className="search-shortcut">⌘K</span>

                {isSearchHistoryOpen && searchHistory.length > 0 && (
                    <div className="search-dropdown-menu">
                        <div className="dropdown-header">Recent Searches</div>
                        {searchHistory.map((item, idx) => (
                            <div key={idx} className="dropdown-item" onClick={() => onHistoryItemClick(item)}>
                                <History size={14} />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='nav-spacer' />
            
            <div className="header-actions">
                <button className="icon-btn" title="Toggle Theme" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
                </button>
                <div className="notification-container" ref={notificationsRef}>
                    <button className="icon-btn" title="Notifications" onClick={handleNotificationClick}>
                        <Bell size={18}/>
                        {notifications.some(n => !n.read) && <span className="notification-badge"></span>}
                    </button>
                    {isNotificationsOpen && (
                        <div className="notification-dropdown-menu">
                            <div className="dropdown-header">
                                <span>Notifications</span>
                                <button onClick={markNotificationsAsRead} className="mark-read-btn">Mark all as read</button>
                            </div>
                            <div className="notification-list">
                                {notifications.map(notification => (
                                    <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                                        <div className="notification-content">{notification.text}</div>
                                        <div className="notification-time">{notification.time}</div>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="notification-empty">No notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
