import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Palette, 
  Volume2,
  Bell,
  Network,
  Key,
  User,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsData {
  mode: 'normal' | 'root';
  theme: {
    accentColor: string;
    darkMode: boolean;
    animationsEnabled: boolean;
  };
  notifications: {
    soundEnabled: boolean;
    criticalAlerts: boolean;
    emailNotifications: boolean;
    desktopNotifications: boolean;
  };
  scanning: {
    autoScan: boolean;
    scanInterval: number; // minutes
    autoFix: boolean;
    deepScan: boolean;
  };
  network: {
    interface: string;
    monitoringEnabled: boolean;
    packetCapture: boolean;
    trafficLogging: boolean;
  };
  security: {
    sessionTimeout: number; // minutes
    requireAuth: boolean;
    encryptReports: boolean;
    logLevel: string;
  };
  user: {
    username: string;
    email: string;
    networkType: string;
  };
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsData>({
    mode: 'normal',
    theme: {
      accentColor: 'cyan',
      darkMode: true,
      animationsEnabled: true
    },
    notifications: {
      soundEnabled: true,
      criticalAlerts: true,
      emailNotifications: false,
      desktopNotifications: true
    },
    scanning: {
      autoScan: true,
      scanInterval: 60,
      autoFix: false,
      deepScan: false
    },
    network: {
      interface: 'eth0',
      monitoringEnabled: true,
      packetCapture: false,
      trafficLogging: true
    },
    security: {
      sessionTimeout: 30,
      requireAuth: true,
      encryptReports: true,
      logLevel: 'info'
    },
    user: {
      username: 'admin',
      email: 'admin@cyberx.local',
      networkType: 'home'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isElevating, setIsElevating] = useState(false);

  const updateSettings = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    toast.info('Saving settings...', {
      description: 'Applying configuration changes'
    });

    // Simulate save process
    setTimeout(() => {
      setHasChanges(false);
      toast.success('Settings saved', {
        description: 'All configuration changes have been applied'
      });
    }, 1500);
  };

  const handleReset = () => {
    toast.info('Settings reset', {
      description: 'All settings have been restored to defaults'
    });
    setHasChanges(false);
  };

  const handleModeSwitch = async () => {
    if (settings.mode === 'normal') {
      setIsElevating(true);
      toast.info('Requesting elevated privileges', {
        description: 'Please provide administrator credentials'
      });

      // Simulate privilege elevation
      setTimeout(() => {
        setSettings(prev => ({ ...prev, mode: 'root' }));
        setIsElevating(false);
        setHasChanges(true);
        toast.success('Root mode activated', {
          description: 'Advanced security features are now available'
        });
      }, 2000);
    } else {
      setSettings(prev => ({ ...prev, mode: 'normal' }));
      setHasChanges(true);
      toast.info('Normal mode activated', {
        description: 'Standard security features are active'
      });
    }
  };

  const accentColors = [
    { name: 'Cyan', value: 'cyan', color: '#06b6d4' },
    { name: 'Green', value: 'green', color: '#10b981' },
    { name: 'Purple', value: 'purple', color: '#8b5cf6' },
    { name: 'Orange', value: 'orange', color: '#f59e0b' },
    { name: 'Pink', value: 'pink', color: '#ec4899' },
    { name: 'Red', value: 'red', color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-primary">Settings</h1>
          <p className="text-muted-foreground font-code text-sm">Configure CyberX security suite preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Button onClick={handleReset} variant="outline" className="font-code">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            variant="cyber" 
            className="font-code"
          >
            <Save className="h-4 w-4 mr-2" />
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </Button>
        </div>
      </div>

      {/* Mode Settings */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Security Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/30">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-foreground">Current Mode</h3>
                <Badge 
                  variant={settings.mode === 'root' ? 'destructive' : 'secondary'}
                  className="font-code"
                >
                  {settings.mode === 'root' ? 'ROOT MODE' : 'NORMAL MODE'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-code">
                {settings.mode === 'root' 
                  ? 'Full system access with advanced security features enabled'
                  : 'Standard access with basic security monitoring'
                }
              </p>
            </div>
            
            <Button
              onClick={handleModeSwitch}
              disabled={isElevating}
              variant={settings.mode === 'root' ? 'destructive' : 'success'}
              className="font-code"
            >
              {isElevating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Elevating...
                </div>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  {settings.mode === 'root' ? 'Switch to Normal' : 'Switch to Root'}
                </>
              )}
            </Button>
          </div>
          
          {settings.mode === 'root' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-semibold text-destructive">Root Mode Active</span>
              </div>
              <p className="text-sm text-destructive/80 font-code">
                Advanced features enabled: Deep packet inspection, device isolation, automatic threat response
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <User className="h-5 w-5 mr-2" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-code">Username</Label>
              <Input
                id="username"
                value={settings.user.username}
                onChange={(e) => updateSettings('user', 'username', e.target.value)}
                className="bg-input/50 border-border font-code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-code">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.user.email}
                onChange={(e) => updateSettings('user', 'email', e.target.value)}
                className="bg-input/50 border-border font-code"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="networkType" className="font-code">Network Type</Label>
            <Select 
              value={settings.user.networkType} 
              onValueChange={(value) => updateSettings('user', 'networkType', value)}
            >
              <SelectTrigger className="bg-input/50 border-border font-code">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home Network</SelectItem>
                <SelectItem value="company">Company Network</SelectItem>
                <SelectItem value="education">Educational Institution</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-code">Dark Mode</Label>
                <p className="text-sm text-muted-foreground font-code">Enable cyberpunk dark theme</p>
              </div>
              <Switch
                checked={settings.theme.darkMode}
                onCheckedChange={(checked) => updateSettings('theme', 'darkMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-code">Animations</Label>
                <p className="text-sm text-muted-foreground font-code">Enable UI animations and effects</p>
              </div>
              <Switch
                checked={settings.theme.animationsEnabled}
                onCheckedChange={(checked) => updateSettings('theme', 'animationsEnabled', checked)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Label className="font-code">Accent Color</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings('theme', 'accentColor', color.value)}
                  className={`p-3 rounded-lg border transition-all font-code text-sm ${
                    settings.theme.accentColor === color.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full mx-auto mb-2" 
                    style={{ backgroundColor: color.color }}
                  ></div>
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Sound Alerts</Label>
              <p className="text-sm text-muted-foreground font-code">Play sounds for security alerts</p>
            </div>
            <Switch
              checked={settings.notifications.soundEnabled}
              onCheckedChange={(checked) => updateSettings('notifications', 'soundEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Critical Alerts</Label>
              <p className="text-sm text-muted-foreground font-code">Immediate notifications for critical threats</p>
            </div>
            <Switch
              checked={settings.notifications.criticalAlerts}
              onCheckedChange={(checked) => updateSettings('notifications', 'criticalAlerts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground font-code">System tray notifications</p>
            </div>
            <Switch
              checked={settings.notifications.desktopNotifications}
              onCheckedChange={(checked) => updateSettings('notifications', 'desktopNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Email Notifications</Label>
              <p className="text-sm text-muted-foreground font-code">Send security reports via email</p>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scanning Settings */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Scanning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Auto Scan</Label>
              <p className="text-sm text-muted-foreground font-code">Automatically scan network at intervals</p>
            </div>
            <Switch
              checked={settings.scanning.autoScan}
              onCheckedChange={(checked) => updateSettings('scanning', 'autoScan', checked)}
            />
          </div>
          
          {settings.scanning.autoScan && (
            <div className="space-y-2">
              <Label htmlFor="scanInterval" className="font-code">Scan Interval (minutes)</Label>
              <Select
                value={settings.scanning.scanInterval.toString()}
                onValueChange={(value) => updateSettings('scanning', 'scanInterval', parseInt(value))}
              >
                <SelectTrigger className="bg-input/50 border-border font-code">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                  <SelectItem value="360">6 hours</SelectItem>
                  <SelectItem value="720">12 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Auto Fix</Label>
              <p className="text-sm text-muted-foreground font-code">Automatically fix known vulnerabilities</p>
            </div>
            <Switch
              checked={settings.scanning.autoFix}
              onCheckedChange={(checked) => updateSettings('scanning', 'autoFix', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Deep Scan</Label>
              <p className="text-sm text-muted-foreground font-code">Perform comprehensive vulnerability analysis</p>
              {settings.mode === 'normal' && (
                <Badge variant="outline" className="font-code text-xs mt-1">Requires Root Mode</Badge>
              )}
            </div>
            <Switch
              checked={settings.scanning.deepScan}
              disabled={settings.mode === 'normal'}
              onCheckedChange={(checked) => updateSettings('scanning', 'deepScan', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Network Settings */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Network Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interface" className="font-code">Network Interface</Label>
            <Select
              value={settings.network.interface}
              onValueChange={(value) => updateSettings('network', 'interface', value)}
            >
              <SelectTrigger className="bg-input/50 border-border font-code">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eth0">Ethernet (eth0)</SelectItem>
                <SelectItem value="wlan0">Wireless (wlan0)</SelectItem>
                <SelectItem value="auto">Auto Detect</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Traffic Monitoring</Label>
              <p className="text-sm text-muted-foreground font-code">Monitor network traffic for threats</p>
            </div>
            <Switch
              checked={settings.network.monitoringEnabled}
              onCheckedChange={(checked) => updateSettings('network', 'monitoringEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Packet Capture</Label>
              <p className="text-sm text-muted-foreground font-code">Capture packets for deep analysis</p>
              {settings.mode === 'normal' && (
                <Badge variant="outline" className="font-code text-xs mt-1">Requires Root Mode</Badge>
              )}
            </div>
            <Switch
              checked={settings.network.packetCapture}
              disabled={settings.mode === 'normal'}
              onCheckedChange={(checked) => updateSettings('network', 'packetCapture', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Traffic Logging</Label>
              <p className="text-sm text-muted-foreground font-code">Log network traffic to database</p>
            </div>
            <Switch
              checked={settings.network.trafficLogging}
              onCheckedChange={(checked) => updateSettings('network', 'trafficLogging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout" className="font-code">Session Timeout (minutes)</Label>
            <Select
              value={settings.security.sessionTimeout.toString()}
              onValueChange={(value) => updateSettings('security', 'sessionTimeout', parseInt(value))}
            >
              <SelectTrigger className="bg-input/50 border-border font-code">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Require Authentication</Label>
              <p className="text-sm text-muted-foreground font-code">Require login for sensitive operations</p>
            </div>
            <Switch
              checked={settings.security.requireAuth}
              onCheckedChange={(checked) => updateSettings('security', 'requireAuth', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-code">Encrypt Reports</Label>
              <p className="text-sm text-muted-foreground font-code">Encrypt generated security reports</p>
            </div>
            <Switch
              checked={settings.security.encryptReports}
              onCheckedChange={(checked) => updateSettings('security', 'encryptReports', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logLevel" className="font-code">Logging Level</Label>
            <Select
              value={settings.security.logLevel}
              onValueChange={(value) => updateSettings('security', 'logLevel', value)}
            >
              <SelectTrigger className="bg-input/50 border-border font-code">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}