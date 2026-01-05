import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for admin login state on mount
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    setIsLocallyAuthenticated(adminLoggedIn === "true");
    setIsLoading(false);
  }, []);

  // Check admin authentication with backend
  const { data: adminAuth, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/auth"],
    retry: false,
    enabled: !isLocallyAuthenticated, // Only check backend if not locally authenticated
  });

  const login = () => {
    localStorage.setItem("adminLoggedIn", "true");
    setIsLocallyAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsLocallyAuthenticated(false);
  };

  return {
    user: isLocallyAuthenticated ? { username: "admin", role: "admin" } : (adminAuth as any)?.user,
    isLoading: isLoading || adminLoading,
    isAuthenticated: isLocallyAuthenticated || (adminAuth as any)?.authenticated,
    login,
    logout,
  };
}
