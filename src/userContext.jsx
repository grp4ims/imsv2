import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userID, setUserID] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const isTokenValid = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false); // Mark loading as done
      return false;
    }

    try {
      const response = await fetch(
        "http://localhost:3002/auth_jwt/verify-token",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok && data.user) {
        setUserRole(data.user.role);
        setUserID(data.user.id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    isTokenValid();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userRole,
        setUserRole,
        isAuthenticated,
        setIsAuthenticated: (auth) => {
          setIsAuthenticated(auth);
          if (auth) isTokenValid(); // Trigger verification after login
        },
        userID,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
