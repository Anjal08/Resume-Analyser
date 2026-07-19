import React, { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthModal from '../features/auth/components/AuthModal';
import './DashboardLayout.scss';

const DashboardLayout = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <div className="dashboard-layout">
            <Sidebar openAuthModal={openAuthModal} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
            {/* Backdrop for mobile drawer */}
            {isSidebarOpen && (
                <div 
                    className="sidebar-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 950
                    }}
                />
            )}

            <div className="dashboard-layout__main">
                <Header openAuthModal={openAuthModal} setIsSidebarOpen={setIsSidebarOpen} />
                <main className="dashboard-layout__content">
                    <Outlet context={{ openAuthModal }} />
                </main>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        </div>
    );
};

export default DashboardLayout;
