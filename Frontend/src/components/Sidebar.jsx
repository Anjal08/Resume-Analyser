import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Home, FileText, Mic, BarChart2, BookOpen, Settings, LogOut, LayoutDashboard, Lock } from 'lucide-react';
import './Sidebar.scss';

const Sidebar = ({ openAuthModal, isSidebarOpen, setIsSidebarOpen }) => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        if (window.confirm("Are you sure you want to logout?")) {
            await handleLogout();
            navigate('/');
        }
    };

    const handleProtectedNavigation = (e, path) => {
        if (!user) {
            e.preventDefault();
            openAuthModal();
            return;
        }
        navigate(path);
    };

    const NavItem = ({ to, icon: Icon, label, exact = false }) => {
        return (
            <NavLink 
                to={to} 
                end={exact}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                    if (to !== '/') handleProtectedNavigation(e, to);
                    setIsSidebarOpen(false); // Close sidebar on mobile
                }}
            >
                <Icon size={20} />
                <span>{label}</span>
                {!user && to !== '/' && <span className="lock-icon" style={{marginLeft: 'auto', opacity: 0.5}}><Lock size={12}/></span>}
            </NavLink>
        );
    };

    return (
        <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header" onClick={() => { navigate('/'); setIsSidebarOpen(false); }} style={{cursor: 'pointer'}}>
                <LayoutDashboard className="logo-icon" size={28} />
                <h2>Interview AI</h2>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <NavItem to="/" icon={Home} label="Dashboard" exact={true} />
                    <NavItem to="/resume-analysis" icon={FileText} label="Resume Analysis" />
                    <NavItem to="/ai-interview" icon={Mic} label="AI Interviews" />
                    <NavItem to="/analytics" icon={BarChart2} label="Analytics" />
                    <NavItem to="/learning-hub" icon={BookOpen} label="Learning Hub" />
                </div>

                {user && (
                    <>
                        <div className="sidebar-divider" />
                        <div className="nav-group">
                            <NavItem to="/settings" icon={Settings} label="Settings" />
                            <button onClick={onLogout} className="nav-item logout-btn">
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
