import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { io } from "socket.io-client";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    const BACKENDURL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchUser = async() => {
            try {
                const res = await api.get(`${BACKENDURL}/auth/me`, {
                 withCredentials: true
                });
                setUser(res.data.user);
            } catch (error) {
                setUser(null);
            } finally{
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            const socketInstance = io(BACKENDURL || "http://localhost:5000", {
                withCredentials: true
            });
            setSocket(socketInstance);
            
            socketInstance.emit("addUser", user._id);
            
            return () => {
                socketInstance.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{user, setUser, loading, socket}}>
            {children}
        </AuthContext.Provider>
    )
}