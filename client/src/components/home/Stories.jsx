import React, { useRef, useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import StoryViewer from '../story/StoryViewer';
import toast from 'react-hot-toast';
import { HiPlus } from 'react-icons/hi';

const Stories = ({ refreshTrigger = 0 }) => {
  const containerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  
  const [groupedStories, setGroupedStories] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user: currentUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStories();
  }, [refreshTrigger]);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      setGroupedStories(res.data.stories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [groupedStories]);

  const scrollByAmount = (amount) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 15) {
                toast.error("Video duration cannot exceed 15 seconds!");
                fileInputRef.current.value = "";
                return;
            }
            proceedUpload(file);
        }
        video.src = URL.createObjectURL(file);
    } else {
        proceedUpload(file);
    }
  };

  const proceedUpload = async (file) => {
    const formData = new FormData();
    formData.append('media', file);
    
    setIsUploading(true);
    toast.loading('Uploading story...', { id: 'story-upload' });
    try {
      await api.post('/stories', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Story uploaded!', { id: 'story-upload' });
      fetchStories(); 
    } catch (err) {
      toast.error('Failed to upload story', { id: 'story-upload' });
    } finally {
      setIsUploading(false);
      fileInputRef.current.value = "";
    }
  };

  const currentUserId = currentUser?._id || currentUser?.id;
  const currentUserStoryGroupIndex = groupedStories.findIndex(
    (g) => g.user._id === currentUserId
  );

  return (
    <div className="w-full max-w-[470px] mx-auto mb-8 relative px-1">
      {/* Left Navigation Arrow */}
      {showLeftScroll && (
        <button 
          onClick={() => scrollByAmount(-300)}
          className="absolute -left-3 top-[34px] z-20 w-7 h-7 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200"
        >
          <svg className="w-4 h-4 text-zinc-800 dark:text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Stories Scroll Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-5">
          {/* Your Story Tile */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 w-[68px] group">
            <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
             
             <div 
               className={`w-16 h-16 rounded-full cursor-pointer relative transition-all duration-300 ${isUploading ? 'opacity-50' : 'group-hover:scale-105 active:scale-95'}`}
               onClick={() => {
                 if (isUploading) return;
                 if (currentUserStoryGroupIndex !== -1) {
                   setSelectedUserIndex(currentUserStoryGroupIndex);
                 } else {
                   fileInputRef.current.click();
                 }
               }}
             >
                {currentUserStoryGroupIndex !== -1 ? (
                  <div className="w-full h-full rounded-full p-[2.5px] bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                    <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-full p-[2px]">
                      <img src={currentUser?.profilePic || "https://via.placeholder.com/66"} alt="you" className="w-full h-full rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center relative ring-2 ring-zinc-100 dark:ring-zinc-800 p-0.5">
                     <img src={currentUser?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} alt="you" className="w-full h-full rounded-full object-cover" />
                     <div 
                       className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-lg z-10 cursor-pointer group-hover:bg-indigo-500 transition-colors" 
                       onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                     >
                       <HiPlus className="text-white text-xs" />
                     </div>
                  </div>
                )}
             </div>
             <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors">Your story</span>
          </div>

          {/* Other Users' Stories */}
          {groupedStories.map((group, index) => {
            if (group.user._id === currentUserId) return null;
            
            return (
              <div key={group.user._id} className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 w-[68px] group" onClick={() => setSelectedUserIndex(index)}>
                <div className="w-16 h-16 rounded-full p-[2.5px] bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl group-hover:scale-105 active:scale-95 transition-all duration-300">
                  <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-full p-[2px]">
                    <img 
                      src={group.user.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                      alt={group.user.username} 
                      className="w-full h-full rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors truncate w-full text-center">
                   {group.user.username}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Navigation Arrow */}
      {showRightScroll && (
        <button 
          onClick={() => scrollByAmount(300)}
          className="absolute -right-3 top-[34px] z-20 w-7 h-7 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200"
        >
           <svg className="w-4 h-4 text-zinc-800 dark:text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* The Story Viewer Overlay */}
      {selectedUserIndex !== null && (
        <StoryViewer 
           groupedStories={groupedStories} 
           initialUserIndex={selectedUserIndex} 
           onClose={() => setSelectedUserIndex(null)} 
        />
      )}
    </div>
  );
};

export default Stories;
