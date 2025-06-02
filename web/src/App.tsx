import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
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
import { usePathStore } from '@/stores/PathStore/usePathStore';
import { Loader } from 'lucide-react'
import { SetupAccount } from './pages/SetupAccount';
import { Signup } from './pages/Signup'
import { NotFoundPage } from './pages/NotFoundPage'
import { ServerDownPage } from './pages/ServerDownPage'

function App() {
  const { authUser, checkAuth, isCheckingAuth, inputEmail } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { authAdmin, checkAdminAuth, isAdminCheckingAuth } = useAdminStore()
  const { getAllMessages, getUsers } = useChatStore()
  const { fetchRequests } = useFriendsStore();
  const { userLastPath, adminLastPath, setUserLastPath, setAdminLastPath } = usePathStore();
  const { fetchSavedPosts } = usePostStore();
  
  // State for server status
  const [showServerDown, setShowServerDown] = useState(false);
  
  // Refs for tracking initialization
  const initialized = useRef(false)
  const authenticated = useRef(false)
  const adminInitialized = useRef(false)
  const adminAuthenticated = useRef(false)
  
  // Constants
  const isAdminRoute = location.pathname.startsWith('/admin')
  const noNavbarPaths = ['/', '/signin', '/signup', '/verify-email', '/set-up-account'];
  const shouldShowNavbar = !noNavbarPaths.includes(location.pathname);

  // Server status monitoring - MOVED BEFORE EARLY RETURNS
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/health/server-health`, {
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          setShowServerDown(false);
        } else {
          setShowServerDown(true);
        }
      } catch (error) {
        console.log('Server check failed:', error);
        setShowServerDown(true);
      }
    };

    const handleOnline = () => {
      console.log('Network back online, checking server...');
      checkServerStatus();
    };

    const handleOffline = () => {
      console.log('Network offline');
      setShowServerDown(true);
    };

    const handleFocus = () => {
      if (showServerDown) {
        checkServerStatus();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);

    checkServerStatus();

    const interval = setInterval(() => {
      if (showServerDown) {
        checkServerStatus();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [showServerDown]);

  // Initialize auth check - CONSOLIDATED
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

  // Path management - CONSOLIDATED
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
  }, [location.pathname, isAdminRoute, setUserLastPath, setAdminLastPath]);

  // Handle user auth redirects - CONSOLIDATED
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
  }, [authUser, location.search, location.pathname, navigate, setUserLastPath]);

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

  // Initialize user data after authentication
  useEffect(() => {
    if (authUser && !isAdminRoute) {
      getUsers();
      getAllMessages();
      fetchRequests();
      
      const interval = setInterval(() => {
        fetchRequests();
      }, 1000*180);

      return () => clearInterval(interval);
    }
  }, [authUser, isAdminRoute, getUsers, getAllMessages, fetchRequests]);

  // Handle saved posts
  useEffect(() => {
    if (authUser) {
      fetchSavedPosts();
      usePostStore.getState().posts.forEach(post => {
        post.isSaved = usePostStore.getState().savedPosts.some(sp => sp._id === post._id);
      });
    }
  }, [authUser, fetchSavedPosts]);

  // Theme initialization
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    const isDark = theme === 'dark'
  
    useThemeStore.getState().setTheme(isDark)
  
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  
  if (showServerDown) {
    return <ServerDownPage />;
  }
  
  if ((isAdminRoute && isAdminCheckingAuth) || (!isAdminRoute && isCheckingAuth)) {
    return (
      <div className="h-screen max-w-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
       <Loader className='animate-spin size-10' />
      </div>
    )
  }

  return (
    <div className='bg-gray-100 dark:bg-neutral-950 min-h-screen custom-scrollbar'>
      {authUser && <TimeTracker />}
      <ScrollToTop />
      {shouldShowNavbar && !isAdminRoute && (
        <div className='fixed top-0 w-screen z-40'>
          <Navbar />
          <BottomNavigationBar />
        </div>
      )}
      
      {authAdmin && isAdminRoute && (
        <div className='fixed top-0 w-screen z-40'>
          <AdminNavbar />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <Routes>
          {/* User Routes */}
          <Route path="/signup" element={inputEmail ? <Signup /> : <Navigate to="/verify-email"/>} />
          <Route path="/set-up-account" element={<SetupAccount />} />
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

          {/* OAuth route */}
          <Route 
            path="/auth/google" 
            element={
              <Navigate 
                to={`${import.meta.env.VITE_API_URL}/auth/google`} 
                replace 
              />
            } 
          />
          
          {/* 404 Routes */}
          <Route path="/forums/get-forums/*" element={<NotFoundPage />} />
          <Route path="/forums/thread/:id/:page/*" element={<NotFoundPage />} />
          <Route path="/forums/:forumMongoId/:forumWeaviateId/*" element={<NotFoundPage />} />
          <Route path="/forums/thread/*" element={<NotFoundPage />} />
          <Route path="/forums/*" element={<NotFoundPage />} />
          <Route path="/profile/:id/*" element={<NotFoundPage />} />
          <Route path="/friends/:id/*" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
      
      <Toaster />  
    </div>
  )
}

export default App