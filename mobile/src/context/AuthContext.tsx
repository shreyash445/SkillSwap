import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearTokens, getRefresh, getToken, post, setTokens } from "../api";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateMe: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const me = await api<User>("GET", "/auth/me");
          setUser(me);
        }
      } catch {
        await clearTokens();
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await post<{ access: string; refresh: string; user: User }>("/auth/login", {
      email,
      password,
    });
    await setTokens(res.access, res.refresh);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; first_name: string; last_name?: string }) => {
      const res = await post<{ access: string; refresh: string; user: User }>("/auth/register", data);
      await setTokens(res.access, res.refresh);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(async () => {
    const refresh = await getRefresh();
    try {
      await post("/auth/logout", { refresh });
    } catch {
      /* ignore */
    }
    await clearTokens();
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await api<User>("GET", "/auth/me");
    setUser(me);
  }, []);

  const updateMe = useCallback(async (patch: Partial<User>) => {
    const me = await api<User>("PATCH", "/auth/me", patch);
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, refreshMe, updateMe }),
    [user, initializing, login, register, logout, refreshMe, updateMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}