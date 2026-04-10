import React, { useState, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../services/api"
import { HiUser, HiLockClosed, HiMail, HiArrowNarrowRight } from "react-icons/hi"
import avatars from "../../assets/avatar.png"

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
  })
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || (!isLogin && !formData.fullName)) {
        return toast.error("All fields are required");
    }
    try {
      const BACKENDURL = import.meta.env.VITE_BACKEND_URL;
      const url = isLogin ? `${BACKENDURL}/auth/login` : `${BACKENDURL}/auth/register`;
      const res = await api.post(url, formData);
      toast.success(res.data.message || "Success");
      setUser(res.data.user);
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.message || "Login/Signup Failed")
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 auth-mesh-bg animate-mesh relative overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none"></div>

      <div className="w-full max-w-4xl min-h-[600px] backdrop-blur-3xl bg-white/80 dark:bg-zinc-950/40 border border-white/50 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden relative z-10 hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.3)] transition-all duration-700 ease-out group/card">
        
        <div className="w-full md:w-1/2 bg-linear-to-br from-indigo-600 to-fuchsia-700 text-white flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
           
           <div className="relative z-20 space-y-8 max-w-xs">
              <div className="relative w-56 h-56 mx-auto group-hover/card:scale-105 transition-transform duration-700 ease-out">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-75 animate-pulse"></div>
                
                <img 
                  src={avatars} 
                  alt="Connections" 
                  className="relative z-20 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] filter brightness-105" 
                />
                
                <div className="absolute top-4 right-4 w-3 h-3 bg-white/40 backdrop-blur-sm rounded-full animate-bounce delay-100 ring-2 ring-white/20"></div>
                <div className="absolute bottom-8 left-0 w-2 h-2 bg-indigo-200/50 rounded-full animate-ping ring-2 ring-white/10"></div>
              </div>
              
              <div className="space-y-3 mt-0!">
                <h1 className="text-5xl font-black tracking-tighter drop-shadow-sm">Buzz <span className="text-indigo-200">2.0</span></h1>
                <p className="text-white/80 text-lg font-medium tracking-tight leading-snug">
                  Experience the next <br />
                  era of social connection.
                </p>
              </div>
              
              <div className="pt-10 flex items-center justify-center gap-6">
                 <div className="flex flex-col items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-2xl font-black tracking-tighter">100K</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Creators</span>
                 </div>
                 <div className="flex flex-col items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-2xl font-black tracking-tighter">5M+</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Streams</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-14 justify-center bg-white/30 dark:bg-transparent">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
              {isLogin ? "Welcome back" : "Get started"}
            </h2>
            <div className="h-1.5 w-12 bg-indigo-600 rounded-full mb-6 mx-auto md:mx-0"></div>
            <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium leading-relaxed max-w-xs">
              {isLogin ? "Digital life waiting for you. Sign in to your portal." : "Join our community of visionaries and creators today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            {!isLogin && (
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-indigo-600 transition-colors duration-300">
                  <HiUser className="text-xl" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Official Name"
                  className="w-full bg-white dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
            )}
            
            <div className="relative group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-indigo-600 transition-colors duration-300">
                <HiMail className="text-xl" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Unique Username"
                className="w-full bg-white dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            <div className="relative group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-indigo-600 transition-colors duration-300">
                <HiLockClosed className="text-xl" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Secret Password"
                className="w-full bg-white dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black py-4 rounded-2xl shadow-xl shadow-zinc-950/20 hover:shadow-indigo-500/30 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transform active:scale-[0.98] transition-all duration-300 w-full flex items-center justify-center gap-2 group/btn"
            >
              <span>{isLogin ? "Authenticate" : "Create Portal"}</span>
              <HiArrowNarrowRight className="text-xl translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-500 text-sm font-bold tracking-tight">
                {isLogin ? "New to Buzz?" : "Part of the collective?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-indigo-600 dark:text-indigo-400 font-black hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors"
                >
                  {isLogin ? "Forge an account" : "Authorize access"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Auth
