import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { useAuthStore } from './stores/AuthStore/useAuthStore'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { EmailVerify } from './pages/EmailVerify'
import { Navbar } from './components/Navbar'

function App() {
  const { authUser, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className='bg-red-300 h-screen'>
      {authUser && <div className='fixed top-0 w-screen'>
        <Navbar />
      </div>}
      <Toaster />
      <Routes>
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" /> } />
        <Route path="/signin" element={!authUser ? <Signin /> : <Navigate to="/" /> } />
        <Route path="/" element={ authUser ? <Home /> : <Navigate to="/signin" />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/messages' element={<Messages />} />
        <Route path='verify-email' element={<EmailVerify />} />
      </Routes>
    </div>
  )
}

export default App
