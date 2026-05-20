import { queryClient } from '@/lib/queryClient'
import { trpc } from '@/lib/trpc'
import { useAuthSession } from '@/providers/AuthProvider'
import { useAuthStore } from '@/store/auth.store'
import type { LoginInput, RegisterInput } from '@folio/shared'

export function useAuth() {
    const { user, isAuthenticated } = useAuthSession()
    const { setAuth, clearAuth } = useAuthStore()

    const registerMutation = trpc.identity.register.useMutation({
        onSuccess: ({ user, accessToken }) => setAuth(user, accessToken),
    })

    const loginMutation = trpc.identity.login.useMutation({
        onSuccess: ({ user, accessToken }) => setAuth(user, accessToken),
    })

    const logoutMutation = trpc.identity.logout.useMutation({
        onSuccess: () => {
            clearAuth(),
            queryClient.clear();
        }
    })

    return {
        user,
        isAuthenticated,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        register: (input: RegisterInput) => registerMutation.mutateAsync(input),
        login: (input: LoginInput) => loginMutation.mutateAsync(input),
        logout: () => logoutMutation.mutate(),
    }
}