export type UserRole = 'lab_assistant' | 'supervisor' | 'manager';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

// API Base URL (change this as needed)
const API_BASE_URL = "http://127.0.0.1:8000/api"; // Update with your actual Django backend URL

// Login Function (Authenticates via Django API)
export const login = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    
    // Store tokens
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    // Fetch user details
    const user = await fetchUserDetails();
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return user;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};

// Fetch Current User Details (Uses JWT Token)
export const fetchUserDetails = async (): Promise<User | null> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return null;

    const response = await fetch(`${API_BASE_URL}/me/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    return null;
  }
};

// Logout Function (Removes tokens from storage)
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// Check if the user has the required role
export const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const userString = localStorage.getItem("user");
  if (!userString) return false;

  try {
    const user = JSON.parse(userString) as User;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
    return false;
  }
};

// Get the current user (from local storage)
export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem("user");
  if (!userString) return null;

  try {
    return JSON.parse(userString) as User;
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
    return null;
  }
};

// Refresh Token Function (if using access/refresh tokens)
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      logout(); // If refresh fails, log out the user
      return null;
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.access);
    return data.access;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
};

// Get role name for display
export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case "lab_assistant":
      return "Lab Assistant";
    case "supervisor":
      return "Supervisor";
    case "manager":
      return "Manager";
    default:
      return "Unknown Role";
  }
};

