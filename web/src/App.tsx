import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
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
import AdminHome from './pages/admin/AdminHome'
import { AdminSignin } from './pages/admin/AdminSignin'
import { useAdminStore } from './stores/AdminStore/useAdminStore'
import { AdminNavbar } from './components/admin/AdminNavbar'
import UserList from './pages/admin/UserList'
import ReportedPosts from './pages/admin/ReportedPosts'
import { EditProfile } from './pages/EditProfile'
import {ForumsPage} from './pages/admin/ForumsPage'
import { SearchBar } from './components/forums/search-bar'
import { ForumsList } from './components/forums/ForumsList'
import { ForumPage } from './pages/admin/ForumPage'

function App() {
  const { authUser, checkAuth } = useAuthStore()
  const { authAdmin, checkAdminAuth } = useAdminStore()
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if(!isAdminRoute){
      checkAuth()
    }
  }, [checkAuth, isAdminRoute])

  useEffect(() => {
    if(isAdminRoute) {
      checkAdminAuth()
    }
    }, [checkAdminAuth, isAdminRoute])

  return (
    <div className='bg-gray-100 dark:bg-neutral-900 '>
      {authUser && !isAdminRoute && <div className='fixed top-0 w-screen z-50'>
        <Navbar />
      </div>}
      {authAdmin && isAdminRoute && <div className='fixed top-0 w-screen z-50'>
          <AdminNavbar />
      </div>}
      <Toaster />
      <Routes>
        {/* User Routes */}
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" /> } />
        <Route path="/signin" element={!authUser ? <Signin /> : <Navigate to="/" /> } />
        <Route path="/" element={ authUser ? <Home /> : <Navigate to="/signin" />} />
        {/* <Route path='/profile' element={<Profile />} /> */}
        <Route path='/profile' element={authUser ? <Profile /> : <Navigate to="/admin/home"/>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path='/message' element={<Messages />} />
        <Route path='verify-email' element={<EmailVerify />} />
        <Route path='/edit-profile' element={<EditProfile />} />

        {/* Admin Routes */}
        <Route path="/admin/signin" element={!authAdmin ? <AdminSignin /> : <Navigate to="/admin/home" /> } />
        <Route path="/admin/home" element={ authAdmin ? <AdminHome /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/reported-posts" element={authAdmin ? <ReportedPosts /> : <Navigate to="/admin/signin" /> } />
        <Route path="/admin/user-list" element={ authAdmin ? <UserList /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/profile/:id" element={authAdmin ? <Profile /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/home/forums" element={<ForumsPage/>} />
      </Routes>
    </div>
  )
}

export default App
