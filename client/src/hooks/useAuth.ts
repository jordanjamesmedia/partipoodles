import { useState } from "react";

// Check auth synchronously from localStorage
const checkAuthFromStorage = () => {
  const adminLoggedIn = localStorage.getItem("adminLoggedIn");
  const adminUser = localStorage.getItem("adminUser");
  return adminLoggedIn === "true" && !!adminUser;
};

export function useAuth() {
  // Initialize synchronously from localStorage to avoid rendering issues
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(() => checkAuthFromStorage());

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
    isLoading: false, // No async loading - we check synchronously
    isAuthenticated: isLocallyAuthenticated,
    login,
    logout,
  };
}
