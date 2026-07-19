import React from 'react';
import { Mail, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import '../style/profile.scss'; // Reuse profile styling

const HelpSupport = () => {
    return (
        <div className='dashboard-card'>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Help & Support</h2>
            <div className='settings-list' style={{ gap: '1.5rem' }}>
                <div className='setting-item' style={{ alignItems: 'flex-start' }}>
                    <div className='s-info'>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} color="#58a6ff" /> Documentation & FAQs
                        </h4>
                        <p>Browse our detailed guides and frequently asked questions to learn how to make the most of Interview AI.</p>
                        <a href="#" style={{ color: '#58a6ff', marginTop: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>
                            Visit Knowledge Base <ExternalLink size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                        </a>
                    </div>
                </div>

                <div className='setting-item' style={{ alignItems: 'flex-start' }}>
                    <div className='s-info'>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageCircle size={18} color="#4ade80" /> Live Chat Support
                        </h4>
                        <p>Need immediate assistance? Chat with our support team during business hours (9 AM - 5 PM EST).</p>
                        <button className='btn-primary' style={{ marginTop: '0.75rem', width: 'fit-content' }}>
                            Start a Conversation
                        </button>
                    </div>
                </div>

                <div className='setting-item' style={{ alignItems: 'flex-start' }}>
                    <div className='s-info'>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={18} color="#facc15" /> Email Support
                        </h4>
                        <p>For complex queries or account-related issues, drop us an email and we'll get back to you within 24 hours.</p>
                        <a href="mailto:support@interviewai.com" style={{ color: '#58a6ff', marginTop: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>
                            support@interviewai.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
