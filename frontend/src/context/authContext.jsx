"use client";

import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

export const AuthContext = createContext(null);

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL
});

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRegister = async (username, email, password) => {
    const request = await client.post("/register", {
      username,
      email,
      password,
    });
    return request.data;
  };

  const handleLogin = async (email, password) => {
    const request = await client.post("/login", {
      email,
      password,
    });

    localStorage.setItem("token", request.data.token);
    setUserData(request.data.user);
    router.push("/dashboard");
    setIsLoggedIn(true);

    return request.data;
  };
   
  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);          // THIS triggers instant UI update
    router.push("/dashboard");
  };
  
   // Check token on first load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, setUserData, handleRegister, handleLogin,handleLogout, handleLoginSuccess }}
    >
      {children}
    </AuthContext.Provider>
  );
};
