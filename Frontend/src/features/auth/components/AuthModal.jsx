import React from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import './AuthModal.scss';

const AuthModal = ({ isOpen, onClose }) => {
    const { handleGoogleLogin } = useAuth();
    const navigate = useNavigate();

    const onGoogleSuccess = async (credentialResponse) => {
        const success = await handleGoogleLogin(credentialResponse.credential);
        if (success) {
            onClose();
            navigate('/');
        }
    };

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
                                <GoogleLogin
                                    onSuccess={onGoogleSuccess}
                                    onError={() => console.log('Google Login Failed')}
                                    theme="filled_black"
                                    width="100%"
                                />
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
