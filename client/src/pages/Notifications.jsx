import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { formatDistanceToNow } from "date-fns";
import SuggestedSidebar from "../components/home/SuggestedSidebar";
import PostModal from "../components/post/PostModal";
import { HiHeart, HiChatBubbleLeftEllipsis, HiUserPlus, HiCheckBadge, HiClock } from 'react-icons/hi2';
import avatar from "../assets/avatar.png";

const Notifications = () => {
  const { user, socket } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleAcceptRequest = async (e, senderId) => {
    e.stopPropagation();
    try {
      await api.put(`/users/request/${senderId}/accept`);
      setNotifications(prev => prev.map(n => 
        (n.type === 'follow_request' && n.sender._id === senderId) 
          ? { ...n, type: 'request_accepted' } 
          : n
      ));
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  const handleRejectRequest = async (e, senderId) => {
    e.stopPropagation();
    try {
      await api.put(`/users/request/${senderId}/reject`);
      setNotifications(prev => prev.map(n => 
        (n.type === 'follow_request' && n.sender._id === senderId) 
          ? { ...n, type: 'request_rejected' } 
          : n
      ));
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.notifications);
        if (res.data.notifications.some(n => !n.isRead)) {
          await api.put("/notifications/read");
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        api.put("/notifications/read").catch(console.error);
      };
      socket.on("newNotification", handleNewNotification);
      return () => {
        socket.off("newNotification", handleNewNotification);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Aligning Hub...</p>
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type) => {
     switch(type) {
       case 'like': return <HiHeart className="text-rose-500" />;
       case 'comment': return <HiChatBubbleLeftEllipsis className="text-blue-500" />;
       case 'follow':
       case 'follow_request':
       case 'request_accepted': 
       case 'accept_request': return <HiUserPlus className="text-indigo-500" />;
       default: return <HiCheckBadge className="text-zinc-400" />;
     }
  };

  return (
    <div className="flex h-screen w-full justify-center bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
      <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col items-center h-full z-10 overflow-y-auto custom-scrollbar relative">
        {/* Professional Glass Header */}
        <div className="sticky top-0 w-full z-30 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-b dark:border-zinc-800 px-6 py-4 mb-6 text-center">
           <h1 className="text-xl font-bold text-zinc-900 dark:text-white uppercase">Notifications</h1>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-2xl px-4 pb-20">
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-32 animate-in fade-in duration-1000">
               <div className="relative mb-10 group opacity-40 grayscale-[0.3]">
                  <img 
                    src={avatar} 
                    alt="No Notifications" 
                    className="w-56 h-56 object-contain transform group-hover:scale-105 transition-all duration-1000" 
                  />
               </div>
               <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2 uppercase">All Clear</h2>
               <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium max-w-xs mx-auto">
                  Your notification center is up to date. We'll let you know when things buzz!
               </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => notification.post && setSelectedPost(notification.post)}
                className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 relative
                ${notification.isRead 
                  ? "bg-white/40 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/50" 
                  : "bg-white dark:bg-zinc-900 shadow-xl border-indigo-500/30 scale-[1.01]" 
                } hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
              >
                {!notification.isRead && (
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></span>
                )}

                <div className="relative shrink-0">
                  <img
                    src={notification.sender?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                    alt={notification.sender?.username}
                    className="w-11 h-11 rounded-full object-cover border dark:border-zinc-800 grayscale-[0.2] group-hover:grayscale-0 transition-all shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-zinc-800 rounded-full shadow-md text-xs border dark:border-zinc-700">
                     {getNotificationIcon(notification.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium leading-relaxed">
                    <span className="font-bold text-zinc-900 dark:text-white mr-1.5 hover:underline decoration-indigo-500/30 underline-offset-4">
                      {notification.sender?.username}
                    </span>
                    {notification.type === "accept_request" && "accepted your follow request."}
                    {notification.type === "request_accepted" && <span className="text-green-500 font-bold">requested to follow you. (Accepted)</span>}
                    {notification.type === "request_rejected" && <span className="text-zinc-500">requested to follow you. (Rejected)</span>}
                    {notification.type === "follow_request" ? (
                      <div className="flex flex-col gap-3 mt-2">
                        <span className="text-zinc-600 dark:text-zinc-400">Requested to follow you.</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleAcceptRequest(e, notification.sender._id)}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-1.5 px-5 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-lg"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={(e) => handleRejectRequest(e, notification.sender._id)}
                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold py-1.5 px-5 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 border dark:border-zinc-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {notification.type === "follow" && "started following you."}
                        {notification.type === "like" && "liked your post."}
                        {notification.type === "comment" && (
                          <span className="italic opacity-80">
                            commented "{notification.text || "on your post"}"
                          </span>
                        )}
                        {!["follow", "like", "comment", "follow_request", "accept_request", "request_accepted", "request_rejected"].includes(notification.type) && notification.type}
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 opacity-60">
                     <HiClock className="text-xs" />
                     {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </div>
                </div>

                {notification.post && notification.post.image && (
                  <div className="shrink-0 relative group/post">
                    <img 
                      src={notification.post.image} 
                      alt="post" 
                      className="w-12 h-12 rounded-xl object-cover border dark:border-zinc-800 shadow-sm transition-all group-hover/post:scale-110"
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/post:opacity-100 transition-opacity rounded-xl"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="hidden lg:block">
        <SuggestedSidebar />
      </div>

      {selectedPost && (
        <PostModal
          posts={[selectedPost]}
          setPosts={() => {}} 
          selectedIndex={0}
          setSelectedIndex={() => {}} 
          onClose={() => setSelectedPost(null)}
          fallbackUser={selectedPost.author}
        />
      )}
    </div>
  );
};

export default Notifications;
