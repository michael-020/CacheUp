import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
import { BottomNavigationBar, Navbar } from './components/Navbar'
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
import ForumPage from './pages/ThreadsPage'
import CreateForum from './pages/admin/CreateForum'
import { SearchResults } from './pages/SearchResults'
import SettingsPage from './pages/SettingsPage'
import ChangePassword from './components/ChangePassword' 
import Thread from './pages/Posts(thread)'
import { useThemeStore } from './stores/ThemeStore/useThemeStore'
import { AnimatePresence } from "framer-motion"
import SavedPostsPage from "./pages/SavedPostsPage";
import { usePostStore } from './stores/PostStore/usePostStore'
import { ScrollToTop } from './components/ScrollToTop'
import { useFriendsStore } from './stores/FriendsStore/useFriendsStore'
import { RequestedForums } from './pages/admin/RequestedForums'
import { ViewFriends } from './components/ViewFriends'
import Statistics from './pages/admin/Statistics'
import { TimeTracker } from './components/TimeTracker'

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { authAdmin, checkAdminAuth, isAdminCheckingAuth } = useAdminStore()
  const { getAllMessages, getUsers } = useChatStore()
  const { fetchRequests, setLoading } = useFriendsStore();
  const location = useLocation()
  const navigate = useNavigate()
  const [returnPath, setReturnPath] = useState<string | null>(null)
  const [adminReturnPath, setAdminReturnPath] = useState<string | null>(null)
  const { fetchSavedPosts } = usePostStore();
  
  const isAdminRoute = location.pathname.startsWith('/admin')
  const initialized = useRef(false)
  const authenticated = useRef(false)
  const adminInitialized = useRef(false)
  const adminAuthenticated = useRef(false)

  useEffect(() => {
    const currentPath = location.pathname
    if (!currentPath.includes('/signin') && 
        !currentPath.includes('/signup') && 
        !currentPath.includes('/admin/signin')) {
      if (currentPath.startsWith('/admin')) {
        sessionStorage.setItem('adminLastPath', currentPath)
      } else {
        sessionStorage.setItem('lastPath', currentPath)
      }
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
    if (isAdminRoute && !adminInitialized.current) {
      const adminLastPath = sessionStorage.getItem('adminLastPath')
      if (adminLastPath) {
        setAdminReturnPath(adminLastPath)
      }
      
      checkAdminAuth()
      adminInitialized.current = true
    }
  }, [checkAdminAuth, isAdminRoute])

  useEffect(() => {
    if (authUser && !isAdminRoute) {
      getUsers()
      getAllMessages()
      
      // Initial fetch without loading state
      const quietFetch = async () => {
        setLoading(false); // Prevent loading state during background updates
        await fetchRequests();
        setLoading(false);
      };

      // First load
      fetchRequests();
      
      // Set up interval for background updates
      const interval = setInterval(quietFetch, 1000 * 12);
      
      if (returnPath && !authenticated.current) {
        navigate(returnPath);
        authenticated.current = true;
      }

      return () => clearInterval(interval);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isAdminRoute, returnPath, navigate, fetchRequests, setLoading])

  useEffect(() => {
    if (authAdmin && isAdminRoute) {
      if (adminReturnPath && !adminAuthenticated.current) {
        navigate(adminReturnPath)
        adminAuthenticated.current = true
      }
    }
  }, [authAdmin, isAdminRoute, adminReturnPath, navigate])

  useEffect(() => {
    if (authUser) {
      fetchSavedPosts();
      usePostStore.getState().posts.forEach(post => {
        post.isSaved = usePostStore.getState().savedPosts.some(sp => sp._id === post._id);
      });
    }
  }, [authUser, fetchSavedPosts]);

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    const isDark = theme === 'dark'
  
    // Ensure Zustand theme state syncs
    useThemeStore.getState().setTheme(isDark)
  
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  

  if ((isAdminRoute && isAdminCheckingAuth) || (!isAdminRoute && isCheckingAuth)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className='bg-gray-100 dark:bg-neutral-900 min-h-screen custom-scrollbar'>
      {authUser && <TimeTracker />}
      <ScrollToTop />
      {authUser && !isAdminRoute && (
        <div className='fixed top-0 w-screen z-40'>
          <Navbar />
          <main className=""> 
            <Outlet />
          </main>
          <BottomNavigationBar />
        </div>
      )}
      
      {authAdmin && isAdminRoute && (
        <div className='fixed top-0 w-screen z-40'>
          <AdminNavbar />
        </div>
      )}
      <AnimatePresence mode="wait" >
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
          <Route path="/forums/get-forums" element={authUser ? <ForumList /> : <Navigate to='/signin'/>} />
          <Route path="/forums/:forumMongoId/:forumWeaviateId" element={authUser ? <ForumPage /> : <Navigate to='/signin' />} />
          <Route path="/forums/search" element={authUser ? <SearchResults /> : <Navigate to='/signin' />} />
          <Route path='/forums/thread/:id/:page' element={authUser ? <Thread /> : <Navigate to='/signin' />} />
          <Route path="/change-password" element={authUser ? <ChangePassword /> : <Navigate to="/signin" />} />
          <Route path="/saved-posts" element={<SavedPostsPage />} />
          <Route path="/friends/:id" element={authUser ? <ViewFriends /> : <Navigate to="/signin" />}/>

          {/* Admin Routes */}
          <Route path="/admin/signin" element={!authAdmin ? <AdminSignin /> : <Navigate to={adminReturnPath || "/admin/home"} /> } />
          <Route path="/admin/home" element={authAdmin ? <AdminHome /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/reported-posts" element={authAdmin ? <ReportedPosts /> : <Navigate to="/admin/signin" /> } />
          <Route path="/admin/user-list" element={authAdmin ? <UserList /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/profile/:id" element={authAdmin ? <Profile /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/forums" element={authAdmin ? <CreateForum/> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/forums/get-forums" element={authAdmin ? <ForumList /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/forums/:forumMongoId/:forumWeaviateId" element={authAdmin ? <ForumPage /> : <Navigate to="/admin/signin" />} />
          <Route path='/admin/forums/thread/:id' element={authAdmin ? <Thread /> : <Navigate to='/admin/signin' />} />
          <Route path='/admin/settings' element={authAdmin ? <SettingsPage /> : <Navigate to='/admin/signin' />} />
          <Route path='/admin/requested-forums' element={authAdmin ? <RequestedForums /> : <Navigate to="/admin/signin" />} />
          <Route path='/admin/stats' element={authAdmin ? <Statistics /> : <Navigate to="/admin/signin" />} />
        </Routes>
      </AnimatePresence>
      <Toaster />  
    </div>
  )
}

export default App