import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import "./style.scss"

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here'

import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
