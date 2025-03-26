import { useEffect, useRef } from "react"
import ChatHeader from "./ChatHeader"
import { formatMessageTime } from "../lib/utils"
import MessageSkeleton from "./skeletons/MessageSkeleton"
import { motion } from "framer-motion"
import { useChatStore } from "@/stores/chatStore/useChatStore"
import { useAuthStore } from "@/stores/AuthStore/useAuthStore"
import ChatInput from "./ChatInput"

const ChatContainer = () => {
  const {messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unSubscribeFromMessages} = useChatStore()
  const { authUser } = useAuthStore()
  const messageEndRef = useRef<HTMLDivElement>(null);

  if(selectedUser)
    useEffect(() => {
      getMessages(selectedUser._id)

      subscribeToMessages()

      return () => unSubscribeFromMessages();
    }, [getMessages, selectedUser._id, subscribeToMessages, unSubscribeFromMessages])

    useEffect(() => {
      if(messageEndRef.current && messages){
        messageEndRef.current.scrollIntoView({behavior: "smooth"})
        // messageEndRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth"})
      }
    }, [messages])

  if(isMessagesLoading){
    return <div className="h-full w-full relative">
      <ChatHeader />

      <motion.div className="flex-1 overflow-y-auto p-4 space-y-4 -mt-3 "
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        
      }}
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
       {  <MessageSkeleton /> }
      </motion.div>

      <div className="absolute bottom-0 w-full">
         <ChatInput />
      </div>
    </div>
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.sender === authUser?._id ? "chat-end " : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border p-[1px] border-gray-400">
                <img
                  className="rounded-full"
                  src={
                    message.sender === authUser?._id
                      ? authUser?.profilePicture || "/avatar.png"
                      : selectedUser?.profilePicture || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {/* {message.createdAt.toString()} */}
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className={`chat-bubble flex flex-col ${message.sender === authUser?._id ? "bg-primary/25  text-base-content " : "bg-base-200 text-base-content "}  `}>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2 mt-2"
                />
              )}
              {message.content && <p>{message.content}</p>}
            </div>
          </div>
        ))}
      </div>

      <ChatInput />
    </div>
  )
}

export default ChatContainer
