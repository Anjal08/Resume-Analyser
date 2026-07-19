import React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import './FloatingBackButton.scss'

const FloatingBackButton = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Don't show the back button on the Home page (root)
    if (location.pathname === '/') {
        return null
    }

    return (
        <button 
            className="floating-back-button" 
            onClick={() => navigate(-1)}
            title="Go Back"
        >
            <ArrowLeft size={20} />
        </button>
    )
}

export default FloatingBackButton
