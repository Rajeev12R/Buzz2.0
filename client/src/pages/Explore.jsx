import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';
import { HiHeart, HiChatBubbleOvalLeft, HiMagnifyingGlass, HiXCircle } from 'react-icons/hi2';
import ExploreSkeleton from '../components/explore/ExploreSkeleton';
import PostModal from '../components/post/PostModal';
import avatar from "../assets/avatar.png";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [seed, setSeed] = useState(() => Math.random().toString(36).substring(7));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const observer = useRef();

  const lastPostRef = useCallback(node => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, {
      rootMargin: '200px',
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchExplore = async (p) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/explore?page=${p}&seed=${seed}`);
      const newPosts = res.data.posts;
      setPosts(prev => p === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(res.data.hasMore);
    } catch (error) {
      console.error("Error fetching explore posts:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchExplore(page);
    }
  }, [page, seed]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const res = await api.get(`/posts/explore/search?query=${searchQuery}`);
          setSearchResults(res.data.posts);
        } catch (error) {
          console.error("Search Error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const displayedPosts = searchQuery.trim() ? searchResults : posts;

  const getGridSpan = (index) => {
    const i = index % 10;
    if (i === 1 || i === 9) return 'md:col-span-2 md:row-span-2';
    return '';
  };

  if (initialLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto uppercase tracking-widest text-[10px] font-black text-zinc-400 mb-8 border-b dark:border-zinc-800 pb-4">
           Synchronizing Discovery
        </div>
        <div className="max-w-6xl mx-auto">
          <ExploreSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 custom-scrollbar scroll-smooth">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl px-4 py-6 md:px-12 border-b dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-300">
            <HiMagnifyingGlass className="text-xl shrink-0" />
          </div>
          <input 
            type="text" 
            placeholder="Search tags, creators, or inspirations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-14 pr-14 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all outline-none text-[15px] font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <HiXCircle className="text-xl" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-12 py-10">
        {isSearching ? (
          <>
            <div className="uppercase tracking-widest text-[10px] font-black text-zinc-400 mb-8">
               Scanning Database...
            </div>
            <ExploreSkeleton />
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-5 auto-rows-fr">
            {displayedPosts.map((post, index) => (
              <div 
                key={post._id} 
                ref={!searchQuery && index === posts.length - 1 ? lastPostRef : null}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square cursor-pointer group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-xl md:rounded-[2.5rem] border dark:border-zinc-800/50 transition-all duration-500 hover:shadow-[0_15px_45px_rgb(0,0,0,0.1)] ${!searchQuery ? getGridSpan(index) : ''}`}
              >
              <img 
                src={post.image} 
                alt={post.caption} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Premium Lens Hover Overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 sm:gap-10 text-white backdrop-blur-[3px]">
                <div className="flex items-center gap-2 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 ease-out">
                  <HiHeart className="text-2xl sm:text-3xl drop-shadow-md" />
                  <span className="font-black text-lg">{post.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 delay-75 ease-out">
                  <HiChatBubbleOvalLeft className="text-2xl sm:text-3xl drop-shadow-md" />
                  <span className="font-black text-lg">{post.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}

            {!searchQuery && loading && hasMore && (
              <>
                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl overflow-hidden min-h-[150px]" />
                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl overflow-hidden min-h-[150px]" />
                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl overflow-hidden min-h-[150px]" />
              </>
            )}
          </div>
        )}

        {displayedPosts.length === 0 && !loading && !isSearching && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-125"></div>
                <img 
                  src={avatar} 
                  alt="Discovery" 
                  className="relative z-10 w-56 h-56 object-contain drop-shadow-3xl transform group-hover:rotate-6 transition-transform duration-700" 
                />
            </div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">
              {searchQuery ? `Lost in space?` : "Silence in the hub."}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium max-w-sm mb-10 leading-relaxed">
              {searchQuery 
                ? `We couldn't find anything matching "${searchQuery}". Let's try something broader!` 
                : "The discovery feed is currently empty. Check back once creators push new updates!"}
            </p>
            <button 
                onClick={() => setSearchQuery("")} 
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-4 rounded-4xl font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Reset Exploration
              </button>
          </div>
        )}
      </div>

      {selectedIndex !== null && (
        <PostModal 
          posts={displayedPosts} 
          setPosts={searchQuery ? setSearchResults : setPosts} 
          selectedIndex={selectedIndex} 
          setSelectedIndex={setSelectedIndex} 
          onClose={() => setSelectedIndex(null)} 
        />
      )}
    </div>
  );
};

export default Explore;
