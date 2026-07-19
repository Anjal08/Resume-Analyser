import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { resetPassword } from '../services/auth.api'
import toast from 'react-hot-toast'
import "../auth.form.scss"

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await resetPassword(token, password)
            toast.success("Password reset successfully. Please login.")
            navigate("/login")
        } catch (err) {
            toast.error(err.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>New Password</h1>
                <p style={{marginTop: 0}}>Enter your new password below</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" required placeholder='Enter new password' />
                    </div>

                    <button disabled={loading} className='button primary-button'>
                        {loading ? 'Resetting...' : 'Update Password'}
                    </button>
                </form>

                <p><Link to={"/login"} >Back to Login</Link> </p>
            </div>
        </main>
    )
}

export default ResetPassword
