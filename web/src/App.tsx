import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { useAuthStore } from './stores/AuthStore/useAuthStore'
import { useEffect, useRef, useState } from 'react'
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
import FriendsPage from "./pages/Friends";
import { useChatStore } from './stores/chatStore/useChatStore'
import ForumList from './pages/ForumsList'
import ForumPage from './pages/ForumPage'
import CreateForum from './pages/admin/CreateForum'
import { SearchResults } from './pages/SearchResults'
import Thread from './pages/thread'
import SettingsPage from './pages/SettingsPage'

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { authAdmin, checkAdminAuth, isAdminCheckingAuth } = useAdminStore()
  const { getAllMessages, getUsers } = useChatStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [returnPath, setReturnPath] = useState<string | null>(null)
  
  const isAdminRoute = location.pathname.startsWith('/admin')
  const initialized = useRef(false)
  const authenticated = useRef(false)

  useEffect(() => {
    const currentPath = location.pathname
    if (!currentPath.includes('/signin') && 
        !currentPath.includes('/signup') && 
        !currentPath.includes('/admin/signin')) {
      sessionStorage.setItem('lastPath', currentPath)
    }
  }, [location.pathname])

  useEffect(() => {
    if(!isAdminRoute && !initialized.current){
      const lastPath = sessionStorage.getItem('lastPath')
      if (lastPath) {
        setReturnPath(lastPath)
      }
      
      checkAuth()
      initialized.current = true
    }
  }, [checkAuth, isAdminRoute])

  useEffect(() => {
    if(isAdminRoute) {
      checkAdminAuth()
    }
  }, [checkAdminAuth, isAdminRoute])

  useEffect(() => {
    if (authUser && !isAdminRoute) {
      getUsers()
      getAllMessages()
      
      if (returnPath && !authenticated.current) {
        navigate(returnPath)
        authenticated.current = true
      }
    }
  }, [authUser, isAdminRoute, returnPath, navigate])

  if ((isAdminRoute && isAdminCheckingAuth) || (!isAdminRoute && isCheckingAuth)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className='bg-gray-100 dark:bg-neutral-900 min-h-screen'>
      {authUser && !isAdminRoute && (
        <div className='fixed top-0 w-screen z-50'>
          <Navbar />
        </div>
      )}
      
      {authAdmin && isAdminRoute && (
        <div className='fixed top-0 w-screen z-50'>
          <AdminNavbar />
        </div>
      )}
      
      <Routes>
        {/* User Routes */}
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to={returnPath || "/"} /> } />
        <Route path="/signin" element={!authUser ? <Signin /> : <Navigate to={returnPath || "/"} /> } />
        <Route path='/verify-email' element={!authUser ? <EmailVerify /> : <Navigate to={returnPath || "/"} />} />
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/signin" />} />
        <Route path='/profile' element={authUser ? <Profile /> : <Navigate to="/signin"/>} />
        <Route path="/profile/:id" element={authUser ? <Profile /> : <Navigate to="/signin"/>} />
        <Route path='/message' element={authUser ? <Messages /> : <Navigate to="/signin" />} />
        <Route path='/edit-profile' element={authUser ? <EditProfile /> : <Navigate to="/signin" />} />
        <Route path='/friends' element={authUser ? <FriendsPage /> : <Navigate to="/signin" />} />
        <Route path='/settings' element={authUser ? <SettingsPage /> : <Navigate to="/signin" />} />
        <Route path="/forums/get-forums" element={<ForumList />} />
        <Route path="/forums/:forumMongoId/:forumWeaviateId" element={<ForumPage />} />
        <Route path="/forums/search" element={<SearchResults />} />
        <Route path='/forums/thread/:id' element={<Thread />} />

        {/* Admin Routes */}
        <Route path="/admin/signin" element={!authAdmin ? <AdminSignin /> : <Navigate to="/admin/home" /> } />
        <Route path="/admin/home" element={authAdmin ? <AdminHome /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/reported-posts" element={authAdmin ? <ReportedPosts /> : <Navigate to="/admin/signin" /> } />
        <Route path="/admin/user-list" element={authAdmin ? <UserList /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/profile/:id" element={authAdmin ? <Profile /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/forums" element={authAdmin ? <CreateForum/> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/forums/get-forums" element={authAdmin ? <ForumList /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/forums/:forumMongoId/:forumWeaviateId" element={authAdmin ? <ForumPage /> : <Navigate to="/admin/signin" />} />
      </Routes>

      <Toaster />  
    </div>
  )
}

export default App