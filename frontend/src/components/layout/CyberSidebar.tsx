import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Shield, 
  Router, 
  Monitor, 
  Activity, 
  FileText, 
  Settings, 
  LogOut,
  ChevronLeft,
  Home,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Home,
    description: "Security Overview"
  },
  { 
    title: "Router", 
    url: "/router", 
    icon: Router,
    description: "Gateway Security",
    alerts: 2
  },
  { 
    title: "Connected Devices", 
    url: "/devices", 
    icon: Monitor,
    description: "Network Devices"
  },
  { 
    title: "My Device", 
    url: "/my-device", 
    icon: Cpu,
    description: "Local System",
    alerts: 1
  },
  { 
    title: "LAN Monitoring", 
    url: "/monitoring", 
    icon: Activity,
    description: "Live Traffic"
  },
  { 
    title: "Reports", 
    url: "/reports", 
    icon: FileText,
    description: "Security Reports"
  }
];

const systemItems = [
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    description: "Configuration"
  },
  { 
    title: "Logout", 
    url: "/logout", 
    icon: LogOut,
    description: "Exit System"
  }
];

interface CyberSidebarProps {
  currentMode: 'normal' | 'root';
  onLogout: () => void;
}

export function CyberSidebar({ currentMode, onLogout }: CyberSidebarProps) {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return `
      group flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200
      ${active 
        ? 'neon-border-active bg-primary/10 text-primary' 
        : 'text-foreground hover:text-primary hover:bg-primary/5 hover:shadow-cyber'
      }
    `;
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Sidebar className={`${!open ? 'w-16' : 'w-72'} bg-sidebar border-sidebar-border transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {open && (
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary animate-cyber-glow" />
              <div>
                <h2 className="text-xl font-orbitron font-bold text-primary">CyberX</h2>
                <p className="text-xs text-muted-foreground font-code">Security Suite</p>
              </div>
            </div>
          )}
          {!open && (
            <Shield className="h-8 w-8 text-primary animate-cyber-glow mx-auto" />
          )}
        </div>
      </div>

      {/* Mode Indicator */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center">
          <Badge 
            variant={currentMode === 'root' ? 'destructive' : 'secondary'}
            className={`font-code ${!open ? 'px-1' : 'px-3'}`}
          >
            <Zap className="h-3 w-3 mr-1" />
            {!open ? (currentMode === 'root' ? 'R' : 'N') : `${currentMode.toUpperCase()} MODE`}
          </Badge>
        </div>
      </div>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-orbitron font-semibold tracking-wide">
            {open && "SECURITY MODULES"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                      title={!open ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium font-code">{item.title}</span>
                            {item.alerts && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                {item.alerts}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-code">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-orbitron font-semibold tracking-wide">
            {open && "SYSTEM"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.title === "Logout" ? (
                      <button 
                        onClick={handleLogout}
                        className={getNavClassName('/logout')}
                        title={!open ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {open && (
                          <div className="flex-1 min-w-0">
                            <span className="font-medium font-code">{item.title}</span>
                            <p className="text-xs text-muted-foreground font-code">{item.description}</p>
                          </div>
                        )}
                      </button>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        className={getNavClassName(item.url)}
                        title={!open ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {open && (
                          <div className="flex-1 min-w-0">
                            <span className="font-medium font-code">{item.title}</span>
                            <p className="text-xs text-muted-foreground font-code">{item.description}</p>
                          </div>
                        )}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Status Footer */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        {open && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-code">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-success" />
                <span className="status-secure">SECURE</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-code">
              <span className="text-muted-foreground">Last Scan:</span>
              <span className="text-foreground">2 min ago</span>
            </div>
          </div>
        )}
        {!open && (
          <div className="flex justify-center">
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
        )}
      </div>
    </Sidebar>
  );
}