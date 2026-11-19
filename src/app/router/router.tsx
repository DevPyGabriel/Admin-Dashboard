import { createBrowserRouter } from 'react-router'
import App from '@/App'

/** Root router. Feature routes will be registered here as they are built. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
])
