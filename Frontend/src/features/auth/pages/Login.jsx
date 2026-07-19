import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import Loading from '../../../components/Loading'
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {

    const { loading, handleLogin, handleGoogleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleLogin({email,password})
        if (success) {
            navigate('/')
        }
    }

    const onGoogleSuccess = async (credentialResponse) => {
        const success = await handleGoogleLogin(credentialResponse.credential)
        if (success) {
            navigate('/')
        }
    }

    if(loading){
        return <Loading />
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <p>Welcome back to AI Interview Prep</p>
                
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                    <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={() => console.log('Google Login Failed')}
                        theme="filled_black"
                    />
                </div>

                <div className='or-divider'><span>OR</span></div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' />
                    </div>
                    <p style={{textAlign: 'right', marginTop: '-0.5rem'}}>
                        <Link to="/forgot-password" style={{fontSize: '0.85rem'}}>Forgot Password?</Link>
                    </p>
                    <button className='button primary-button' >Login</button>
                </form>
                <p>Don't have an account? <Link to={"/register"} >Register</Link> </p>
            </div>
        </main>
    )
}

export default Login