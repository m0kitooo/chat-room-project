import { useState, type FormEvent } from 'react'
import { registerSchema } from '@chat-room/shared'
import { useRegister } from '../../hooks/useAuthMutations'
import type { ApiError } from '../../api/auth'

type Props = {
  onRegistered: () => void
}

function firstZodErrors(result: ReturnType<typeof registerSchema.safeParse>): Record<string, string> {
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string
    if (field && !errors[field]) errors[field] = issue.message
  }
  return errors
}

export default function RegisterForm({ onRegistered }: Props) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { mutate: register, isPending, error, isSuccess } = useRegister()
  const apiErr = error as ApiError | null

  if (isSuccess) {
    setTimeout(onRegistered, 2500)
    return (
      <div className="auth-success">
        <p>Account created! Check your email to activate it.</p>
        <p>Redirecting to login…</p>
      </div>
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validation = registerSchema.safeParse({ username, email, password })
    if (!validation.success) {
      setFieldErrors(firstZodErrors(validation))
      return
    }
    setFieldErrors({})
    register(validation.data)
  }

  const serverFieldErrors = apiErr?.additionalData?.alreadyTakenFields ?? {}
  const merged = { ...fieldErrors, ...serverFieldErrors }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
        />
        {merged.username
          ? <span className="field-error">{merged.username}</span>
          : <span className="field-hint">At least 2 characters</span>
        }
      </div>
      <div className="form-field">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        {merged.email && <span className="field-error">{merged.email}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {merged.password
          ? <span className="field-error">{merged.password}</span>
          : <span className="field-hint">Min. 8 chars, uppercase, lowercase, number &amp; special char.</span>
        }
      </div>
      {apiErr && !apiErr.additionalData?.alreadyTakenFields && (
        <p className="form-error">{apiErr.message ?? 'Something went wrong'}</p>
      )}
      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}

