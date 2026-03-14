import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
  });
  const [loading, setLoading] = useState(true);

  // 1. Load tokens from appropriate storage on mount
  useEffect(() => {
    const loadTokens = () => {
      // Check localStorage first (remember me)
      let savedTokens = localStorage.getItem("tokens");

      if (!savedTokens) {
        // Fallback to sessionStorage (current session only)
        savedTokens = sessionStorage.getItem("tokens");
      }

      if (savedTokens) {
        try {
          const parsedTokens = JSON.parse(savedTokens);
          setTokens(parsedTokens); // Triggers 2nd useEffect
        } catch (e) {
          clearTokens(); // Corrupted data
        }
      }
      setLoading(false);
    };

    loadTokens();
  }, []);

  // ✅ 2. Initialize session when tokens exist
  useEffect(() => {
    const initializeSession = async () => {
      if (!tokens.accessToken) return; // Skip if no token

      setLoading(true);
      try {
        // Try refresh first (cookies handle this)
        await api.get("/refreshAccessToken").catch(() => {});
        const res = await api.get("/auth/current");
        setUser(res.data.data);
        console.log("✅ Session restored:", res.data.data);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log("❌ Invalid tokens, clearing...");
          logoutUser();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [tokens.accessToken]); // ✅ Re-run when tokens loaded

  const clearTokens = () => {
    localStorage.removeItem("tokens");
    sessionStorage.removeItem("tokens");
    setTokens({ accessToken: null, refreshToken: null });
    setUser(null);
  };

  const loginUser = async ({ username, password }, rememberMe = false) => {
    const { data } = await api.post("/auth/login", { username, password });
    console.log(data);
    const tokensData = {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
    // ✅ New param
    const tokenString = JSON.stringify(tokensData);

    if (rememberMe) {
      // Persist across browser closes
      localStorage.setItem("tokens", tokenString);
      sessionStorage.removeItem("tokens"); // Clear temp
    } else {
      // Clear on browser close
      sessionStorage.setItem("tokens", tokenString);
      localStorage.removeItem("tokens"); // Clear persistent
    }

    setTokens(tokensData);
  };

  const logoutUser = () => {
    clearTokens();
    window.location.href = "/login"; // Force full reload to clear state
  };

  const registerUser = async ({
    name,
    username,
    email,
    password,
    gender,
    avatarUrl,
  }) => {
    const payload = {
      name,
      username,
      email,
      password,
      gender,
    };
    if (avatarUrl?.trim()) payload.avatarUrl = avatarUrl.trim();
    const { data } = await api.post("/auth/register", payload);
    return data;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/current");
      setUser(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return null;
    }
  };

  const value = {
    user,
    tokens,
    loginUser,
    registerUser,
    logoutUser,
    refreshUser,
    isAuthenticated: !!user && !!tokens.accessToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthProvider;
