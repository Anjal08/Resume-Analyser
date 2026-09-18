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
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#f4f4f5',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              fontSize: '0.95rem',
              borderRadius: '10px',
              padding: '12px 18px',
            },
            error: {
              style: {
                background: '#1f1315',
                border: '1px solid #f43f5e',
                color: '#ffe4e6',
              },
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff',
              }
            },
            success: {
              style: {
                background: '#0f1f17',
                border: '1px solid #10b981',
                color: '#d1fae5',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              }
            }
          }}
        />
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
