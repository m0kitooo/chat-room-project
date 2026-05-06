import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import './AuthPage.css'

type Tab = 'login' | 'register'

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M12 2C6.477 2 2 6.268 2 11.5c0 2.463 1.036 4.7 2.724 6.346L4 22l4.616-1.444C9.884 21.166 10.918 21.5 12 21.5c5.523 0 10-4.268 10-9.5S17.523 2 12 2z" />
          </svg>
        </div>
        <h1 className="auth-title">Chat Room</h1>
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>
        {tab === 'login'
          ? <LoginForm />
          : <RegisterForm onRegistered={() => setTab('login')} />
        }
      </div>
    </div>
  )
}
