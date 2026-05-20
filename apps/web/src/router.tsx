import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const RootLayout = lazy(() => import('./layouts/RootLayout'))

// Routes are added phase by phase. Each feature module registers its own routes here.
// Phase 2: /login, /register, /verify-email
// Phase 3: /works, /works/:id, /works/:id/edit
// Phase 4: /workshops/:slug, /workshops/:slug/critique/:roundId
// Phase 6: /writers/:id, /writers/:id/subscribe
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={null}>
        <RootLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        lazy: () => import('./pages/HomePage').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: 'login',
        lazy: () => import('./pages/LoginPage').then((m) => ({ Component: m.LoginPage })),
      },
      {
        path: 'register',
        lazy: () => import('./pages/RegisterPage').then((m) => ({ Component: m.RegisterPage })),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'workshops',
            lazy: () =>
              import('./pages/WorkshopsPage').then((m) => ({ Component: m.WorkshopsPage })),
          },
        ],
      },
    ],
  },
])
