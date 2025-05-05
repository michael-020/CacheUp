import ChatContainer from "@/components/ChatContainer"
import ChatSidebar from "@/components/ChatSidebar"
import NoChatSelected from "@/components/NoChatSelected"
import SignInNavigation from "@/components/SignInNavigation"
import { routeVariants } from "@/lib/routeAnimation"
import { useAuthStore } from "@/stores/AuthStore/useAuthStore"
import { useChatStore } from "@/stores/chatStore/useChatStore"
import { motion } from "framer-motion"

export const Messages = () => {
  const { selectedUser } = useChatStore()
  const { authUser } = useAuthStore()

  return (
    <motion.div 
      className="flex items-center justify-center pt-20 px-4 pb-6 h-[99.9vh] dark:bg-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      
      {authUser ? <div className="rounded-lg pb-20 lg:pb-0 shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="hidden md:flex h-full rounded-lg overflow-hidden border shadow-xl dark:border-neutral-800 dark:shadow-neutral-700 dark:shadow-md">
            <ChatSidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
          <div className="flex md:hidden h-full rounded-lg overflow-hidden border shadow-xl dark:border-neutral-800 dark:shadow-neutral-700 dark:shadow-md">
            

            {!selectedUser ? <ChatSidebar /> : <ChatContainer />}
          </div>
        </div> : <SignInNavigation />}   
      </motion.div>
  )
}
