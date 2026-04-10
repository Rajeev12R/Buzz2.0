import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Auth from './components/forms/Auth'
import Profile from './pages/Profile'
import Home from './pages/Home'
import Create from './pages/Create'
import Sidebar from './components/home/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Explore from './pages/Explore'

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className='flex h-screen w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white'>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerClassName="toast-container"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            color: 'inherit',
            border: '1px solid rgba(255, 255, 255, 0.125)',
            borderRadius: '16px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
            style: {
              borderLeft: '4px solid #10b981',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
            style: {
              borderLeft: '4px solid #ef4444',
            }
          },
        }}
      />

      {user && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Routes>

          <Route
            path="/"
            element={!user ? <Auth /> : <Navigate to="/home" />}
          />

          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/" />}
          />

          <Route
            path="/:username"
            element={user ? <Profile /> : <Navigate to="/" />}
          />

          <Route
            path="/create"
            element={user ? <Create /> : <Navigate to="/" />}
          />

          <Route
            path="/messages"
            element={user ? <Messages /> : <Navigate to="/" />}
          />

          <Route
            path="/notifications"
            element={user ? <Notifications /> : <Navigate to="/" />}
          />

          <Route
            path="/settings"
            element={user ? <Settings /> : <Navigate to="/" />}
          />
          <Route
            path="/explore"
            element={user ? <Explore /> : <Navigate to="/" />}
          />

        </Routes>
      </div>
    </div>
  )
}

export default App