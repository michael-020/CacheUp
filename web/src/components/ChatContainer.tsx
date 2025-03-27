import { useCallback, useEffect, useMemo, useRef } from "react"
import ChatHeader from "./ChatHeader"
import MessageSkeleton from "./skeletons/MessageSkeleton"
import { motion } from "framer-motion"
import { useChatStore } from "@/stores/chatStore/useChatStore"
import ChatInput from "./ChatInput"
import ChatBubble from "./ChatBubble"

const ChatContainer = () => {
  const {messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unSubscribeFromMessages} = useChatStore()
  const messageEndRef = useRef<HTMLDivElement>(null);

  const memoizedGetMessages = useCallback(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [getMessages, selectedUser?._id])

  useEffect(() => {
    memoizedGetMessages()

    subscribeToMessages()

    return () => {
      unSubscribeFromMessages()
    }
  }, [memoizedGetMessages, subscribeToMessages, unSubscribeFromMessages])

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const renderSkeleton = useMemo(() => {
    if (isMessagesLoading) {
      return (
        <motion.div 
          className="flex-1 overflow-y-auto p-4 space-y-4 -mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0,
            type: "spring",
            ease: "linear"
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 2,
            }
          }}
        >
          <MessageSkeleton />
        </motion.div>
      )
    }
    return null
  }, [isMessagesLoading])

  if (isMessagesLoading) {
    return (
      <div className="h-full w-full relative dark:bg-neutral-800">
        <ChatHeader />
        {renderSkeleton}
        <div className="absolute bottom-0 w-full">
          <ChatInput />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <ChatHeader />
      
      <div className="flex-grow overflow-y-auto px-4 py-4 dark:bg-neutral-800 space-y-2">
        {messages && messages.map((message) => (
          <ChatBubble 
            key={message._id} 
            message={message}
            selectedUser={selectedUser} 
          />
        ))}
        <div ref={messageEndRef} />
      </div>
      
      <ChatInput />
    </div>
  )
}

export default ChatContainer