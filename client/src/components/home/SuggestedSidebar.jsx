import React, { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { HiUserPlus } from "react-icons/hi2";

const SuggestedSidebar = ({ onFollow }) => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      const res = await api.get('/users/suggested');
      setSuggestedUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch suggested users:", err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/follow`);
      toast.success(res.data.message || "Action successful");
      setSuggestedUsers(prev => prev.filter(u => u._id !== userId));
      if (onFollow) onFollow();
    } catch (err) {
      toast.error("Failed to follow user");
    }
  };

  return (
    <div className="w-[340px] hidden lg:block px-6 py-8 h-fit sticky top-20">
      <div className="backdrop-blur-xl bg-white/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 p-7 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-1">
             <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">Suggested for you</div>
             <button className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">See All</button>
          </div>

          <div className="flex flex-col gap-6">
            {suggestedUsers.length === 0 ? (
              <div className="text-zinc-400 dark:text-zinc-600 text-[13px] font-medium py-4 text-center">
                 No suggestions right now.
              </div>
            ) : (
              suggestedUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between group/user">
                  <div className="flex gap-3.5 items-center cursor-pointer">
                    <div className="relative p-0.5 rounded-full ring-2 ring-zinc-50 dark:ring-zinc-800 group-hover/user:ring-indigo-500/30 transition-all duration-300">
                      <img
                        src={user.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover grayscale-[0.2] group-hover/user:grayscale-0 transition-all shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] text-zinc-800 dark:text-zinc-100 tracking-tight group-hover/user:text-indigo-600 dark:group-hover/user:text-indigo-400 transition-colors">
                        {user.username}
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-semibold">New to Buzz</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(user._id)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 shadow-md transform active:scale-90"
                  >
                    <HiUserPlus className="text-lg" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
             <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest leading-loose">
               © 2024 Buzz 2.0 From Google Deepmind
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedSidebar;
