import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Monitor, 
  Router, 
  Activity, 
  Scan,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';

interface SecuritySummaryProps {
  onQuickScan: () => void;
  onViewDetails: (section: string) => void;
}

export function SecuritySummary({ onQuickScan, onViewDetails }: SecuritySummaryProps) {
  // In a real app, this data would come from the backend
  const securityData = {
    totalDevices: 12,
    authorizedDevices: 10,
    unauthorizedDevices: 2,
    vulnerabilities: {
      critical: 2,
      high: 5,
      medium: 8,
      low: 3
    },
    lastScan: '5 minutes ago',
    networkStatus: 'secure', // 'secure' | 'warning' | 'critical'
    routerStatus: 'warning',
    systemStatus: 'secure'
  };

  const totalVulnerabilities = Object.values(securityData.vulnerabilities).reduce((a, b) => a + b, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-primary">Security Overview</h2>
          <p className="text-muted-foreground font-code text-sm">Real-time network security status</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button onClick={onQuickScan} variant="cyber" className="font-code flex-1 sm:flex-none">
            <Scan className="h-4 w-4 mr-2" />
            Quick Scan
          </Button>
          <Button variant="outline" className="font-code flex-1 sm:flex-none">
            <Zap className="h-4 w-4 mr-2" />
            Auto-Fix
          </Button>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Status */}
        <Card 
          className="neon-border bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-cyber transition-all"
          onClick={() => onViewDetails('network')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-code text-muted-foreground">Network Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`text-2xl font-orbitron font-bold ${getStatusColor(securityData.networkStatus)}`}>
                  {securityData.networkStatus.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground font-code">
                  Last check: {securityData.lastScan}
                </div>
              </div>
              {(() => {
                const StatusIcon = getStatusIcon(securityData.networkStatus);
                return <StatusIcon className={`h-8 w-8 ${getStatusColor(securityData.networkStatus)}`} />;
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Device Count */}
        <Card 
          className="neon-border bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-cyber transition-all"
          onClick={() => onViewDetails('devices')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-code text-muted-foreground">Connected Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-orbitron font-bold text-primary">
                  {securityData.totalDevices}
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge variant="secondary" className="text-xs font-code">
                    {securityData.authorizedDevices} Auth
                  </Badge>
                  {securityData.unauthorizedDevices > 0 && (
                    <Badge variant="destructive" className="text-xs font-code">
                      {securityData.unauthorizedDevices} Unauth
                    </Badge>
                  )}
                </div>
              </div>
              <Monitor className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Vulnerabilities */}
        <Card 
          className="neon-border bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-cyber transition-all"
          onClick={() => onViewDetails('vulnerabilities')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-code text-muted-foreground">Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-orbitron font-bold text-primary">
                  {totalVulnerabilities}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  {securityData.vulnerabilities.critical > 0 && (
                    <Badge variant="destructive" className="text-xs font-code">
                      {securityData.vulnerabilities.critical} Critical
                    </Badge>
                  )}
                  {securityData.vulnerabilities.high > 0 && (
                    <Badge className="bg-warning text-warning-foreground text-xs font-code">
                      {securityData.vulnerabilities.high} High
                    </Badge>
                  )}
                </div>
              </div>
              <AlertTriangle className={`h-8 w-8 ${totalVulnerabilities > 0 ? 'text-warning' : 'text-success'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Router Status */}
        <Card 
          className="neon-border bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-cyber transition-all"
          onClick={() => onViewDetails('router')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-code text-muted-foreground">Router Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`text-2xl font-orbitron font-bold ${getStatusColor(securityData.routerStatus)}`}>
                  {securityData.routerStatus.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground font-code">
                  2 issues found
                </div>
              </div>
              <Router className={`h-8 w-8 ${getStatusColor(securityData.routerStatus)}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Vulnerability Breakdown */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary">Vulnerability Breakdown</CardTitle>
          <CardDescription className="font-code">
            Security issues by severity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="text-2xl font-orbitron font-bold text-destructive">
                {securityData.vulnerabilities.critical}
              </div>
              <div className="text-sm font-code text-destructive/80">Critical</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/30">
              <div className="text-2xl font-orbitron font-bold text-warning">
                {securityData.vulnerabilities.high}
              </div>
              <div className="text-sm font-code text-warning/80">High</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="text-2xl font-orbitron font-bold text-primary">
                {securityData.vulnerabilities.medium}
              </div>
              <div className="text-sm font-code text-primary/80">Medium</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/20 border border-muted">
              <div className="text-2xl font-orbitron font-bold text-muted-foreground">
                {securityData.vulnerabilities.low}
              </div>
              <div className="text-sm font-code text-muted-foreground/80">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="font-code text-sm">System scan completed successfully</span>
              </div>
              <span className="text-xs text-muted-foreground font-code">2 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-code text-sm">Weak password detected on router</span>
              </div>
              <span className="text-xs text-muted-foreground font-code">5 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-code text-sm">Unauthorized device detected: 192.168.1.99</span>
              </div>
              <span className="text-xs text-muted-foreground font-code">15 min ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}