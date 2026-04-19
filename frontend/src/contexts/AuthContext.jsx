import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMeApi, loginApi, registerApi } from "../services/authService";
import { ROLES, STORAGE_TOKEN_KEY } from "../utils/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await getMeApi();
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
      }

      try {
        const me = await getMeApi();
        if (isMounted) {
          setUser(me);
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
    };

    window.addEventListener("swm:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("swm:unauthorized", handleUnauthorized);
    };
  }, [clearAuth]);

  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials);
    localStorage.setItem(STORAGE_TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    const me = await getMeApi();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => registerApi(payload), []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === ROLES.ADMIN,
      isLecturer: user?.role === ROLES.LECTURER,
      isStudent: user?.role === ROLES.STUDENT,
      login,
      logout,
      register,
      refreshMe,
    }),
    [loading, login, logout, refreshMe, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
