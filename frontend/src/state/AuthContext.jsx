import { startTransition, useEffect, useState } from "react";
import { request } from "../lib/api";
import { AuthContext } from "./auth-context";

const STORAGE_KEY = "purplemerit-auth";

function readStoredSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setSession] = useState(readStoredSession);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }, [token, user]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    request("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setSession({ token, user: data.user });
          setIsBootstrapping(false);
        });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setSession({ token: null, user: null });
          setIsBootstrapping(false);
        });
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(credentials) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    setSession({ token: data.token, user: data.user });
    return data.user;
  }

  async function register(payload) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSession({ token: data.token, user: data.user });
    return data.user;
  }

  function logout() {
    setIsBootstrapping(false);
    setSession({ token: null, user: null });
  }

  function updateUser(nextUser) {
    setSession((current) => ({ ...current, user: nextUser }));
  }

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isBootstrapping,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
