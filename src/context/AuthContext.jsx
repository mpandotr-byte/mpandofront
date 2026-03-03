import React, { createContext, useContext, useState, useEffect } from "react";
import { setToken, removeToken, getToken } from "../api/client";

const AuthContext = createContext();

// Provider

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setTokenState] = useState(null);

  const [loading, setLoading] = useState(true);

  // App açıldığında localStorage kontrol

  useEffect(() => {
    const storedToken = getToken();

    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setTokenState(storedToken);

      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // LOGIN

  const login = (data) => {
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));

    setTokenState(data.token);

    setUser(data.user);
  };

  // LOGOUT

  const logout = () => {
    removeToken();

    localStorage.removeItem("user");

    setTokenState(null);

    setUser(null);
  };

  const value = {
    user,

    token,

    login,

    logout,

    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

// Hook

export const useAuth = () => {
  return useContext(AuthContext);
};
