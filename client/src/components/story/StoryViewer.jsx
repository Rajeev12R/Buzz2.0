import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const STORY_DURATION = 15000; // Default max time for images

const StoryViewer = ({ groupedStories, initialUserIndex, onClose }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const userGroup = groupedStories[currentUserIndex];
  const story = userGroup?.stories[currentStoryIndex];

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const elapsedBeforePauseRef = useRef(0);
  const durationRef = useRef(STORY_DURATION);

  const startTimer = (dur) => {
    durationRef.current = dur;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = elapsedBeforePauseRef.current + (now - startTimeRef.current);
      const newProgress = (elapsed / dur) * 100;

      if (newProgress >= 100) {
        clearInterval(timerRef.current);
        setProgress(100);
      } else {
        setProgress(newProgress);
      }
    }, 50);
  };

  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress]);

  useEffect(() => {
    if (!story) {
      onClose();
      return;
    }

    // reset timers
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    startTimeRef.current = Date.now();
    setIsPaused(false);

    if (story.mediaType === 'image') {
      startTimer(STORY_DURATION);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [currentUserIndex, currentStoryIndex, story]);

  const pauseTimer = () => {
    if (isPaused) return;
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    elapsedBeforePauseRef.current += elapsed;
    if (videoRef.current) videoRef.current.pause();
  };

  const resumeTimer = () => {
    if (!isPaused) return;
    setIsPaused(false);
    startTimeRef.current = Date.now();

    if (videoRef.current) {
      videoRef.current.play();
    }
    startTimer(durationRef.current);
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const dur = Math.min((videoRef.current.duration * 1000) || STORY_DURATION, 15000);
      startTimer(dur);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < userGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < groupedStories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose(); // End of all stories
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      const prevUser = groupedStories[currentUserIndex - 1];
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(prevUser.stories.length - 1);
    } else {
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
      startTimer(durationRef.current);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  if (!userGroup || !story) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-[#1a1a1a] flex items-center justify-center sm:py-8 backdrop-blur-md">

      {/* Universal Desktop Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-8 z-210 p-2 text-white hover:text-gray-300 transition-colors drop-shadow-md cursor-pointer"
      >
        <svg color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
          <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
          <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
        </svg>
      </button>

      {/* Desktop Web Navigation Hover Arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        className="hidden sm:flex absolute left-8 md:left-24 top-1/2 -translate-y-1/2 z-210 w-8 h-8 items-center justify-center bg-white/30 hover:bg-white/50 rounded-full transition-colors backdrop-blur-md shadow-lg cursor-pointer"
      >
        <svg color="white" fill="white" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="16.502 3 7.498 12 16.502 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline></svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="hidden sm:flex absolute right-8 md:right-24 top-1/2 -translate-y-1/2 z-210 w-8 h-8 items-center justify-center bg-white/30 hover:bg-white/50 rounded-full transition-colors backdrop-blur-md shadow-lg cursor-pointer"
      >
        <svg color="white" fill="white" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="8 3 17.004 12 8 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline></svg>
      </button>

      {/* Main Story Envelope */}
      <div
        className="relative w-full h-full sm:max-w-[420px] sm:max-h-[85vh] sm:rounded-[12px] overflow-hidden flex flex-col items-center justify-center bg-neutral-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] select-none"
        onPointerDown={pauseTimer}
        onPointerUp={resumeTimer}
        onPointerLeave={resumeTimer}
      >

        {/* Progress Bars Stack */}
        <div className="absolute top-0 left-0 right-0 z-30 flex gap-[3px] p-2 pt-3 drop-shadow-md bg-linear-to-b from-black/60 to-transparent">
          {userGroup.stories.map((s, idx) => {
            let p = 0;
            if (idx < currentStoryIndex) p = 100;
            if (idx === currentStoryIndex) p = Math.min(progress, 100);
            return (
              <div key={s._id || idx} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${p}%` }} />
              </div>
            );
          })}
        </div>

        {/* Profile Header Line */}
        <div className="absolute top-4 left-0 right-0 z-30 flex items-center justify-between px-3 pt-2">
          <div className="flex items-center gap-2">
            <img src={userGroup.user.profilePic || "https://via.placeholder.com/32"} alt="avatar" className="w-8 h-8 rounded-full border border-white/20 hover:opacity-80 transition-opacity cursor-pointer shadow-sm" />
            <span className="text-white font-semibold text-[13px] drop-shadow-md cursor-pointer hover:underline">{userGroup.user.username}</span>
            <span className="text-white/80 text-[12px] drop-shadow-sm ml-1 font-medium">
              {Math.floor((Date.now() - new Date(story.createdAt)) / (1000 * 60 * 60)) || '<1'}h
            </span>
          </div>
          {/* Mobile display close icon inside screen */}
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="sm:hidden text-white font-bold text-xl z-50 p-2 cursor-pointer drop-shadow-md hover:text-gray-300">✕</button>
        </div>

        {/* Media Block */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none overflow-hidden bg-black">

          <div className="z-10 w-full h-full flex items-center justify-center">
            {story.mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={story.media}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoLoaded}
                onEnded={handleNext}
              />
            ) : (
              <img src={story.media} alt="story" className="w-full h-full object-contain drop-shadow-2xl" />
            )}
          </div>
        </div>

        {/* Navigation Swipes (Z-20 invisible layer on top of media) */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-[30%] h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
          <div className="w-[70%] h-full cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StoryViewer;
