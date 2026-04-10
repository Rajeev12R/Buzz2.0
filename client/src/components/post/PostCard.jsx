import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiHeart, HiOutlineHeart, HiChatBubbleLeft, HiPaperAirplane, HiEllipsisHorizontal } from 'react-icons/hi2';

const PostCard = ({ post, onCommentClick }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const overlayTimeout = useRef(null);

  useEffect(() => {
    if (post && currentUser) {
      const currentUserId = currentUser._id || currentUser.id;
      setIsLiked(post.likes?.includes(currentUserId) || false);
      setLikesCount(post.likes?.length || 0);
    }
  }, [post, currentUser]);

  const handleLike = async () => {
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const res = await api.put(`/posts/${post._id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
      
      const currentUserId = currentUser._id || currentUser.id;
      if (res.data.isLiked) {
        if (!post.likes.includes(currentUserId)) {
            post.likes.push(currentUserId);
        }
      } else {
        post.likes = post.likes.filter(id => id !== currentUserId);
      }
    } catch (err) {
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      toast.error("Failed to like post");
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    
    setShowHeartOverlay(true);
    if (overlayTimeout.current) clearTimeout(overlayTimeout.current);
    
    overlayTimeout.current = setTimeout(() => {
      setShowHeartOverlay(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-[470px] mx-auto mb-8 group/card">
      <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:bg-zinc-900/90">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-5">
          <div className="flex items-center gap-3">
            <div className="relative p-[1.5px] rounded-full bg-linear-to-tr from-indigo-500 to-purple-600">
               <img 
                src={post.author?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                alt="author" 
                className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-zinc-900 cursor-pointer hover:opacity-90 transition-opacity"
              />
            </div>
            <div className="flex flex-col">
               <span className="font-bold text-[13px] tracking-tight cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                 {post.author?.username || "Unknown"}
               </span>
               <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium">
                 {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric'
                 })}
               </span>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 transition-colors">
             <HiEllipsisHorizontal className="text-2xl" />
          </button>
        </div>

        {/* Image Container */}
        <div 
          className="w-full relative bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center cursor-pointer select-none overflow-hidden aspect-4/5 sm:aspect-square"
          onDoubleClick={handleDoubleTap}
        >
          <img 
            src={post.image} 
            alt="post" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-[1.02]" 
          />
          
          {/* Animated Heart Overlay */}
          <div 
            className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-all duration-500 ease-out ${
              showHeartOverlay ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <HiHeart className="text-white text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
          </div>
        </div>

        {/* Action Bar & Content */}
        <div className="p-5 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <button 
                onClick={handleLike} 
                className="focus:outline-none transition-all active:scale-75 hover:scale-110"
              >
                {isLiked ? (
                  <HiHeart className="text-[28px] text-rose-500 drop-shadow-sm" />
                ) : (
                  <HiOutlineHeart className="text-[28px] text-zinc-700 dark:text-zinc-300" />
                )}
              </button>
              
              <button 
                onClick={onCommentClick} 
                className="focus:outline-none transition-all hover:scale-110 text-zinc-700 dark:text-zinc-300 active:scale-95"
              >
                <HiChatBubbleLeft className="text-[26px]" />
              </button>
              
              <button className="focus:outline-none transition-all hover:scale-110 text-zinc-700 dark:text-zinc-300 active:scale-95">
                 <HiPaperAirplane className="text-[26px] -rotate-12" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {likesCount > 0 && (
              <div className="font-extrabold text-[13px] tracking-tight text-zinc-800 dark:text-zinc-100">
                {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
              </div>
            )}

            {post.caption && (
              <div className="text-[13.5px] leading-relaxed">
                <span className="font-bold mr-2 text-zinc-900 dark:text-zinc-100">{post.author?.username || "Unknown"}</span>
                <span className="text-zinc-600 dark:text-zinc-400 font-medium whitespace-pre-wrap">{post.caption}</span>
              </div>
            )}

            <button 
               className="text-zinc-400 dark:text-zinc-500 text-[12px] font-bold hover:text-indigo-500 transition-colors pt-1" 
               onClick={onCommentClick}
            >
              View all comments
            </button>

            <div 
              className="flex gap-3 mt-3 items-center cursor-pointer group/input" 
              onClick={onCommentClick}
            >
                <img 
                  src={currentUser?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                  className="w-6 h-6 rounded-full object-cover grayscale group-hover/input:grayscale-0 transition-all opacity-60 group-hover/input:opacity-100" 
                  alt="me" 
                />
                <input 
                  role="button"
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 text-[13px] bg-transparent outline-none placeholder-zinc-400 dark:placeholder-zinc-600 cursor-text pointer-events-none font-medium" 
                  readOnly
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
