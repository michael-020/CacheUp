import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Messages } from './pages/Messages'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { useAuthStore } from './stores/AuthStore/useAuthStore'
import { useEffect, useRef } from 'react'
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

import { IMessages, useChatStore } from './stores/chatStore/useChatStore'

function App() {
  const { authUser, checkAuth } = useAuthStore()
  const { authAdmin, checkAdminAuth } = useAdminStore()
  const { 
    subscribeToMessages, 
    unSubscribeFromMessages, 
    getAllMessages, 
    unReadMessages,
    sendNotification,
    users,
    getUsers
  } = useChatStore()
  const location = useLocation()
  
  // Use refs to track previous unread messages for comparison
  const prevUnreadMessagesCountRef = useRef(0);
  const prevUnreadMessagesRef = useRef<IMessages[]>([]);

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

  // Load users on initial authentication
  useEffect(() => {
    if (authUser && !isAdminRoute && users.length === 0) {
      getUsers();
    }
  }, [authUser, isAdminRoute, getUsers, users.length]);

  // Setup WebSocket connection and message fetching
  useEffect(() => {
    if (authUser && !isAdminRoute) {
      // Subscribe to WebSocket messages
      subscribeToMessages()
      
      // Get initial messages
      getAllMessages()
      
      // Clean up WebSocket on unmount
      return () => {
        unSubscribeFromMessages()
      }
    }
  }, [authUser, isAdminRoute, subscribeToMessages, getAllMessages, unSubscribeFromMessages])

  // Handle notifications for new unread messages
  useEffect(() => {
    if (authUser && !isAdminRoute) {
      const currentCount = unReadMessages.length;
      const prevCount = prevUnreadMessagesCountRef.current;
      
      // If we have more unread messages than before
      if (currentCount > prevCount) {
        // Find the new messages by comparing with previous state
        const prevIds = new Set(prevUnreadMessagesRef.current.map(msg => msg._id));
        const newMessages = unReadMessages.filter(msg => !prevIds.has(msg._id));
        
        // Send notifications for each new message
        if (newMessages.length > 0) {
          // Find the most recent message to notify about
          const latestMessage = newMessages.reduce((latest, current) => {
            const latestDate = new Date(latest.createdAt).getTime();
            const currentDate = new Date(current.createdAt).getTime();
            return currentDate > latestDate ? current : latest;
          }, newMessages[0]);
          
          // sendNotification(latestMessage);
        }
      }
      
      // Update refs for next comparison
      prevUnreadMessagesCountRef.current = currentCount;
      prevUnreadMessagesRef.current = [...unReadMessages];
    }
  }, [authUser, isAdminRoute, unReadMessages, sendNotification]);

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
        <Route path='/profile' element={authUser ? <Profile /> : <Navigate to="/signin"/>} />
        <Route path="/profile/:id" element={authUser ? <Profile /> : <Navigate to="/signin"/>} />
        <Route path='/message' element={<Messages />} />
        <Route path='verify-email' element={<EmailVerify />} />
        <Route path='/edit-profile' element={<EditProfile />} />
        <Route path='/friends' element={authUser ? <FriendsPage /> : <Navigate to="/signin" />} />


        {/* Admin Routes */}
        <Route path="/admin/signin" element={!authAdmin ? <AdminSignin /> : <Navigate to="/admin/home" /> } />
        <Route path="/admin/home" element={ authAdmin ? <AdminHome /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/reported-posts" element={authAdmin ? <ReportedPosts /> : <Navigate to="/admin/signin" /> } />
        <Route path="/admin/user-list" element={ authAdmin ? <UserList /> : <Navigate to="/admin/signin" />} />
        <Route path="/admin/profile/:id" element={authAdmin ? <Profile /> : <Navigate to="/admin/signin" />} />
      </Routes>
    </div>
  )
}

export default App