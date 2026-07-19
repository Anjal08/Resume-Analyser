import React, { useState } from 'react'
import { Link } from 'react-router'
import { forgotPassword } from '../services/auth.api'
import toast from 'react-hot-toast'
import "../auth.form.scss"

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await forgotPassword(email)
            toast.success("Password reset link generated! Check backend console.")
        } catch (err) {
            toast.error(err.message || "Failed to request password reset")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Reset Password</h1>
                <p style={{marginTop: 0}}>Enter your email to receive a reset link</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" required placeholder='Enter your email address' />
                    </div>

                    <button disabled={loading} className='button primary-button'>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p><Link to={"/login"} >Back to Login</Link> </p>
            </div>
        </main>
    )
}

export default ForgotPassword
