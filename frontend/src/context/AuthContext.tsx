import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    password: string,
    email: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);

      // If it's a demo token, we don't need to validate with the server
      if (storedToken === "demo-token-for-bypassing-auth") {
        console.log("Using demo token - authentication bypassed");
        return;
      }

      // Optional: Validate token with server for real tokens
      // Could add a token validation here for real tokens if needed
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setIsAuthenticated(true);
    } catch (error: any) {
      // Enhanced error handling to capture more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data.message || "Login failed";
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error(
          "No response from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Login error: ${error.message}`);
      }
    }
  };

  const register = async (
    username: string,
    password: string,
    email: string
  ) => {
    try {
      await api.post("/api/auth/register", {
        username,
        password,
        email,
      });
    } catch (error: any) {
      // Enhanced error handling to capture more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage =
          error.response.data.message || "Registration failed";
        const errorDetail = error.response.data.detail || "";
        const validationErrors = error.response.data.errors;

        if (validationErrors) {
          // Handle validation errors
          const errorMsg = validationErrors
            .map((err: any) => err.msg)
            .join(", ");
          throw new Error(`Validation failed: ${errorMsg}`);
        } else if (errorDetail) {
          // Handle detailed error messages from our improved backend
          throw new Error(`${errorMessage}: ${errorDetail}`);
        } else {
          throw new Error(errorMessage);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error(
          "No response from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Registration error: ${error.message}`);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
