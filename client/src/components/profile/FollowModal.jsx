import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { HiXMark } from "react-icons/hi2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const FollowModal = ({ isOpen, onClose, username, initialTab = "followers" }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isMyProfile = currentUser?.username === username;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchConnections();
    }
  }, [isOpen, username, initialTab]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${username}/connections`);
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);
    } catch (err) {
      console.error(err);
      toast.error("Cloud connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFollower = async (followerId) => {
    try {
      await api.put(`/users/${followerId}/remove-follower`);
      setFollowers(prev => prev.filter(u => u._id !== followerId));
      toast.success("Follower removed");
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleToggleFollow = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/follow`);
      toast.success(res.data.message);
      if (isMyProfile && activeTab === "following") {
        setFollowing(prev => prev.filter(u => u._id !== userId));
      } else {
        fetchConnections();
      }
    } catch (err) {
      toast.error("Transmission failed");
    }
  };

  if (!isOpen) return null;

  const currentList = activeTab === "followers" ? followers : following;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xl p-4 animate-in fade-in duration-500"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-4xl w-full max-w-[340px] flex flex-col overflow-hidden shadow-2xl border dark:border-zinc-800 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b dark:border-zinc-800 px-6 py-4 bg-white/10 dark:bg-zinc-900/20">
          <div className="flex-1" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-white text-center flex-1 whitespace-nowrap">
            {activeTab === "followers" ? "Followers" : "Following"}
          </h2>
          <div className="flex-1 flex justify-end">
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
              <HiXMark className="text-lg opacity-60 hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b dark:border-zinc-800 bg-white/5 dark:bg-black/10">
          <button 
            className={`flex-1 py-4 text-center text-[10px] font-bold uppercase tracking-widest transition-all relative
              ${activeTab === 'followers' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 opacity-60 hover:opacity-100'}`}
            onClick={() => setActiveTab("followers")}
          >
            {followers.length} Followers
            {activeTab === 'followers' && <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-indigo-500 rounded-full"></div>}
          </button>
          <button 
            className={`flex-1 py-4 text-center text-[10px] font-bold uppercase tracking-widest transition-all relative
              ${activeTab === 'following' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 opacity-60 hover:opacity-100'}`}
            onClick={() => setActiveTab("following")}
          >
            {following.length} Following
            {activeTab === 'following' && <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-indigo-500 rounded-full"></div>}
          </button>
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] custom-scrollbar p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 transition-all">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-4 animate-pulse">Connecting...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 border dark:border-zinc-700 opacity-40">
                <span className="text-2xl grayscale">👤</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 opacity-60 italic">No {activeTab} identified</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {currentList.map(u => {
                const isMe = u._id === currentUser?._id;
                return (
                  <div key={u._id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-all group">
                    <div 
                      className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                      onClick={() => { onClose(); navigate(`/${u.username}`); }}
                    >
                      <img 
                        src={u.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                        alt={u.username}
                        className="w-11 h-11 rounded-full object-cover shrink-0 border border-zinc-100 dark:border-zinc-800 shadow-sm group-hover:scale-105 transition-all"
                      />
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-[14px] truncate text-zinc-900 dark:text-white leading-none mb-1">{u.username}</span>
                        <span className="text-[11px] font-medium text-zinc-400 truncate opacity-80">{u.fullName}</span>
                      </div>
                    </div>
                    
                    {!isMe && isMyProfile && (
                      <div className="shrink-0 flex gap-2 pl-2">
                        <button 
                          onClick={() => handleToggleFollow(u._id)}
                          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200/50 dark:shadow-none"
                        >
                          {activeTab === "followers" ? "Follow Back" : "Followed"}
                        </button>
                      </div>
                    )}

                    {!isMe && !isMyProfile && (
                       <button 
                         onClick={() => handleToggleFollow(u._id)}
                         className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200/50 dark:shadow-none"
                       >
                         Follow
                       </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
