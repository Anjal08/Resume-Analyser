import React, { useState, useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useInterview } from '../../interview/hooks/useInterview.js'
import '../style/profile.scss'
import ProfileTab from '../components/ProfileTab'

const Profile = () => {
    const { user } = useAuth()
    const { reports, getResumePdf, deleteReport, getHistory } = useInterview()
    const [extendedProfile, setExtendedProfile] = useState({})
    const [historyList, setHistoryList] = useState([])

    useEffect(() => {
        if (user?._id) {
            const saved = JSON.parse(localStorage.getItem(`extended_profile_${user._id}`)) || {};
            setExtendedProfile(saved);
        }
        
        const fetchHistory = async () => {
            const data = await getHistory()
            if (data) {
                setHistoryList(data)
            }
        }
        fetchHistory()
    }, [user])

    return (
        <div className="dashboard-page profile-page">
            <ProfileTab 
                user={user} 
                extendedProfile={extendedProfile} 
                setExtendedProfile={setExtendedProfile} 
                reports={reports} 
                getResumePdf={getResumePdf} 
                deleteReport={deleteReport} 
                historyList={historyList}
            />
        </div>
    )
}

export default Profile
