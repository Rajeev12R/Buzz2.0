import React, { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { HiPhoto, HiXMark, HiFaceSmile } from 'react-icons/hi2'

const Create = () => {
  const [caption, setCaption] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      return toast.error("Select media to share!")
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("caption", caption)

    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      toast.success("Post created!")
      navigate(`/${user.username}`)
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 w-full h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar relative flex items-center justify-center p-6 lg:p-12">
      {/* High-End Background FX */}
      <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-linear-to-tr from-indigo-500/10 via-purple-500/5 to-transparent blur-[160px] rounded-full pointer-events-none opacity-60"></div>

      <div className="z-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl max-w-7xl w-full rounded-[3.5rem] shadow-[0_35px_100px_-15px_rgba(0,0,0,0.1)] dark:shadow-none border dark:border-zinc-800 transition-all duration-700 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* MINIMAL HEADER */}
        <div className="border-b dark:border-zinc-800/80 px-12 py-8 flex items-center justify-center bg-white/10 dark:bg-zinc-900/10">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-[0.3em] opacity-80">New Post</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full lg:min-h-[620px]">
          
          {/* THE CANVAS: FULL-IMAGE MEDIA FOCUS */}
          <div className="flex-[1.8] flex flex-col items-center justify-center bg-zinc-950 transition-all duration-1000 border-r dark:border-zinc-800/80 relative overflow-hidden group">
            
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black animate-in fade-in duration-1000">
                <img src={preview} alt="preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-8 right-8 bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 rounded-2xl p-4 shadow-2xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 z-20"
                >
                  <HiXMark className="text-2xl" />
                </button>
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center bg-zinc-50/20 dark:bg-black/20 hover:bg-white dark:hover:bg-zinc-900/60 border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 cursor-pointer transition-all duration-1000 group relative"
              >
                <div className="flex flex-col items-center p-12 lg:p-16">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-700 border dark:border-zinc-700/50">
                    <HiPhoto className="text-5xl text-zinc-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-white tracking-[0.3em] text-[13px] uppercase opacity-30 group-hover:opacity-60 transition-opacity">Select Media</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* THE SETTINGS: COMPOSITION */}
          <div className="flex-1 p-10 lg:p-14 flex flex-col justify-between bg-white/5 dark:bg-zinc-900/5">
            <div className="flex flex-col h-full gap-12">
              <div className="flex items-center gap-5">
                <img
                  src={user?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover border dark:border-zinc-800 shadow-xl opacity-80"
                />
                <span className="font-bold text-zinc-900 dark:text-white text-[16px] tracking-tight">{user?.username}</span>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell the story behind this buzz..."
                  className="w-full flex-1 outline-none text-[16px] font-medium leading-[1.8] bg-transparent text-zinc-800 dark:text-zinc-100 resize-none placeholder:text-zinc-400 placeholder:italic pr-4 custom-scrollbar"
                  maxLength={2200}
                />

                <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800/80 opacity-30 group-focus-within:opacity-100 transition-all duration-700">
                  <button type="button" className="text-3xl hover:scale-125 transition-transform grayscale hover:grayscale-0">😊</button>
                  <span className="text-[12px] font-bold tracking-widest text-zinc-400">
                    {caption.length} / 2200
                  </span>
                </div>
              </div>

              <div className="mt-14 relative group">
                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className={`relative w-full py-6 rounded-3xl font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all duration-700 active:scale-95
                    ${loading || !file
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed opacity-40 shadow-none"
                      : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] shadow-indigo-500/10"
                    }`}
                >
                  {loading ? "Sharing..." : "Share"}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Create;