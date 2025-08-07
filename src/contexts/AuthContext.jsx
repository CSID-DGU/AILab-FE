import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      try {
        // Check for stored auth token or session
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);

          // TODO: Verify token with server
          // const response = await fetch("/api/auth/verify", {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // if (!response.ok) {
          //   throw new Error("Token invalid");
          // }
        }
      } catch {
        // Clear invalid stored data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(credentials)
      // });

      // if (!response.ok) {
      //   throw new Error("Login failed");
      // }

      // const data = await response.json();

      // Mock login for development
      const mockUser = {
        id: 1,
        name: "홍길동",
        email: credentials.email,
        role: credentials.email.includes("admin") ? "ADMIN" : "USER",
        department: "컴퓨터공학과",
        studentId: "2021123456",
        phone: "010-1234-5678",
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store user data and token
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", mockToken);

      setUser(mockUser);
      setIsAuthenticated(true);

      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/auth/signup", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(userData)
      // });

      // if (!response.ok) {
      //   throw new Error("Signup failed");
      // }

      // Mock signup for development
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    signup,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
