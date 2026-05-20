import { useAuth } from '@/hooks/useAuth'
import { mutationErrorMessage, zodErrorMessage } from '@/lib/formError'
import { LoginInputSchema } from '@folio/shared'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { login, isLoggingIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const formData = new FormData(e.currentTarget)
    const parsed = LoginInputSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      setFormError(zodErrorMessage(parsed.error))
      return
    }

    try {
      await login(parsed.data)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(mutationErrorMessage(error))
    }
  }

  return (
    <div style={{ maxWidth: '24rem' }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        {formError && (
          <p role="alert" style={{ color: '#b00020', margin: 0, fontSize: '0.875rem' }}>
            {formError}
          </p>
        )}
        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        No account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  )
}
