import { createBrowserRouter, Navigate } from 'react-router'
import App from '@/App'
import DashboardLayout from '@/app/layouts/DashboardLayout'
import PlaceholderPage from '@/app/layouts/PlaceholderPage'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import LoginPage from '@/features/auth/pages/LoginPage'
import ClientsPage from '@/features/clients/components/ClientsPage'
import SettingsPage from '@/features/settings/components/SettingsPage'

/** Root router. Feature routes are registered here as they are built. */
export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/clients" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        element: (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          { path: 'clients', element: <ClientsPage /> },
          { path: 'subscriptions', element: <PlaceholderPage /> },
          { path: 'payments', element: <PlaceholderPage /> },
          { path: 'reminders', element: <PlaceholderPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/clients" replace /> },
    ],
  },
])
