import { createBrowserRouter, Navigate } from 'react-router'
import App from '@/App'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import LoginPage from '@/features/auth/pages/LoginPage'
import ClientsPage from '@/features/clients/components/ClientsPage'

/** Root router. Feature routes are registered here as they are built. */
export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/clients" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'clients',
        element: (
          <RequireAuth>
            <ClientsPage />
          </RequireAuth>
        ),
      },
    ],
  },
])
