import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("shiwar_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("shiwar_user");
    return stored ? JSON.parse(stored) : null;
  });

  const saveSession = (payload) => {
    localStorage.setItem("shiwar_token", payload.access_token);
    localStorage.setItem("shiwar_user", JSON.stringify(payload.user));
    setToken(payload.access_token);
    setUser(payload.user);
  };

  const login = async (form) => {
    const { data } = await api.post("/auth/login", form);
    saveSession(data);
  };

  const signup = async (form) => {
    const { data } = await api.post("/auth/signup", form);
    saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem("shiwar_token");
    localStorage.removeItem("shiwar_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, signup, logout, isAuthenticated: Boolean(token) }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
