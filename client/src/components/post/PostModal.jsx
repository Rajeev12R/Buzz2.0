import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Comments from './Comments'
import { HiXMark, HiChevronLeft, HiChevronRight, HiEllipsisHorizontal, HiHeart, HiOutlineHeart } from 'react-icons/hi2'

const PostModal = ({ posts, setPosts, selectedIndex, setSelectedIndex, onClose, fallbackUser }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    setShowMenu(false);
    setIsEditing(false);
  }, [selectedIndex]);

  useEffect(() => {
    if (posts && posts[selectedIndex] && currentUser) {
      const p = posts[selectedIndex];
      const currentUserId = currentUser._id || currentUser.id;
      setIsLiked(p.likes?.includes(currentUserId) || false);
      setLikesCount(p.likes?.length || 0);
    }
  }, [selectedIndex, posts, currentUser]);

  if (selectedIndex === null || !posts || posts.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    if (selectedIndex < posts.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const post = posts[selectedIndex];
  const author = post.author?.username ? post.author : fallbackUser;

  if (!author) return null;

  const handleEditClick = () => {
    setEditCaption(post.caption || "");
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Post deleted");
      const newPosts = posts.filter(p => p._id !== post._id);
      setPosts(newPosts);
      if (newPosts.length === 0) {
        onClose();
      } else if (selectedIndex >= newPosts.length) {
        setSelectedIndex(newPosts.length - 1);
      }
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/posts/${post._id}`, { caption: editCaption });
      toast.success("Post updated");
      const newPosts = [...posts];
      newPosts[selectedIndex].caption = editCaption;
      setPosts(newPosts);
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update post");
    }
  };

  const handleLike = async () => {
    if (!post) return;
    const currentUserId = currentUser._id || currentUser.id;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const res = await api.put(`/posts/${post._id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);

      const newPosts = [...posts];
      const updatedPost = newPosts[selectedIndex];
      if (res.data.isLiked) {
        if (!updatedPost.likes.includes(currentUserId)) {
          updatedPost.likes.push(currentUserId);
        }
      } else {
        updatedPost.likes = updatedPost.likes.filter(id => id !== currentUserId);
      }
      setPosts(newPosts);
    } catch (err) {
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      toast.error("Failed to like post");
    }
  };

  const actionBar = (
    <div className="px-5 py-4 border-t dark:border-zinc-800">
      <div className="flex gap-4 mb-3">
        <button onClick={handleLike} className="focus:outline-none transition-transform active:scale-90">
          {isLiked ? (
            <HiHeart className="text-[28px] text-rose-500" />
          ) : (
             <HiOutlineHeart className="text-[28px] text-zinc-700 dark:text-zinc-300" />
          )}
        </button>
      </div>
      {likesCount > 0 && (
        <div className="font-extrabold text-[13.5px] tracking-tight mb-1 text-zinc-900 dark:text-zinc-100">
          {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
        </div>
      )}
      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-widest">
        {new Date(post.createdAt).toLocaleDateString(undefined, {
          month: 'long', day: 'numeric', year: 'numeric'
        })}
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-zinc-950/90 backdrop-blur-3xl z-100 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500"
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-110"
      >
        <HiXMark className="text-4xl" />
      </button>

      {selectedIndex > 0 && (
        <button 
          onClick={handlePrev} 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 text-white rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition-all z-110 shadow-2xl border border-white/5"
        >
          <HiChevronLeft className="text-2xl" />
        </button>
      )}

      <div 
        className="bg-white dark:bg-zinc-950 w-full max-w-6xl h-full max-h-[85vh] flex flex-col md:flex-row overflow-hidden relative rounded-4xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border dark:border-zinc-800/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-[60%] h-[50vh] md:h-full bg-zinc-100 dark:bg-black/20 flex items-center justify-center overflow-hidden relative">
           <div className="absolute inset-0 bg-linear-to-b from-black/20 to-transparent pointer-events-none"></div>
           <img 
            src={post.image} 
            alt="post" 
            className="w-full h-full object-contain relative z-10 shadow-2xl"
          />
        </div>

        <div className="w-full md:w-[40%] bg-white dark:bg-zinc-950 flex flex-col h-[50vh] md:h-full border-l dark:border-zinc-800">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b dark:border-zinc-800">
            <div className="flex items-center gap-3.5">
               <div className="p-0.5 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500">
                  <img 
                    src={author.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                    alt="author" 
                    className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-zinc-950"
                  />
               </div>
               <span className="font-black text-sm tracking-tight text-zinc-900 dark:text-zinc-100">{author.username}</span>
            </div>
            
            {currentUser?.username === author.username && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 transition-colors">
                  <HiEllipsisHorizontal className="text-2xl" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-3 w-36 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border dark:border-zinc-800 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                    <button onClick={handleEditClick} className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      Edit Feed
                    </button>
                    <button onClick={handleDelete} className="w-full text-left px-5 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t dark:border-zinc-800 transition-colors">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <Comments postId={post._id} actionBar={actionBar}>
              {isEditing ? (
                <div className="flex flex-col gap-4 p-5 animate-in slide-in-from-top-2">
                  <textarea 
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium outline-none resize-none min-h-[120px] focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Refine your thoughts..."
                  />
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 transition-all">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-5 py-2 text-xs font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:scale-105 active:scale-95 transition-all">Push Update</button>
                  </div>
                </div>
              ) : (
                post.caption && (
                  <div className="flex gap-4 shrink-0 border-b dark:border-zinc-800/50 p-5 pb-6">
                    <img 
                      src={author.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                      alt="author" 
                      className="w-8 h-8 rounded-full object-cover shrink-0 grayscale-[0.2]"
                    />
                    <div className="text-[13.5px] leading-relaxed">
                      <p>
                        <span className="font-black mr-2 text-zinc-900 dark:text-white tracking-tight">{author.username}</span>
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium whitespace-pre-wrap">{post.caption}</span>
                      </p>
                      <time className="block text-[10px] text-zinc-400 mt-2 font-black tracking-widest uppercase">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                )
              )}
            </Comments>
          </div>
        </div>
      </div>

      {selectedIndex < posts.length - 1 && (
        <button 
          onClick={handleNext} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 text-white rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition-all z-110 shadow-2xl border border-white/5"
        >
          <HiChevronRight className="text-2xl" />
        </button>
      )}
    </div>
  )
}

export default PostModal;
