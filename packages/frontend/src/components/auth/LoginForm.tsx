import { useState, type FormEvent } from 'react'
import { useLogin } from '../../hooks/useAuthMutations'
import type { ApiError } from '../../api/auth'

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useLogin()
  const apiError = error as ApiError | null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login({ identifier, password })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="identifier">Email or username</label>
        <input
          id="identifier"
          type="text"
          placeholder="Enter your email or username"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {apiError && <p className="form-error">{apiError.message ?? 'Something went wrong'}</p>}
      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}
