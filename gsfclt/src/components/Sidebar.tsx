import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  FileText,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Beaker,
  LogOut,
  LayoutDashboard,
  Shield,
  ListChecks,
  Users,
  CheckCheck,
  TrendingUp,
  Package,
  Settings,
} from "lucide-react";
import logo from "../asessts/gsfcltd.jpeg";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, UserRole, getRoleName } from "../utils/auth";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
      setUserName(user.username || "User"); // Set the username from getCurrentUser
    }
  }, []);

  // Common menu items for all roles
  const commonMenuItems = [
    {
      title: "Products",
      icon: <LayoutGrid className="h-5 w-5" />,
      path: "/lab-assistant/data-entry", // Updated path
      active: location.pathname === "/lab-assistant/data-entry", // Updated active check
      roles: ["lab_assistant", "supervisor", "manager"] as UserRole[],
    },
    {
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      path: "/reports",
      active: location.pathname === "/reports",
      roles: ["lab_assistant", "supervisor", "manager"] as UserRole[],
    },
    {
      title: "Profile",
      icon: <UserCircle className="h-5 w-5" />,
      path: "/profile",
      active: location.pathname === "/profile",
      roles: ["lab_assistant", "supervisor", "manager"] as UserRole[],
    },
  ];

  // Role-specific menu items
  const roleSpecificMenuItems = [
    {
      title: "Supervisor Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/supervisor-dashboard",
      active: location.pathname === "/supervisor-dashboard",
      roles: ["supervisor", "manager"] as UserRole[],
    },
    {
      title: "Quality Control",
      icon: <ListChecks className="h-5 w-5" />,
      path: "/quality-control",
      active: location.pathname === "/quality-control",
      roles: ["supervisor", "manager"] as UserRole[],
    },
    {
      title: "Approvals",
      icon: <CheckCheck className="h-5 w-5" />,
      path: "/approvals",
      active: location.pathname === "/approvals",
      roles: ["supervisor", "manager"] as UserRole[],
    },
    {
      title: "Manager Dashboard",
      icon: <TrendingUp className="h-5 w-5" />,
      path: "/manager-dashboard",
      active: location.pathname === "/manager-dashboard",
      roles: ["manager"] as UserRole[],
    },
    {
      title: "User Management",
      icon: <Users className="h-5 w-5" />,
      path: "/user-management",
      active: location.pathname === "/user-management",
      roles: ["manager"] as UserRole[],
    },
    {
      title: "Product Management",
      icon: <Package className="h-5 w-5" />,
      path: "/product-management",
      active: location.pathname === "/product-management",
      roles: ["manager"] as UserRole[],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = [
    ...commonMenuItems,
    ...roleSpecificMenuItems,
  ].filter((item) => userRole && item.roles.includes(userRole));

  // Keep handleSignOut untouched as requested
  const handleSignOut = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
        credentials: "include",
      });
    }

    // Clear stored tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account",
    });

    navigate("/sign-in");
  };

  return (
    <div
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r transition-all duration-300 dark:border-chemical-700",
        collapsed ? "w-16" : "w-64"
      )}
    >
     <div className="flex items-center p-4 h-16 border-b dark:border-chemical-700">
  {!collapsed && (
    <div className="flex items-center">
      <img
        src={logo} // Replace with the actual path to your image
        alt="Lab Logo"
        className="h-6 w-6" // Matches the original Beaker size
      />
      <h1 className="ml-2 text-lg font-semibold truncate dark:text-white">
        Lab - GSFC Ltd
      </h1>
    </div>
  )}
  {collapsed && (
    <img
      src={logo} // Replace with the actual path to your image
      alt="Lab Logo"
      className="h-6 w-6 mx-auto" // Matches the original collapsed Beaker styling
    />
  )}
</div>

      {!collapsed && (
        <div className="p-4 border-b dark:border-chemical-700">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground">
              {userRole ? getRoleName(userRole) : ""}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {filteredMenuItems.map((item) => (
            <li key={item.title}>
              <Button
                variant={item.active ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.active
                    ? "bg-accent1 hover:bg-accent1/90 text-white"
                    : "hover:bg-chemical-100 dark:hover:bg-chemical-800",
                  collapsed ? "px-2" : "px-4"
                )}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="py-2 px-2">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white hover:border-red-700",
            collapsed ? "px-2" : "px-4"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>

      <div
        className={cn(
          "flex items-center border-t p-4 dark:border-chemical-700",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && <ThemeToggle />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-accent1 hover:text-accent1/90 hover:bg-accent1/10"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
