import { useAuth } from '@/hooks/useAuth'
import { mutationErrorMessage, zodErrorMessage } from '@/lib/formError'
import { RegisterInputSchema } from '@folio/shared'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const { register, isRegistering, isAuthenticated } = useAuth()
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
    const parsed = RegisterInputSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
    })

    if (!parsed.success) {
      setFormError(zodErrorMessage(parsed.error))
      return
    }

    try {
      await register(parsed.data)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(mutationErrorMessage(error))
    }
  }

  return (
    <div style={{ maxWidth: '24rem' }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label>
          Name
          <input type="text" name="name" required autoComplete="name" style={{ display: 'block', width: '100%' }} />
        </label>
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
            autoComplete="new-password"
            minLength={8}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        {formError && (
          <p role="alert" style={{ color: '#b00020', margin: 0, fontSize: '0.875rem' }}>
            {formError}
          </p>
        )}
        <button type="submit" disabled={isRegistering}>
          {isRegistering ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
