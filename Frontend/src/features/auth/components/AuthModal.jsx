import React from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import './AuthModal.scss';

const AuthModal = ({ isOpen, onClose }) => {
    const { handleGoogleLogin } = useAuth();
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const success = await handleGoogleLogin({ access_token: tokenResponse.access_token });
            if (success) {
                onClose();
                navigate('/');
            }
        },
        onError: () => console.log('Google Login Failed')
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="auth-modal-overlay" onClick={onClose}>
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="auth-modal-content glass-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                        
                        <div className="auth-modal-header">
                            <h2>Join Interview AI</h2>
                            <p>Create a free account to continue your interview preparation and track your progress.</p>
                        </div>

                        <div className="auth-modal-actions">
                            <div className="google-btn-wrapper">
                                <button type="button" className="google-btn" onClick={() => login()}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>
                            
                            <div className="or-divider"><span>OR</span></div>
                            
                            <button className="button primary-button" onClick={() => navigate('/login')}>
                                Login with Email
                            </button>
                            <button className="button secondary-button" onClick={() => navigate('/register')}>
                                Sign Up
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
