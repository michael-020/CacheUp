import { useCallback, useEffect, useMemo, useRef } from "react"
import ChatHeader from "./ChatHeader"
import MessageSkeleton from "./skeletons/MessageSkeleton"
import { motion } from "framer-motion"
import { useChatStore } from "@/stores/chatStore/useChatStore"
import ChatInput from "./ChatInput"
import ChatBubble from "./ChatBubble"
import { useAuthStore } from "@/stores/AuthStore/useAuthStore"
import { formatDate, IUser } from "@/lib/utils"

const ChatContainer = () => {
  const {
    messages, 
    getMessages, 
    isMessagesLoading, 
    selectedUser, 
    subscribeToMessages, 
    unSubscribeFromMessages, 
    getAllMessages
  } = useChatStore()
  
  const { authUser } = useAuthStore()
  const messageEndRef = useRef<HTMLDivElement>(null);

  const memoizedGetMessages = useCallback(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [getMessages, selectedUser])

  useEffect(() => {
    // Initialize WebSocket subscription globally once
    subscribeToMessages()
    
    // Get all messages for notification purposes
    if (authUser) {
      getAllMessages()
    }

    return () => {
      unSubscribeFromMessages()
    }
  }, [subscribeToMessages, unSubscribeFromMessages, getAllMessages, authUser])

  useEffect(() => {
    memoizedGetMessages()
  }, [memoizedGetMessages])

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const messagesByDate = useMemo(() => {
    if (!messages) return [];
    
    const groups: { date: string; formattedDate: string; messages: typeof messages }[] = [];
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt);
      const dateStr = messageDate.toDateString();
      
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      let formattedDate = dateStr;
      if (dateStr === today) {
        formattedDate = "Today";
      } else if (dateStr === yesterdayStr) {
        formattedDate = "Yesterday";
      } else {
        // Format like "27 SEPTEMBER 2013"
        formattedDate = formatDate(messageDate);
      }
      
      const existingGroup = groups.find(group => group.date === dateStr);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: dateStr,
          formattedDate,
          messages: [message]
        });
      }
    });
    
    return groups;
  }, [messages]);

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
      
      <div className="flex-grow overflow-y-auto px-4 py-4 dark:bg-neutral-800">
        {messagesByDate.map((group) => (
          <div key={group.date} className="space-y-2 mb-6">
            {/* Date Header */}
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-lg">
                {group.formattedDate}
              </div>
            </div>
            
            {/* Messages */}
            {group.messages.map((message) => (
              <ChatBubble 
                key={message._id} 
                message={message}
                selectedUser={selectedUser as IUser} 
              />
            ))}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      
      <ChatInput />
    </div>
  )
}

export default ChatContainer