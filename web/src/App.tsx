import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {  Helmet } from "react-helmet-async"
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { Signin } from './pages/Signin'
import { Landing } from './pages/Landing'
import { useAuthStore } from './stores/AuthStore/useAuthStore'
import { useEffect, useRef } from 'react'
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
import { usePathStore } from '@/stores/PathStore/usePathStore';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { authAdmin, checkAdminAuth, isAdminCheckingAuth } = useAdminStore()
  const { getAllMessages, getUsers } = useChatStore()
  const { fetchRequests } = useFriendsStore();
  const { userLastPath, adminLastPath, setUserLastPath, setAdminLastPath } = usePathStore();
  const { fetchSavedPosts } = usePostStore();
  const isAdminRoute = location.pathname.startsWith('/admin')
  const initialized = useRef(false)
  const authenticated = useRef(false)
  const adminInitialized = useRef(false)
  const adminAuthenticated = useRef(false)
  const noNavbarPaths = ['/', '/signin', '/signup', '/verify-email'];
  const shouldShowNavbar = !noNavbarPaths.includes(location.pathname);
  
  // Save current path before navigating to auth pages
  useEffect(() => {
    const currentPath = location.pathname;
    const authPaths = ['/', '/signin', '/signup', '/verify-email', '/admin/signin'];
    
    // Save path for any non-auth path, regardless of auth status
    if (!authPaths.includes(currentPath)) {
      if (isAdminRoute) {
        setAdminLastPath(currentPath);
      } else {
        setUserLastPath(currentPath);
        sessionStorage.setItem('lastPath', currentPath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, setUserLastPath, setAdminLastPath]);

  // Load saved paths on initial load
  useEffect(() => {
    if (!initialized.current) {
      checkAuth();
      initialized.current = true;
    }
  }, [checkAuth]);

  // Handle user auth redirects
  useEffect(() => {
    if (authUser && !authenticated.current) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      const storedPath = sessionStorage.getItem('lastPath');
      const authPaths = ['/', '/signin', '/signup', '/verify-email'];

      if (redirect) {
        navigate(redirect);
        setUserLastPath(null);
        authenticated.current = true;
      } else if (storedPath && !authPaths.includes(storedPath)) {
        navigate(storedPath);
        setUserLastPath(null);
        authenticated.current = true;
      } else if (authPaths.includes(location.pathname)) {
        navigate('/home');
        authenticated.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, location.search, navigate, setUserLastPath]);

  // Handle admin auth redirects
  useEffect(() => {
    if (authAdmin && isAdminRoute && !adminAuthenticated.current) {
      if (adminLastPath) {
        navigate(adminLastPath);
        setAdminLastPath(null);
        adminAuthenticated.current = true;
      }
    }
  }, [authAdmin, isAdminRoute, adminLastPath, navigate, setAdminLastPath]);

  // Save path only when navigating to auth pages
  useEffect(() => {
    const currentPath = location.pathname;
    const authPaths = ['/', '/signin', '/signup', '/verify-email', '/admin/signin'];
    
    if (authPaths.includes(currentPath) && !authenticated.current) {
      const existingLastPath = sessionStorage.getItem('lastPath');
      const previousPath = location.state?.from || existingLastPath || '/home';
      if (!authPaths.includes(previousPath)) {
        sessionStorage.setItem('lastPath', previousPath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Initialize auth check only once
  useEffect(() => {
    if (!initialized.current) {
      checkAuth();
      initialized.current = true;
    }
  }, [checkAuth]);

  // Handle admin routes initialization
  useEffect(() => {
    if (isAdminRoute && !adminInitialized.current) {
      checkAdminAuth();
      adminInitialized.current = true;
    }
  }, [isAdminRoute, checkAdminAuth]);

  // Initialize user data after authentication
  useEffect(() => {
    if (authUser && !isAdminRoute) {
      getUsers();
      getAllMessages();
      fetchRequests();
      
      const interval = setInterval(() => {
        fetchRequests();
      }, 12000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isAdminRoute]);

  useEffect(() => {
    if (authAdmin && isAdminRoute) {
      if (adminLastPath && !adminAuthenticated.current) {
        navigate(adminLastPath)
        adminAuthenticated.current = true
      }
    }
  }, [authAdmin, isAdminRoute, adminLastPath, navigate, setAdminLastPath])

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
    
    <div className='bg-gray-100 dark:bg-neutral-950 min-h-screen custom-scrollbar'>
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
      {shouldShowNavbar && !isAdminRoute && (
        <div className='fixed top-0 w-screen z-40'>
          <Navbar />
          <BottomNavigationBar />
        </div>
      )}
      
      {/* Admin navbar remains the same */}
      {authAdmin && isAdminRoute && (
        <div className='fixed top-0 w-screen z-40'>
          <AdminNavbar />
        </div>
      )}
      <AnimatePresence mode="wait" >
      
        <Routes>
          {/* User Routes */}
          <Route path="/signup" element={<Navigate to="/verify-email"/>} />
          <Route path="/signin" element={!authUser ? <Signin /> : <Navigate to={userLastPath || "/home"} />} />
          <Route path='/' element={!authUser ? <Landing /> : <Navigate to={userLastPath || "/home"} />} />
          <Route path='/verify-email' element={!authUser ? <EmailVerify /> : <Navigate to={userLastPath && userLastPath !== "/" ? userLastPath : "/home"} />} />
          <Route path="/home" element={<Home />} />
          <Route path='/profile' element={authUser ? <Profile /> : <Navigate to={`/`} />} />
          <Route path="/profile/:id" element={<Profile /> } />
          <Route path='/message' element={<Messages /> } />
          <Route path='/edit-profile' element={<EditProfile /> } />
          <Route path='/friends' element={<FriendsPage /> } />
          <Route path='/settings' element={<SettingsPage /> } />
          <Route path="/forums/get-forums" element={  <ForumList /> } />
          <Route path="/forums/:forumMongoId/:forumWeaviateId" element={ <ForumPage /> } />
          <Route path="/forums/search" element={<SearchResults /> } />
          <Route path='/forums/thread/:id/:page' element={<Thread /> } />
          <Route path="/change-password" element={<ChangePassword /> } />
          <Route path="/saved-posts" element={<SavedPostsPage />} />
          <Route path="/friends/:id" element={<ViewFriends /> }/>

          {/* Admin Routes */}
          <Route path="/admin/signin" element={!authAdmin ? <AdminSignin /> : <Navigate to={adminLastPath || "/admin/home"} /> } />
          <Route path="/admin/home" element={authAdmin ? <AdminHome /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/reported-posts" element={authAdmin ? <ReportedPosts /> : <Navigate to="/admin/signin" /> } />
          <Route path="/admin/user-list" element={authAdmin ? <UserList /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/profile/:id" element={authAdmin ? <Profile /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/forums" element={authAdmin ? <CreateForum/> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/forums/get-forums" element={authAdmin ? <ForumList /> : <Navigate to="/admin/signin" />} />
          <Route path="/admin/forums/:forumMongoId/:forumWeaviateId" element={authAdmin ? <ForumPage /> : <Navigate to="/admin/signin" />} />
          <Route path='/admin/forums/thread/:id/:page' element={authAdmin ? <Thread /> : <Navigate to='/admin/signin' />} />
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