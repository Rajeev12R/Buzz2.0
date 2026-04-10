import React, { useState, useEffect } from "react";
import api from "../services/api";
import PostCard from "../components/post/PostCard";
import PostModal from "../components/post/PostModal";
import Stories from "../components/home/Stories";
import SuggestedSidebar from "../components/home/SuggestedSidebar";
import toast from "react-hot-toast";
import { HiSparkles } from "react-icons/hi2";
import avatar from "../assets/avatar.png";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full justify-center bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <div className="flex-1 flex flex-col items-center max-w-4xl px-4 py-8 overflow-y-auto custom-scrollbar scroll-smooth">
        
        {/* Header Branding (Mobile/Small screens focus) */}
        <div className="w-full max-w-[470px] mb-6 flex items-center justify-between lg:hidden">
           <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white italic">Buzz 2.0</h1>
           <button className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
              <HiSparkles className="text-indigo-600" />
           </button>
        </div>

        <Stories refreshTrigger={refreshTrigger} />

        <div className="flex flex-col gap-6 w-full items-center">
          {loading ? (
            <div className="mt-20 flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
               <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Syncing your world...</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <PostCard
                key={post._id}
                post={post}
                onCommentClick={() => setSelectedPostIndex(index)}
              />
            ))
          )}

          {!loading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-sm">
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
                <img 
                  src={avatar} 
                  alt="Connect" 
                  className="relative z-10 w-48 h-48 object-contain drop-shadow-2xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" 
                />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">Quiet morning?</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-[15px] font-medium leading-relaxed mb-8">
                Your feed is empty. Start following people to see their latest moments here!
              </p>
              <button 
                onClick={() => window.location.href = '/explore'} 
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Discover Creators
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Sidebar Wrapper (Desktop only) */}
      <SuggestedSidebar onFollow={() => setRefreshTrigger(prev => prev + 1)} />

      {selectedPostIndex !== null && (
        <PostModal
          posts={posts}
          setPosts={setPosts}
          selectedIndex={selectedPostIndex}
          setSelectedIndex={setSelectedPostIndex}
          onClose={() => setSelectedPostIndex(null)}
          fallbackUser={posts[selectedPostIndex]?.author}
        />
      )}
    </div>
  );
};

export default Home;