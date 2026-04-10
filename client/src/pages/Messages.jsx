import React, { useEffect, useState, useContext, useRef } from "react"
import api from "../services/api"
import { AuthContext } from "../context/AuthContext"
import { HiMagnifyingGlass, HiPaperAirplane, HiFaceSmile, HiChatBubbleLeftRight } from 'react-icons/hi2'
import avatar from "../assets/avatar.png"

const Messages = () => {
  const [users, setUsers] = useState([])
  const [defaultUsers, setDefaultUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const { user: currentUser, socket } = useContext(AuthContext)
  const messagesEndRef = useRef(null)
  const [onlineUsersList, setOnlineUsersList] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users")
        setUsers(res.data.users)
        setDefaultUsers(res.data.users)
      } catch (error) {
        console.error(error)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers(defaultUsers);
      return;
    }

    const fetchSearch = async () => {
      try {
        const res = await api.get(`/search?query=${searchQuery}`);
        setUsers(res.data.users || []);
      } catch (error) {
        console.error(error);
      }
    };

    const delayTimer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(delayTimer);
  }, [searchQuery, defaultUsers]);

  useEffect(() => {
    if (!selectedUser) return
    setIsTyping(false)
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedUser._id}`)
        setMessages(res.data.messages || [])
      } catch (error) {
        console.error(error)
      }
    }
    fetchMessages()
  }, [selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!socket) return;

    const handleGetOnlineUsers = (users) => {
      setOnlineUsersList(users);
    };

    const handleNewMessage = (message) => {
      if (selectedUser && (message.sender?._id || message.sender) === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = (senderId) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (senderId) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    socket.on("getOnlineUsers", handleGetOnlineUsers);
    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("getOnlineUsers", handleGetOnlineUsers);
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedUser) {
      socket.emit("typing", { senderId: currentUser._id, receiverId: selectedUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: currentUser._id, receiverId: selectedUser._id });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    try {
      const res = await api.post("/messages", {
        receiverId: selectedUser._id,
        text: newMessage,
      })
      setMessages((prev) => [...prev, res.data.message])
      setNewMessage("")
      if (socket) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("stopTyping", { senderId: currentUser._id, receiverId: selectedUser._id });
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-1 h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 relative">
      <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl pointer-events-none"></div>
      
      {/* SIDEBAR: COMPACT COMMUNICATIONS LIST */}
      <div className={`z-40 ${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-[320px] border-r dark:border-zinc-800 flex flex-col h-full bg-white/60 dark:bg-zinc-900/40 shadow-xl transition-all`}>
        <div className="px-6 py-6 pb-4">
           <h2 className="font-bold text-xl mb-5 text-zinc-900 dark:text-white uppercase tracking-widest">Messages</h2>
           <div className="relative group">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors text-sm" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100/50 dark:bg-zinc-800/10 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-500 active:scale-[0.99]"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-10">
          {users.map((u) => {
            const isOnline = onlineUsersList.includes(u._id);
            const isSelected = selectedUser?._id === u._id;
            return (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`group flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-300
                ${isSelected 
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" 
                  : "hover:bg-white dark:hover:bg-zinc-800/20 text-zinc-900 dark:text-white"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={u.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                    alt={u.username}
                    className="w-11 h-11 rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all border dark:border-zinc-800"
                  />
                  {isOnline && (
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full bg-green-500 ${isSelected ? "border-zinc-900 dark:border-white" : "border-white dark:border-zinc-950"}`}></span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold tracking-tight truncate text-[14px] leading-tight">{u.username}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONVERSATION HUB: HIGH-LEGIBILITY FOCUS */}
      <div className={`z-40 flex-1 flex flex-col h-full relative ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {selectedUser ? (
          <>
            {/* COMPACT CONVERSATION HEADER */}
            <div className="flex items-center justify-between px-6 py-3 border-b dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/40 backdrop-blur-xl z-30">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 text-zinc-400 mr-1">←</button>
                <div className="relative">
                   <img
                    src={selectedUser.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                    alt={selectedUser.username}
                    className="w-9 h-9 rounded-full object-cover bg-white border dark:border-zinc-800"
                  />
                  {onlineUsersList.includes(selectedUser._id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[15px] tracking-tight text-zinc-900 dark:text-white leading-none">
                    {selectedUser.username}
                  </span>
                  {isTyping && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 animate-pulse mt-1">Typing...</span>
                  )}
                </div>
              </div>
            </div>

            {/* PRECISION MESSAGING VIEW */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-4 custom-scrollbar bg-white/5 dark:bg-black/5">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 select-none grayscale scale-50">
                   <HiChatBubbleLeftRight className="text-8xl text-zinc-400 mb-4" />
                   <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = (msg.sender?._id || msg.sender) === currentUser._id
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in slide-in-from-bottom-1 duration-300`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-[14px] font-medium leading-relaxed transition-all ${
                          isMe
                            ? "bg-linear-to-tr from-indigo-600 to-indigo-800 text-white rounded-br-none shadow-indigo-500/5 shadow-sm"
                            : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border dark:border-zinc-800 rounded-bl-none shadow-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-2 px-1 opacity-40">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* SLEEK INPUT PILL */}
            <div className="p-5 md:p-6 bg-transparent">
              <form
                onSubmit={handleSendMessage}
                className="max-w-4xl mx-auto flex items-center gap-2 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[1.8rem] p-1.5 pl-4 shadow-xl border dark:border-zinc-800/30 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-500"
              >
                <button type="button" className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors">
                  <HiFaceSmile className="text-lg" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 outline-none px-2 py-2.5 text-sm font-semibold bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500
                    ${newMessage.trim() 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md hover:scale-105 active:scale-95" 
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed opacity-30"
                    }`}
                >
                  <HiPaperAirplane className={`text-md transition-transform duration-500 ${newMessage.trim() ? "-rotate-45" : "rotate-0"}`} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-b from-indigo-500/5 to-transparent blur-[120px] rounded-full pointer-events-none opacity-40"></div>

            <div className="relative z-10 animate-in fade-in duration-1000 items-center flex flex-col">
               <div className="relative mb-10 group inline-block grayscale-[0.3] opacity-60">
                  <img 
                    src={avatar} 
                    alt="Buzz 2.0 Hub" 
                    className="relative z-10 w-48 h-48 object-contain drop-shadow-3xl transform group-hover:scale-105 transition-all duration-1000" 
                  />
               </div>
               <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-widest opacity-80">Your Messages</h2>
               <p className="text-zinc-500 dark:text-zinc-400 text-[14px] font-medium max-w-xs mx-auto mb-10 leading-relaxed opacity-60">
                  Choose a chat from the left to start a conversation.
               </p>
               <button 
                  onClick={() => document.querySelector('input[placeholder="Search messages..."]')?.focus()}
                  className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Search for people
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages;
