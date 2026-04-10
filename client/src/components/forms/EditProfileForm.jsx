import React, { useState } from "react";
import api from "../../services/api";
import { HiXMark, HiCheck, HiUser, HiIdentification, HiChatBubbleBottomCenterText } from 'react-icons/hi2';

const EditProfileForm = ({ user, setUser, setIsEditing, username }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    username: user.username || "",
    bio: user.bio || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/users/${username}`, formData);
      setUser(res.data.user);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl max-w-[420px] w-full rounded-4xl shadow-2xl border dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="border-b dark:border-zinc-800 px-8 py-5 flex items-center justify-between bg-white/10 dark:bg-zinc-900/20">
          <div className="flex flex-col">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-900 dark:text-white leading-none mb-1.5">Edit Identity</h2>
            <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 opacity-60">Security Clearance Level 1</p>
          </div>
          <button 
            type="button" 
            onClick={() => setIsEditing(false)}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            <HiXMark className="text-lg opacity-60 hover:opacity-100" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          
          {/* USERNAME FIELD */}
          <div className="flex flex-col gap-2 group">
            <div className="flex items-center gap-2 opacity-40 group-focus-within:opacity-100 transition-opacity">
               <HiUser className="text-[10px]" />
               <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Username Identifier</label>
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Unique identifier..."
              className="bg-zinc-50 dark:bg-black/20 border dark:border-zinc-800 rounded-xl p-3.5 text-[13px] font-medium outline-none text-zinc-900 dark:text-white focus:ring-1 focus:ring-indigo-500/40 transition-all placeholder:text-[12px] placeholder:opacity-30"
            />
          </div>

          {/* FULL NAME FIELD */}
          <div className="flex flex-col gap-2 group">
            <div className="flex items-center gap-2 opacity-40 group-focus-within:opacity-100 transition-opacity">
               <HiIdentification className="text-[10px]" />
               <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Display Identity</label>
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your professional name..."
              className="bg-zinc-50 dark:bg-black/20 border dark:border-zinc-800 rounded-xl p-3.5 text-[13px] font-medium outline-none text-zinc-900 dark:text-white focus:ring-1 focus:ring-indigo-500/40 transition-all placeholder:text-[12px] placeholder:opacity-30"
            />
          </div>

          {/* BIO FIELD */}
          <div className="flex flex-col gap-2 group">
            <div className="flex items-center gap-2 opacity-40 group-focus-within:opacity-100 transition-opacity">
               <HiChatBubbleBottomCenterText className="text-[10px]" />
               <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Bio / Creative Summary</label>
            </div>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell your story to the world..."
              className="bg-zinc-50 dark:bg-black/20 border dark:border-zinc-800 rounded-2xl p-4 text-[13px] font-medium min-h-[120px] outline-none text-zinc-900 dark:text-white resize-none focus:ring-1 focus:ring-indigo-500/40 transition-all placeholder:text-[12px] placeholder:opacity-30 leading-relaxed custom-scrollbar shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-300 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/5 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-2.5 h-2.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <HiCheck className="text-sm" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
