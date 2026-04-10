import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const Comments = ({ postId, children, actionBar }) => {
  const [comments, setComments] = useState([]);
  const [repliesMap, setRepliesMap] = useState({});
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({}); 
  const { user } = useContext(AuthContext);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`);
      setComments(res.data.comments);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch comments");
    }
  };

  const loadReplies = async (commentId) => {
    try {
      const res = await api.get(`/comments/replies/${commentId}`);
      setRepliesMap(prev => ({ ...prev, [commentId]: res.data.replies }));
      setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    } catch (err) {
      toast.error("Failed to load replies");
    }
  };

  const handleReplyClick = (comment) => {
    const rootId = comment.parentComment || comment._id;
    setReplyingTo({ rootId, username: comment.user?.username });
    
    // Automatically prefill input with @username
    const prefix = `@${comment.user?.username} `;
    if (!text.startsWith(prefix)) {
      setText(prefix);
    }
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const payload = { postId, text };
      if (replyingTo) {
        payload.parentComment = replyingTo.rootId;
      }

      const res = await api.post('/comments', payload);
      const newComment = {
        ...res.data.comment,
        user: {
          _id: user?._id || user?.id,
          username: user?.username,
          profilePic: user?.profilePic
        }
      };

      if (replyingTo) {
        setRepliesMap(prev => {
          const existingReplies = prev[replyingTo.rootId] || [];
          return {
            ...prev,
            [replyingTo.rootId]: [...existingReplies, newComment]
          };
        });
        setExpandedReplies(prev => ({ ...prev, [replyingTo.rootId]: true }));
      } else {
        setComments([newComment, ...comments]);
      }

      setText("");
      setReplyingTo(null);
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setText("");
  };

  const renderComment = (c, isReply = false) => (
    <div key={c._id} className={`flex gap-3 text-sm ${isReply ? 'mt-3 pl-8' : ''}`}>
      <img 
        src={c.user?.profilePic || "https://via.placeholder.com/32"} 
        alt="author" 
        className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover shrink-0 mt-1 cursor-pointer`} 
      />
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm cursor-pointer hover:text-gray-600">{c.user?.username || "Unknown"}</span>
          <span className="text-[11px] text-gray-400">
            {new Date(c.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric'
            })}
          </span>
        </div>
        <span className="whitespace-pre-wrap text-[13.5px] text-gray-800 mt-[2px]">{c.text}</span>
        
        <div className="flex gap-4 mt-1 items-center">
          <button onClick={() => handleReplyClick(c)} className="text-[11px] font-semibold text-gray-500 hover:text-gray-800">
            Reply
          </button>
        </div>

        {/* View Replies Button */}
        {!isReply && (
          <div className="mt-1">
            {expandedReplies[c._id] && repliesMap[c._id] && repliesMap[c._id].length > 0 && (
              <button 
                onClick={() => setExpandedReplies(prev => ({ ...prev, [c._id]: false }))} 
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-2"
              >
                <span className="w-6 h-px bg-gray-300 inline-block"></span> Hide replies
              </button>
            )}

            {!expandedReplies[c._id] && !repliesMap[c._id] && (
              <button 
                onClick={() => loadReplies(c._id)} 
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-2"
              >
                <span className="w-6 h-px bg-gray-300 inline-block"></span> View replies
              </button>
            )}

            {!expandedReplies[c._id] && repliesMap[c._id] && repliesMap[c._id].length > 0 && (
              <button 
                onClick={() => setExpandedReplies(prev => ({ ...prev, [c._id]: true }))} 
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-2"
              >
                <span className="w-6 h-px bg-gray-300 inline-block"></span> View {repliesMap[c._id].length} replies
              </button>
            )}
          </div>
        )}

        {/* Nested Replies */}
        {!isReply && expandedReplies[c._id] && repliesMap[c._id] && (
          <div className="flex flex-col">
            {repliesMap[c._id].map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden w-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {children}
        
        {comments.map((c) => renderComment(c, false))}
        
        {comments.length === 0 && (
          <div className="text-gray-500 text-[13px] text-center mt-10">
            No comments yet. Be the first!
          </div>
        )}
      </div>
      
      <div className="border-t bg-white shrink-0 flex flex-col">
        {actionBar}
        {replyingTo && (
          <div className="w-full bg-gray-100 flex items-center justify-between px-4 py-2 text-[12px] text-gray-600 border-b">
            <span>Replying to <span className="font-semibold">{replyingTo.username}</span></span>
            <button onClick={cancelReply} className="hover:text-black font-bold">✕</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3 items-center w-full p-4">
          <input 
            ref={inputRef}
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent py-1"
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="text-blue-500 font-semibold text-sm disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default Comments;
