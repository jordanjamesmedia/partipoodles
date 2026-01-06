import { useState, useEffect } from "react";

export function useAuth() {
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for admin login state on mount
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    const adminUser = localStorage.getItem("adminUser");
    setIsLocallyAuthenticated(adminLoggedIn === "true" && !!adminUser);
    setIsLoading(false);
  }, []);

  const login = () => {
    localStorage.setItem("adminLoggedIn", "true");
    setIsLocallyAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    setIsLocallyAuthenticated(false);
  };

  // Get user from localStorage
  const getUser = () => {
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      try {
        return JSON.parse(adminUser);
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    user: getUser(),
    isLoading,
    isAuthenticated: isLocallyAuthenticated,
    login,
    logout,
  };
}
