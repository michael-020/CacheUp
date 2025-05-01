import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {  Helmet } from "react-helmet-async"
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Landing } from './pages/Landing'
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
import PageViews from "@/pages/admin/PageViews";
import ReportedContentPage from './pages/ReportedContentForums'

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
        !currentPath.includes('/') && 
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
    <Helmet>
      <title>CacheUp | Social Media and Forums</title>
      
      <meta name="description" content="Campus Connect is your social media hub. Chat with friends, join community forums, post updates, comment on discussions, and find everything fast with smart search. Connect, share, and grow together!" />
      <meta name="keywords" content="Campus Connect, college social media, student forums, chat app for students, make friends in college, college communities, campus life platform, discussion boards, vector search, smart forums" />

      {/* Open Graph Tags */}
      <meta property="og:title" content="Campus Connect | Social Media for College Communities" />
      <meta property="og:description" content="Chat, post, make friends, join forums, and discover trending topics easily on Campus Connect. Built for real life Discussions." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://your-campusconnect-site.com" /> {/* Update with your domain */}
      <meta property="og:image" content="https://your-campusconnect-site.com/og-image.png" /> {/* Update this too */}
      
      {/* Twitter Card (Optional, looks good on shares) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Campus Connect | Social Media for College Communities" />
      <meta name="twitter:description" content="Chat, post updates, join forums, and meet friends. Campus Connect makes college life easier and more fun!" />
      <meta name="twitter:image" content="https://your-campusconnect-site.com/og-image.png" />
    </Helmet>
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
          <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to={returnPath && returnPath !== "/" ? returnPath : "/home"} />} />
          <Route path="/signin" element={!authUser ? <Signin /> : <Navigate to={returnPath && returnPath !== "/" ? returnPath : "/home"} />} />
          <Route path='/' element={!authUser ? <Landing /> : <Navigate to={returnPath && returnPath !== "/" ? returnPath : "/home"} />} />
          <Route path='/verify-email' element={!authUser ? <EmailVerify /> : <Navigate to={returnPath && returnPath !== "/" ? returnPath : "/home"} />} />
          <Route path="/home" element={authUser ? <Home /> : <Navigate to="/" />} />
          <Route path='/profile' element={authUser ? <Profile /> : <Navigate to="/"/>} />
          <Route path="/profile/:id" element={authUser ? <Profile /> : <Navigate to="/"/>} />
          <Route path='/message' element={authUser ? <Messages /> : <Navigate to="/" />} />
          <Route path='/edit-profile' element={authUser ? <EditProfile /> : <Navigate to="/" />} />
          <Route path='/friends' element={authUser ? <FriendsPage /> : <Navigate to="/" />} />
          <Route path='/settings' element={authUser ? <SettingsPage /> : <Navigate to="/" />} />
          <Route path="/forums/get-forums" element={authUser ? <ForumList /> : <Navigate to='/'/>} />
          <Route path="/forums/:forumMongoId/:forumWeaviateId" element={authUser ? <ForumPage /> : <Navigate to='/' />} />
          <Route path="/forums/search" element={authUser ? <SearchResults /> : <Navigate to='/' />} />
          <Route path='/forums/thread/:id/:page' element={authUser ? <Thread /> : <Navigate to='/' />} />
          <Route path="/change-password" element={authUser ? <ChangePassword /> : <Navigate to="/" />} />
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
          <Route path='/admin/page-views' element={authAdmin ? <PageViews /> : <Navigate to="/admin/signin" />} />
          <Route path='/admin/reported-content' element={authAdmin ? <ReportedContentPage /> : <Navigate to="/admin/signin" />} />

          {/* Add OAuth route */}
          <Route 
            path="/auth/google" 
            element={
              <Navigate 
                to={`${import.meta.env.VITE_API_URL}/auth/google`} 
                replace 
              />
            } 
          />
        </Routes>
       
      </AnimatePresence>
      <Toaster />  
    </div>
    
  )
}

export default App