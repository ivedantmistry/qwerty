// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import SignIn from "./pages/SignIn";
import ProductManagement from "./pages/ProductManagement";
import LabAssistantDataEntry from "./pages/LabAssistantDataEntry";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import SupervisorValidation from "./pages/SupervisorValidation"; // Import SupervisorValidation
import { useEffect, useState } from "react";
import { getCurrentUser, UserRole } from "./utils/auth";

const queryClient = new QueryClient();

// Auth wrapper that checks for specific roles
const RoleBasedAuthWrapper = ({
  children,
  allowedRoles,
  exactRole = false,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  exactRole?: boolean;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Check if user is logged in and has the required role
    const user = getCurrentUser();
    let authorized = false;

    if (user) {
      setUserRole(user.role);
      if (exactRole) {
        // For exact role matching (manager-only pages)
        authorized = allowedRoles.includes(user.role);
      } else {
        // For hierarchical role access (pages accessible to higher roles too)
        const roleHierarchy: Record<UserRole, number> = {
          lab_assistant: 1,
          supervisor: 2,
          manager: 3,
        };

        const userRoleLevel = roleHierarchy[user.role];
        const minRequiredLevel = Math.min(
          ...allowedRoles.map((role) => roleHierarchy[role])
        );

        authorized = userRoleLevel >= minRequiredLevel;
      }
    }

    setIsAuthenticated(!!authorized);
    setLoading(false);
  }, [allowedRoles, exactRole]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Redirect to the correct dashboard if accessing the root path
  if (window.location.pathname === "/") {
    if (userRole === "manager") {
      return <Navigate to="/product-management" replace />;
    } else if (userRole === "supervisor") {
      return <Navigate to="/supervisor-dashboard" replace />;
    } else if (userRole === "lab_assistant") {
      return <Navigate to="/lab-assistant/data-entry" replace />;
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="chemical-portal-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/sign-in" element={<SignIn />} />

            {/* Manager Routes (only accessible by manager) */}
            <Route
              path="/product-management"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["manager"]}
                  exactRole={true}
                >
                  <ProductManagement />
                </RoleBasedAuthWrapper>
              }
            />
            <Route
              path="/user-management"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["manager"]}
                  exactRole={true}
                >
                  <div className="p-4">User Management (To be implemented)</div>
                </RoleBasedAuthWrapper>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["manager"]}
                  exactRole={true}
                >
                  <div className="p-4">
                    Manager Dashboard (To be implemented)
                  </div>
                </RoleBasedAuthWrapper>
              }
            />

            {/* Supervisor Routes (accessible by supervisor and manager) */}
            <Route
              path="/supervisor-dashboard"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["supervisor"]}
                  exactRole={false}
                >
                  <div className="p-4">
                    Supervisor Dashboard (To be implemented)
                  </div>
                </RoleBasedAuthWrapper>
              }
            />
            <Route
              path="/quality-control"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["supervisor"]}
                  exactRole={false}
                >
                  <div className="p-4">Quality Control (To be implemented)</div>
                </RoleBasedAuthWrapper>
              }
            />
            <Route
              path="/approvals"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["supervisor"]}
                  exactRole={false}
                >
                  <SupervisorValidation />{" "}
                  {/* Updated to use SupervisorValidation */}
                </RoleBasedAuthWrapper>
              }
            />

            {/* Lab Assistant Routes (accessible by lab_assistant, supervisor, and manager) */}
            <Route
              path="/lab-assistant/data-entry"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["lab_assistant"]}
                  exactRole={false}
                >
                  <LabAssistantDataEntry />
                </RoleBasedAuthWrapper>
              }
            />

            {/* Common Routes (accessible by all roles) */}
            <Route
              path="/reports"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["lab_assistant"]}
                  exactRole={false}
                >
                  <Reports />
                </RoleBasedAuthWrapper>
              }
            />
            <Route
              path="/profile"
              element={
                <RoleBasedAuthWrapper
                  allowedRoles={["lab_assistant"]}
                  exactRole={false}
                >
                  <div className="p-4">Profile (To be implemented)</div>
                </RoleBasedAuthWrapper>
              }
            />

            {/* Root Route (Redirects based on role) */}
            <Route
              path="/"
              element={
                <RoleBasedAuthWrapper allowedRoles={["lab_assistant"]}>
                  <div />
                </RoleBasedAuthWrapper>
              }
            />

            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
