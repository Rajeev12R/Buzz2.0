import React, { useState, useContext, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { 
  HiHome, 
  HiHashtag, 
  HiPlay, 
  HiChatBubbleLeftRight, 
  HiBell, 
  HiPlusCircle, 
  HiUser, 
  HiCog6Tooth 
} from "react-icons/hi2"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, socket } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const checkUnread = async () => {
      try {
        const { data } = await import('../../services/api').then(m => m.default).get('/notifications');
        const unread = data.notifications.some(n => !n.isRead);
        setHasUnread(unread);
      } catch (err) {}
    }
    if (user) checkUnread();
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNotification = () => {
        setHasUnread(true);
      };
      socket.on("newNotification", handleNotification);
      return () => {
        socket.off("newNotification", handleNotification);
      };
    }
  }, [socket]);

  const menuItems = [
    { icon: <HiHome />, label: "Home", path: "/home" },
    { icon: <HiHashtag />, label: "Explore", path: "/explore" },
    { icon: <HiPlay />, label: "Reels", path: "/reels" },
    { icon: <HiChatBubbleLeftRight />, label: "Messages", path: "/messages" },
    {
      icon: (
        <div className="relative">
          <HiBell />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse"></span>
          )}
        </div>
      ),
      label: "Notifications",
      path: "/notifications",
    },
    { icon: <HiPlusCircle />, label: "Create", path: "/create" },
    { icon: <HiUser />, label: "Profile", path: `/${user?.username}` },
    { icon: <HiCog6Tooth />, label: "Settings", path: "/settings" },
  ]

  const isActive = (path) => location.pathname === path;

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`h-screen sticky top-0 left-0 z-50 backdrop-blur-3xl bg-white/70 dark:bg-black/60 border-r border-zinc-100 dark:border-zinc-800 transition-all duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)]
      ${isOpen ? "w-[240px]" : "w-[80px]"} p-4 flex flex-col`}
    >
      {/* Branding */}
      <div className={`mb-12 px-3 flex items-center h-10 transition-all duration-300 ${isOpen ? "justify-start" : "justify-center"}`}>
        <span className={`text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-white transition-all duration-500 ${isOpen ? "translate-x-0" : "-translate-x-0.5"}`}>
          {isOpen ? "Buzz" : "B"}
        </span>
        {isOpen && <span className="ml-0.5 text-2xl font-black italic tracking-tighter text-indigo-500">2.0</span>}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <div
              key={index}
              onClick={() => {
                if (item.label === "Notifications") setHasUnread(false);
                navigate(item.path);
              }}
              className={`group relative flex items-center p-3.5 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden
              ${active 
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl" 
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {/* Active Indicatior Line */}
              {active && !isOpen && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full"></div>
              )}

              <span className={`text-2xl transition-transform duration-500 ${!active && "group-hover:scale-110 group-active:scale-90"}`}>
                {item.icon}
              </span>

              <span className={`ml-4 text-[14px] font-black tracking-tight transition-all duration-500 ease-out whitespace-nowrap
                ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}
                ${active ? "text-white dark:text-zinc-900" : "text-zinc-800 dark:text-zinc-200"}
              `}>
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="fixed left-[75px] bg-zinc-900 text-white text-[11px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-2 transition-all duration-300 pointer-events-none uppercase tracking-widest z-100 shadow-2xl">
                   {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Quick Access/Bottom Branding Area */}
      {isOpen && (
        <div className="mt-auto px-1 pb-2">
           <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <img 
                 src={user?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                 className="w-8 h-8 rounded-full object-cover shadow-sm bg-white" 
                 alt="me" 
              />
              <div className="overflow-hidden">
                <p className="text-[12px] font-black text-zinc-900 dark:text-white truncate tracking-tight">{user?.username}</p>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter truncate">Premium Hub</p>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
