import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Briefcase, FileText, Phone, GraduationCap } from 'lucide-react';
import './EditProfileModal.scss';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        targetRole: '',
        degree: '',
        bio: ''
    });

    useEffect(() => {
        if (isOpen) {
            // Load existing extended data from localStorage
            const savedProfile = JSON.parse(localStorage.getItem(`extended_profile_${user?._id}`)) || {};
            setFormData({
                name: savedProfile.name || user?.username || '',
                phone: savedProfile.phone || '',
                location: savedProfile.location || '',
                targetRole: savedProfile.targetRole || '',
                degree: savedProfile.degree || '',
                bio: savedProfile.bio || ''
            });
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save to localStorage since backend API cannot be modified
        localStorage.setItem(`extended_profile_${user?._id}`, JSON.stringify(formData));
        onSave(formData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-card edit-profile-modal">
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="edit-form">
                    
                    <div className="form-group">
                        <label><User size={16}/> Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Phone size={16}/> Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                        </div>
                        <div className="form-group">
                            <label><MapPin size={16}/> Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Briefcase size={16}/> Target Role</label>
                            <input type="text" name="targetRole" value={formData.targetRole} onChange={handleChange} placeholder="Software Engineer" />
                        </div>
                        <div className="form-group">
                            <label><GraduationCap size={16}/> Degree / Education</label>
                            <input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="B.S. Computer Science" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><FileText size={16}/> Professional Summary</label>
                        <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange} 
                            placeholder="A short summary about your professional background and goals..."
                            rows={4}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="button btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button primary-button">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
