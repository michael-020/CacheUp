import ChatContainer from "@/components/ChatContainer"
import ChatSidebar from "@/components/ChatSidebar"
import NoChatSelected from "@/components/NoChatSelected"
import { routeVariants } from "@/lib/routeAnimation"
import { useChatStore } from "@/stores/chatStore/useChatStore"
import { motion } from "framer-motion"

export const Messages = () => {
  const { selectedUser } = useChatStore()

  return (
    <motion.div 
      className="flex items-center justify-center pt-24 px-4 pb-6 h-screen dark:bg-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
        <div className="rounded-lg pb-24 lg:pb-0 shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="hidden md:flex h-full rounded-lg overflow-hidden border shadow-xl dark:border-neutral-800 dark:shadow-neutral-700 dark:shadow-md">
            <ChatSidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
          <div className="flex md:hidden h-full rounded-lg overflow-hidden border shadow-xl dark:border-neutral-800 dark:shadow-neutral-700 dark:shadow-md">
            

            {!selectedUser ? <ChatSidebar /> : <ChatContainer />}
          </div>
        </div>
      </motion.div>
  )
}
