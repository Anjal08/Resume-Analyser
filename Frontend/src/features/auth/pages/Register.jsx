import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import Loading from '../../../components/Loading'
import { GoogleLogin } from '@react-oauth/google'
import "../auth.form.scss"

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const {loading, handleRegister, handleGoogleLogin} = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await handleRegister({username,email,password})
        if (success) {
            navigate("/")
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
                <h1>Register</h1>
                <p>Create an account to begin</p>

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
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter username' />
                    </div>
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

                    <button className='button primary-button' >Register</button>

                </form>

                <p>Already have an account? <Link to={"/login"} >Login</Link> </p>
            </div>
        </main>
    )
}

export default Register