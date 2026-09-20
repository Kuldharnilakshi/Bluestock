import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { joinUserRoom } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("heartsync_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("heartsync_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Load profile when token exists on startup
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profileData = await api.profile.get();
          setUser(profileData);
          localStorage.setItem("heartsync_user", JSON.stringify(profileData));
          if (profileData?.id) {
            joinUserRoom(profileData.id);
          }
        } catch (err) {
          console.error("Failed to load user profile with token:", err);
          if (err.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    setToken(data.token);
    localStorage.setItem("heartsync_token", data.token);

    // Fetch full profile if user object only has basic info
    try {
      const fullProfile = await api.profile.get();
      setUser(fullProfile);
      localStorage.setItem("heartsync_user", JSON.stringify(fullProfile));
      if (fullProfile?.id) {
        joinUserRoom(fullProfile.id);
      }
    } catch {
      setUser(data.user);
      localStorage.setItem("heartsync_user", JSON.stringify(data.user));
      if (data.user?.id) {
        joinUserRoom(data.user.id);
      }
    }

    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.auth.register(name, email, password);
    setToken(data.token);
    localStorage.setItem("heartsync_token", data.token);

    try {
      const fullProfile = await api.profile.get();
      setUser(fullProfile);
      localStorage.setItem("heartsync_user", JSON.stringify(fullProfile));
      if (fullProfile?.id) {
        joinUserRoom(fullProfile.id);
      }
    } catch {
      setUser(data.user);
      localStorage.setItem("heartsync_user", JSON.stringify(data.user));
      if (data.user?.id) {
        joinUserRoom(data.user.id);
      }
    }

    return data;
  };

  const updateProfile = async (profileData) => {
    const data = await api.profile.update(profileData);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("heartsync_user", JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("heartsync_token");
    localStorage.removeItem("heartsync_user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
