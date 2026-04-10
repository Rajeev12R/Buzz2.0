import React, { useState, useEffect, useRef, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate, useParams } from "react-router-dom"
import api from "../services/api"
import EditProfileForm from "../components/forms/EditProfileForm"
import PostModal from "../components/post/PostModal"
import FollowModal from "../components/profile/FollowModal"
import { HiUserPlus, HiOutlineSquares2X2, HiOutlineBookmark, HiOutlineIdentification, HiCamera, HiXMark } from 'react-icons/hi2'

const Profile = () => {
  const { username } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("POSTS")
  const [selectedPostIndex, setSelectedPostIndex] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followModalTab, setFollowModalTab] = useState("followers")
  const imageInputRef = useRef();
  const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${username}`)
        setUser(res.data.user)
        setPosts(res.data.posts || [])
      } catch (error) {
        console.log(error)
      }
    }
    fetchUser()
  }, [username])

  const handleEditProfile = () => setIsEditing(true)

  if (!user) return (
    <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
       <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setAuthUser(null);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.put(`/users/${username}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const isMyProfile = authUser?.username === user.username;

  return (
    <div className="flex-1 h-full w-full overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-zinc-950 relative">
      {/* Ultra-Subtle Background FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-40 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-6 py-8 lg:py-12 relative z-10 animate-in fade-in duration-1000">
        
        {/* ULTRA-SUBTLE HEADER */}
        <div className="flex flex-col items-center text-center mb-10">
            <div className="relative group mb-5">
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu((prev) => !prev)
                }}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 cursor-pointer overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm transition-all duration-700 hover:scale-105"
              >
                <img
                  src={user.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>

              {showMenu && (
                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-xl rounded-xl w-40 z-50 p-1 border dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    className="w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-[9px] font-bold uppercase tracking-widest text-zinc-500 rounded-lg transition-colors"
                    onClick={() => { setShowImageModal(true); setShowMenu(false); }}
                  >
                    View Avatar
                  </button>
                  <button
                    className="w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-[9px] font-bold uppercase tracking-widest text-zinc-500 rounded-lg transition-colors"
                    onClick={() => { imageInputRef.current.click(); setShowMenu(false); }}
                  >
                    Update Visual
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex flex-col items-center gap-2.5">
               <div>
                  <h2 className="text-lg lg:text-xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">{user.fullName || user.username}</h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 opacity-50 italic mt-0.5">@{user.username}</p>
               </div>

               {user.bio && (
                 <p className="text-[12px] font-medium leading-relaxed text-zinc-400 dark:text-zinc-500 max-w-sm px-6 italic opacity-80">
                   "{user.bio}"
                 </p>
               )}

               {/* LOW-PROFILE STATS */}
               <div className="flex items-center gap-6 mt-2 opacity-60">
                  <div className="flex items-center gap-1.5">
                     <span className="text-[12px] font-bold text-zinc-900 dark:text-white">{posts.length}</span>
                     <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Postings</span>
                  </div>
                  <button 
                     onClick={() => { setFollowModalTab("followers"); setShowFollowModal(true); }}
                     className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
                  >
                     <span className="text-[12px] font-bold text-zinc-900 dark:text-white">{user.followers?.length || 0}</span>
                     <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Followers</span>
                  </button>
                  <button 
                     onClick={() => { setFollowModalTab("following"); setShowFollowModal(true); }}
                     className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
                  >
                     <span className="text-[12px] font-bold text-zinc-900 dark:text-white">{user.following?.length || 0}</span>
                     <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Following</span>
                  </button>
               </div>

               <div className="flex items-center gap-2.5 mt-4">
                  {isMyProfile ? (
                    <>
                      <button
                        onClick={handleEditProfile}
                        className="px-5 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border dark:border-zinc-800 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-5 py-2 bg-zinc-50 dark:bg-zinc-900/50 text-red-500/60 hover:text-red-500 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-colors"
                      >
                        Log-out
                      </button>
                    </>
                  ) : (
                    <button className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5">
                       <HiUserPlus className="text-[10px]" />
                       Follow
                    </button>
                  )}
               </div>
            </div>
        </div>

        {/* ULTRA-MINIMAL TABS */}
        <div className="flex justify-center gap-10 mb-6 border-b dark:border-zinc-900 pb-0.5">
          {[
            { id: "POSTS", icon: HiOutlineSquares2X2, label: "Feed" },
            { id: "SAVED", icon: HiOutlineBookmark, label: "Archives" },
            { id: "TAGGED", icon: HiOutlineIdentification, label: "Identified" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2 pb-2.5 text-[8px] font-bold uppercase tracking-[0.2em] transition-all relative
                ${activeTab === tab.id ? "text-zinc-900 dark:text-white" : "text-zinc-400 opacity-40 hover:opacity-100"}`}
            >
              <tab.icon className="text-[11px]" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-indigo-500/60 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* GRID: ULTRA-CLEAN */}
        <div className="min-h-[300px]">
          {activeTab === "POSTS" && (
            <div className="grid grid-cols-3 gap-1 animate-in fade-in duration-1000">
              {posts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <HiCamera className="text-xl text-zinc-300 mb-2" />
                  <p className="text-[9px] font-bold uppercase tracking-widest">No Visuals Identified</p>
                </div>
              ) : (
                posts.map((post, index) => (
                  <div
                    key={post._id}
                    className="aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-lg cursor-pointer overflow-hidden relative group border dark:border-zinc-800/50"
                    onClick={() => setSelectedPostIndex(index)}
                  >
                    <img src={post.image} alt="post" className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "SAVED" && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 animate-in fade-in duration-500">
               <HiOutlineBookmark className="text-xl text-zinc-300 mb-2" />
               <p className="text-[9px] font-bold uppercase tracking-widest">Private Archives</p>
            </div>
          )}

          {activeTab === "TAGGED" && (
             <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 animate-in fade-in duration-500">
                <HiOutlineIdentification className="text-xl text-zinc-300 mb-2" />
                <p className="text-[9px] font-bold uppercase tracking-widest">Identified Visuals</p>
             </div>
          )}
        </div>

        {/* MODALS */}
        {isEditing && (
          <EditProfileForm
            user={user}
            setUser={setUser}
            setIsEditing={setIsEditing}
            username={username}
          />
        )}

        {selectedPostIndex !== null && (
          <PostModal
            posts={posts}
            setPosts={setPosts}
            selectedIndex={selectedPostIndex}
            setSelectedIndex={setSelectedPostIndex}
            onClose={() => setSelectedPostIndex(null)}
            fallbackUser={user}
          />
        )}

        {showImageModal && (
          <div
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center z-100 animate-in fade-in duration-300 p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-black p-1 rounded-3xl shadow-2xl relative group overflow-hidden border dark:border-zinc-800"
            >
              <img
                src={user.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                alt="profile"
                className="max-w-[360px] max-h-[360px] object-contain rounded-2xl"
              />
              <button 
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-zinc-900/40 backdrop-blur-md text-white rounded-full p-2 hover:bg-zinc-900/60 transition-all opacity-0 group-hover:opacity-100"
              >
                 <HiXMark size={16} />
              </button>
            </div>
          </div>
        )}

        <FollowModal
          isOpen={showFollowModal}
          onClose={() => {
            setShowFollowModal(false);
            api.get(`/users/${username}`).then(res => setUser(res.data.user)).catch(console.error);
          }}
          username={username}
          initialTab={followModalTab}
        />
      </div>
    </div>
  )
}

export default Profile;
