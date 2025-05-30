import ChatContainer from "@/components/ChatContainer"
import ChatSidebar from "@/components/ChatSidebar"
import NoChatSelected from "@/components/NoChatSelected"
import SignInNavigation from "@/components/SignInNavigation"
import { routeVariants } from "@/lib/routeAnimation"
import { useAuthStore } from "@/stores/AuthStore/useAuthStore"
import { useChatStore } from "@/stores/chatStore/useChatStore"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export const Messages = () => {
  const { selectedUser, setSelectedUser } = useChatStore()
  const { authUser } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    return () => {
      setSelectedUser(null)
    }
  }, [location.pathname, setSelectedUser])

  if(!authUser){
    return <div>
      <SignInNavigation />
    </div>
  }

  return (
    <div className="fixed inset-0 lg:relative top-[60px] bottom-[60px] lg:top-0 lg:bottom-0">
      <motion.div 
        className="h-full md:pt-2 lg:pt-24 lg:px-4 lg:pb-6 dark:bg-neutral-950"
        variants={routeVariants}
        initial="initial"
        animate="final"
        exit="exit"
      >
          <div className="h-full md:h-[calc(100vh-8rem)] w-full max-w-6xl mx-auto">
            {/* Desktop view */}
            <div className="hidden md:flex h-full rounded-lg overflow-hidden border shadow-xl dark:border-neutral-800 dark:shadow-neutral-700 dark:shadow-md">
              <ChatSidebar />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
            
            {/* Mobile view */}
            <div className="flex md:hidden h-full overflow-hidden">
              {!selectedUser ? <ChatSidebar /> : <ChatContainer />}
            </div>
          </div>
         
      </motion.div>
    </div>
  )
}
