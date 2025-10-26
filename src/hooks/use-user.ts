"use client";

import { useState, useEffect, useRef } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
}

// Global cache untuk menghindari multiple fetch
let globalUserCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double fetch in strict mode
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      // Check global cache first
      if (globalUserCache && Date.now() - globalUserCache.timestamp < CACHE_DURATION) {
        setUser(globalUserCache.user);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const response = await fetch("/api/user/me", {
        // Add cache headers to leverage browser cache
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          globalUserCache = { user: null, timestamp: Date.now() };
          return;
        }
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data.user);
      
      // Update global cache
      globalUserCache = { user: data.user, timestamp: Date.now() };
    } catch (err) {
      console.error("Fetch user error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  const clearCache = () => {
    globalUserCache = null;
  };

  return {
    user,
    isLoading,
    error,
    isAdmin,
    refetch: fetchUser,
    clearCache,
  };
}
