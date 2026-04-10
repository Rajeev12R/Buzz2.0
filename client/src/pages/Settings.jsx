import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { HiOutlineMoon, HiOutlineShieldCheck, HiOutlineAdjustmentsVertical, HiChevronRight } from "react-icons/hi2";

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) return;
    setLoading(true);
    const newStatus = !isPrivate;
    setIsPrivate(newStatus);
    
    try {
      const formData = new FormData();
      formData.append("isPrivate", newStatus);

      const res = await api.put(`/users/${user.username}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(prev => ({ ...prev, isPrivate: res.data.user.isPrivate }));
      toast.success(newStatus ? "Privacy Lock Engaged" : "Privacy Lock Disengaged");
    } catch (err) {
      toast.error("Cloud connection failed");
      setIsPrivate(!newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full w-full overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-zinc-950 relative">
      {/* Ultra-Subtle Background FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20 relative z-10 animate-in fade-in duration-1000">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-16">
            <div className="w-12 h-12 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 shadow-sm border dark:border-zinc-800">
               <HiOutlineAdjustmentsVertical className="text-xl text-indigo-500" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Control Center</h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400 opacity-60">System Configuration Level 1</p>
        </div>

        <div className="flex flex-col gap-1.5">
          {/* CATEGORY: APP AESTHETICS */}
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 opacity-50 px-6 mb-2">App Aesthetics</p>
          
          <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] border dark:border-zinc-800 p-1 mb-8 overflow-hidden transition-all duration-700">
            <div className="flex items-center justify-between p-6 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all group rounded-[2.2rem]">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border dark:border-zinc-700/50">
                      <HiOutlineMoon className="text-lg text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                   </div>
                   <div className="flex flex-col">
                      <h2 className="text-[14px] font-bold text-zinc-900 dark:text-white leading-none mb-1.5">Chromatic Shift</h2>
                      <p className="text-[12px] font-medium text-zinc-400 opacity-80">Toggle between professional light and dark themes.</p>
                   </div>
                </div>
                
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-500 focus:outline-none ${theme === 'dark' ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                >
                  <span 
                    className={`inline-block h-3.5 w-3.5 transform rounded-full transition-all duration-500 shadow-sm ${theme === 'dark' ? 'translate-x-[18px] bg-white dark:bg-zinc-900' : 'translate-x-1 bg-white'}`}
                  />
                </button>
            </div>
          </div>

          {/* CATEGORY: SECURITY CLEARANCE */}
          <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 opacity-50 px-6 mb-2">Security Clearance</p>

          <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] border dark:border-zinc-800 p-1 mb-12 overflow-hidden transition-all duration-700">
            <div className="flex items-center justify-between p-6 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all group rounded-[2.2rem]">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border dark:border-zinc-700/50">
                      <HiOutlineShieldCheck className="text-lg text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                   </div>
                   <div className="flex flex-col">
                      <h2 className="text-[14px] font-bold text-zinc-900 dark:text-white leading-none mb-1.5">Encrypted Reach</h2>
                      <p className="text-[12px] font-medium text-zinc-400 opacity-80 max-w-[280px]">When active, only identified contacts can witness your visuals.</p>
                   </div>
                </div>
                
                <button 
                  onClick={handleToggle}
                  disabled={loading}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-500 focus:outline-none ${isPrivate ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                >
                  <span 
                    className={`inline-block h-3.5 w-3.5 transform rounded-full transition-all duration-500 shadow-sm ${isPrivate ? 'translate-x-[18px] bg-white dark:bg-zinc-900' : 'translate-x-[3px] bg-white text-white'}`}
                  />
                </button>
            </div>

            <div className="flex items-center justify-between p-6 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all group rounded-[2.2rem] opacity-40">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
                   </div>
                   <div className="flex flex-col">
                      <h2 className="text-[14px] font-bold text-zinc-900 dark:text-white leading-none mb-1.5">Identity Verification</h2>
                      <p className="text-[12px] font-medium text-zinc-400">Two-factor authentication and recovery logs.</p>
                   </div>
                </div>
                <HiChevronRight className="text-xl text-zinc-300" />
            </div>
          </div>

          <div className="flex flex-col items-center py-6 text-center">
             <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700">Buzz 2.0 Professional Edition</p>
             <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-200 dark:text-zinc-800 mt-2">Precision Control Center v3.1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
