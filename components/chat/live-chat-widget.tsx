"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useLiveChatStore, type LiveChatState, type LiveChatMessage } from "@/stores"
import { useShallow } from "zustand/react/shallow"
import { subscribeAbly, unsubscribeAbly } from "@/lib/ably/client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, MoreVertical, Paperclip, Send, Smile } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react"

const DEFAULT_QUICK_REPLIES = ["Resend OTP", "Change Number", "Other Issue"]

export function LiveChatWidget() {
  const {
    isOpen, activeTicketId, messages, sessionData, isLoading, isSending,
    closeChat, fetchSession, startSession, fetchMessages, sendMessage, receiveMessage
  } = useLiveChatStore(
    useShallow((state: LiveChatState) => ({
      isOpen: state.isOpen,
      activeTicketId: state.activeTicketId,
      messages: state.messages,
      sessionData: state.sessionData,
      isLoading: state.isLoading,
      isSending: state.isSending,
      closeChat: state.closeChat,
      fetchSession: state.fetchSession,
      startSession: state.startSession,
      fetchMessages: state.fetchMessages,
      sendMessage: state.sendMessage,
      receiveMessage: state.receiveMessage,
    }))
  )
  const [message, setMessage] = useState("")
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch active session on mount if open
  useEffect(() => {
    if (isOpen && !activeTicketId && !sessionData && !isLoading) {
      fetchSession().then(() => {
        // After fetching, if no session data, start one
        const currentSession = useLiveChatStore.getState().sessionData
        if (!currentSession && !useLiveChatStore.getState().isLoading) {
          startSession()
        }
      })
    }
  }, [isOpen, activeTicketId, sessionData, isLoading, fetchSession, startSession])

  // Fetch messages
  useEffect(() => {
    if (activeTicketId) {
      fetchMessages(activeTicketId)
    }
  }, [activeTicketId, fetchMessages])

  // Subscribe to Ably real-time updates
  useEffect(() => {
    if (!activeTicketId) return

    const channelName = `live-chat:${activeTicketId}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNewMessage = (msg: any) => {
      receiveMessage(msg.data.message as LiveChatMessage)
      scrollToBottom()
    }

    subscribeAbly(channelName, handleNewMessage)
    return () => {
      unsubscribeAbly(channelName, handleNewMessage)
    }
  }, [activeTicketId, receiveMessage])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!message.trim() || !activeTicketId) return
    const textToSend = message
    setMessage("")
    setIsEmojiOpen(false)
    setTimeout(scrollToBottom, 50)
    await sendMessage(activeTicketId, textToSend)
  }

  const dynamicQuickReplies = useMemo(() => {
    if (!messages || messages.length === 0) return DEFAULT_QUICK_REPLIES
    const lastMsg = messages[messages.length - 1]
    const isMe = sessionData ? lastMsg.senderId === (sessionData.userId || sessionData.guestId) : (lastMsg.senderId === "currentUser")
    
    if (isMe) {
      return ["Thanks", "Okay", "Can you explain more?"]
    } else {
      const lower = lastMsg.message.toLowerCase()
      if (lower.includes("?")) return ["Yes", "No", "I'm not sure"]
      if (lower.includes("order")) return ["Track my order", "Cancel order", "Order is wrong"]
      if (lower.includes("payment") || lower.includes("refund")) return ["Check status", "How long will it take?", "Other payment issue"]
      return ["Understood", "I need more help", "Thank you!"]
    }
  }, [messages, sessionData])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend()
  }

  const handleQuickReply = async (reply: string) => {
    if (!activeTicketId) return
    await sendMessage(activeTicketId, reply)
  }

  if (!isOpen) return null


  return (
    <div className="fixed bottom-6 right-6 w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_6px_20px_rgba(8,122,54,0.22)] flex flex-col border border-border z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-[#087A36] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support1" alt="Support" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[#087A36] bg-white" />
            <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support2" alt="Support" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[#087A36] bg-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Live Chat</h3>
            <p className="text-xs text-white/80">We&apos;re online and here to help!</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={closeChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-[350px] max-h-[400px] overflow-y-auto p-4 bg-[#FEFEFE] space-y-4">
        {/* Welcome Message (Static for now if empty) */}
        {messages.length === 0 && (
          <div className="flex items-start gap-2">
            <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support1" alt="Support" width={32} height={32} className="w-8 h-8 rounded-full bg-white shadow-sm" />
            <div className="bg-[#F5F7F6] text-[#1F2937] p-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm">
              <p>Hello! 👋</p>
              <p className="mt-1">Welcome to RRC Kitchen Support. How can we assist you today?</p>
              <span className="text-[10px] text-[#94A3B8] mt-1 block">{format(new Date(), "hh:mm a")}</span>
            </div>
          </div>
        )}

        {messages.map((msg: LiveChatMessage) => {
          const isMe = sessionData ? msg.senderId === (sessionData.userId || sessionData.guestId) : true;
          const isReallyMe = isMe || msg.senderId === "currentUser"

          return (
            <div key={msg.id} className={cn("flex items-start gap-2", isReallyMe ? "justify-end" : "justify-start")}>
              {!isReallyMe && (
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support1" alt="Support" width={32} height={32} className="w-8 h-8 rounded-full bg-white shadow-sm" />
              )}
              <div className={cn(
                "p-3 text-sm max-w-[85%]",
                isReallyMe ? "bg-[#EAF7EF] text-[#14532D] rounded-2xl rounded-tr-none" : "bg-[#F5F7F6] text-[#1F2937] rounded-2xl rounded-tl-none"
              )}>
                {msg.mediaUrls?.map((url: string) => (
                  <Image key={url} src={url} alt="Attachment" width={200} height={200} className="max-w-full rounded-lg mb-2 object-cover" />
                ))}
                <p>{msg.message}</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <span className="text-[10px] text-[#94A3B8]">{format(new Date(msg.createdAt), "hh:mm a")}</span>
                  {isReallyMe && <span className="text-[10px] text-green-600">✓✓</span>}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto no-scrollbar bg-white">
        {dynamicQuickReplies.map(reply => (
          <button
            key={reply}
            onClick={() => handleQuickReply(reply)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-[#D7EBDD] bg-[#F4FAF6] text-[#087A36] text-xs font-medium hover:bg-[#EAF7EF] transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-border flex items-center gap-2">
        <div className="flex-1 flex items-center border border-[#E5E7EB] rounded-full px-3 py-1 bg-white ">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 py-4 h-9"
          />
          <div className="flex items-center gap-1 text-[#64748B]">
            <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
              <PopoverTrigger asChild>
                <button className="p-1.5 hover:text-[#087A36] transition-colors"><Smile className="w-4 h-4" /></button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-fit p-0 border-none shadow-none mb-2 bg-transparent">
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setMessage((m) => m + emojiData.emoji)
                    setIsEmojiOpen(false)
                  }}
                  theme={Theme.LIGHT}
                  emojiStyle={EmojiStyle.APPLE}
                  width={300}
                  height={400}
                />
              </PopoverContent>
            </Popover>

            <CldUploadWidget
              uploadPreset="rrc_kitchen"
              onUpload={async (result) => {
                const info = result.info
                if (info && typeof info === "object" && "secure_url" in info && activeTicketId) {
                  await sendMessage(activeTicketId, "Sent an attachment", [(info as { secure_url: string }).secure_url])
                }
              }}
            >
              {({ open }) => (
                <button onClick={() => open()} className="p-1.5 hover:text-[#087A36] transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>
        <Button 
          size="icon" 
          className="rounded-full h-10 w-10 shrink-0 bg-[#087A36] hover:bg-[#06652D] text-white shadow-sm"
          onClick={handleSend}
          disabled={!message.trim() || isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="bg-[#FEFEFE] text-center py-1.5 text-[10px] text-[#94A3B8]">
        Powered by RRC Kitchen Support
      </div>
    </div>
  )
}
