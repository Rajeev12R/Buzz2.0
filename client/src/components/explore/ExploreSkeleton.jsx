import React from 'react';

const ExploreSkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4 pb-10">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className={`relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded-xl md:rounded-4xl border border-zinc-200/50 dark:border-zinc-800/50 ${
            i % 10 === 1 || i % 10 === 9 ? 'md:col-span-2 md:row-span-2' : ''
          }`}
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-indigo-500/5 dark:via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
          
          {/* Pulse center point */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExploreSkeleton;
