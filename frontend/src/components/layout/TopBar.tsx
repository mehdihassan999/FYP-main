import { Bell, Search, Shield, Zap, Wifi, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  currentMode: 'normal' | 'root';
  networkType: 'home' | 'company' | 'education';
  onModeChange: (mode: 'normal' | 'root') => void;
  username: string;
}

export function TopBar({ currentMode, networkType, onModeChange, username }: TopBarProps) {
  const networkTypeLabels = {
    home: 'Home Network',
    company: 'Corporate Network', 
    education: 'Educational Network'
  };

  const alerts = [
    { id: 1, message: "Unauthorized device detected", severity: "critical", time: "2 min ago" },
    { id: 2, message: "Router firmware outdated", severity: "warning", time: "15 min ago" },
    { id: 3, message: "Suspicious traffic detected", severity: "critical", time: "1 hour ago" }
  ];

  const criticalAlerts = alerts.filter(alert => alert.severity === "critical").length;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-colors" />
        
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-primary" />
          <div className="hidden md:block">
            <h1 className="text-lg font-orbitron font-semibold text-primary">CyberX</h1>
            <p className="text-xs text-muted-foreground font-code">Advanced Security Suite</p>
          </div>
        </div>

        {/* Network Info */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-md bg-card border border-border">
          <Wifi className="h-4 w-4 text-primary" />
          <span className="text-sm font-code text-foreground">{networkTypeLabels[networkType]}</span>
        </div>
      </div>

      {/* Center - Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search devices, IPs, vulnerabilities..."
            className="pl-10 bg-input/50 border-border font-code focus:border-primary"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Mode Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={`font-code ${
                currentMode === 'root' 
                  ? 'border-destructive text-destructive hover:bg-destructive/10' 
                  : 'border-primary text-primary hover:bg-primary/10'
              }`}
            >
              <Zap className="h-4 w-4 mr-2" />
              {currentMode.toUpperCase()} MODE
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuLabel className="font-code">Security Mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onModeChange('normal')}
              className="font-code cursor-pointer"
            >
              <span className="text-primary">Normal Mode</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onModeChange('root')}
              className="font-code cursor-pointer"
            >
              <span className="text-destructive">Root/Sudo Mode</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {criticalAlerts > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {criticalAlerts}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card border-border">
            <DropdownMenuLabel className="font-code flex items-center justify-between">
              Security Alerts
              <Badge variant="destructive" className="text-xs">
                {criticalAlerts} Critical
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-center space-x-2 w-full">
                    <AlertTriangle 
                      className={`h-4 w-4 ${
                        alert.severity === 'critical' ? 'text-destructive' : 'text-warning'
                      }`} 
                    />
                    <span className="font-code text-sm flex-1">{alert.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-code ml-6">{alert.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:block font-code text-sm">{username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuLabel className="font-code">User: {username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-code cursor-pointer">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="font-code cursor-pointer">Security Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-code cursor-pointer text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}