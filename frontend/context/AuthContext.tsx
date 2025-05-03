import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getToken, saveToken, removeToken } from "../utils/token";
import { getUserInfo } from "@/api/authService";

type MobileType = string | null;

type AuthContextType = {
  token: string | null;
  isVerified: boolean;
  mobile: MobileType;
  isAuthenticated: boolean;
  loading: boolean; // 👈 New
  login: (
    token: string,
    verified: boolean,
    mobile: MobileType
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [mobile, setMobile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        try {
          const response = await getUserInfo(storedToken);
          await login(storedToken, response.is_verified, response.mobile);
        } catch (error) {
          await logout();
        }
      } else {
        await logout();
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    token: string,
    verified: boolean,
    mobile: MobileType
  ) => {
    await saveToken(token);
    setIsAuthenticated(true);
    setToken(token);
    setIsVerified(verified);
    setMobile(mobile);
  };

  const logout = async () => {
    await removeToken();
    setIsAuthenticated(false);
    setToken(null);
    setIsVerified(false);
    setMobile(null);
  };

  const authValues = useMemo(
    () => ({
      token,
      isVerified,
      mobile,
      isAuthenticated,
      loading,
      login,
      logout,
    }),
    [token, isVerified, mobile, isAuthenticated, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
