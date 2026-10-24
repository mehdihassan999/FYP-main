


import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Cpu, Shield, AlertTriangle, Monitor, Network,
  Scan, Download, RefreshCw, Zap, Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemInfo {
  os: string;
  version: string;
  hostname: string;
  uptime: string;
  cpu: { model: string; cores: number; usage: number };
  memory: { total: string; used: string; usage: number };
  disks: { mountpoint: string; fstype: string; total: string; used: string; usage: number }[];
  network: { interfaces: NetworkInterface[]; activeConnections: number };
}

interface NetworkInterface {
  name: string;
  type: 'ethernet' | 'wireless' | 'loopback';
  status: 'up' | 'down';
  ip: string;
  mac: string;
}

interface SecurityIssue {
  id: string;
  title: string;
  category: 'os' | 'firewall' | 'network' | 'software' | 'hardware';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fixable: boolean;
  status: 'open' | 'fixed' | 'fixing';
  port?: number;
  message?: string; // new: backend message
}

export default function MyDevicePanel() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState<string | null>(null);

  // -------------------- Fetch Full Scan --------------------
  const handleScan = async () => {
    setIsScanning(true);
    toast.info('System scan started', { description: 'Analyzing your device...' });

    try {
      const res = await axios.get('http://127.0.0.1:5000/api/full_scan');
      setSystemInfo(res.data.system_info);
      setSecurityIssues(res.data.vulnerabilities.map((v: any) => ({ ...v, status: 'open' })));
      toast.success('System scan completed', { description: `${res.data.vulnerabilities.length} issues found.` });
    } catch (err) {
      console.error(err);
      toast.error('Failed to perform full scan.');
    } finally {
      setIsScanning(false);
    }
  };

  // -------------------- Fix Single Issue --------------------
  const handleFix = async (id: string) => {
    setIsFixing(id);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/fix', { id });
      const { status, message } = res.data;

      setSecurityIssues(prev =>
        prev.map(issue =>
          issue.id === id
            ? { ...issue, status: status ? 'fixed' : 'open', message }
            : issue
        )
      );

      if (status) {
        toast.success(message || 'Vulnerability fixed!');
      } else {
        toast.warning('Manual Action Required', { description: message });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fix vulnerability.');
    } finally {
      setIsFixing(null);
    }
  };

  // -------------------- Fix All --------------------
  const handleFixAll = async () => {
    const openIssues = securityIssues.filter(i => i.fixable && i.status === 'open');
    if (!openIssues.length) return;

    for (let issue of openIssues) {
      await handleFix(issue.id);
    }
    toast.success('All attempted fixes completed!');
  };

  // -------------------- Generate Report --------------------
  const generateReport = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'CyberX_Device_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report generated! Download should start shortly.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report.');
    }
  };

  // -------------------- Helpers --------------------
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'os': return Monitor;
      case 'firewall': return Shield;
      case 'network': return Network;
      case 'software': return Settings;
      case 'hardware': return Cpu;
      default: return AlertTriangle;
    }
  };

  const openIssues = securityIssues.filter(i => i.status === 'open').length;
  const fixedIssues = securityIssues.filter(i => i.status === 'fixed').length;
  const securityScore = securityIssues.length ? Math.round((fixedIssues / securityIssues.length) * 100) : 0;

  const chartData = systemInfo
    ? [
        { name: 'CPU', usage: systemInfo.cpu.usage },
        { name: 'Memory', usage: systemInfo.memory.usage },
        ...systemInfo.disks.map(d => ({ name: `Disk (${d.mountpoint})`, usage: d.usage })),
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Device Security</h1>
          <p className="text-muted-foreground text-sm">Local system analysis and vulnerability management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? <RefreshCw className="animate-spin mr-2" /> : <Scan className="mr-2" />}
            {isScanning ? 'Scanning...' : 'Full Scan'}
          </Button>
          <Button onClick={handleFixAll} disabled={!openIssues}>
            <Zap className="mr-2" /> Fix All
          </Button>
          <Button onClick={generateReport}>
            <Download className="mr-2" /> Report
          </Button>
        </div>
      </div>

      {/* System Info & Chart Grid */}
      {systemInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Monitor className="mr-2" />System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>OS:</strong> {systemInfo.os} ({systemInfo.version})</p>
              <p><strong>Hostname:</strong> {systemInfo.hostname}</p>
              <p><strong>Uptime:</strong> {systemInfo.uptime}</p>
              <p>CPU Usage: {systemInfo.cpu.usage}% ({systemInfo.cpu.model})</p>
              <Progress value={systemInfo.cpu.usage} />
              <p>Memory Usage: {systemInfo.memory.usage}% ({systemInfo.memory.used} / {systemInfo.memory.total})</p>
              <Progress value={systemInfo.memory.usage} />
              {systemInfo.disks.map(disk => (
                <div key={disk.mountpoint}>
                  <p>Disk ({disk.mountpoint}) Usage: {disk.usage}% ({disk.used} / {disk.total})</p>
                  <Progress value={disk.usage} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right: System Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Cpu className="mr-2" />System Usage Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Shield className="mr-2" />Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Security Score: {securityScore}%</p>
          <Progress value={securityScore} />
          <div className="flex justify-between mt-2">
            <p>Open Issues: {openIssues}</p>
            <p>Fixed Issues: {fixedIssues}</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2" />Security Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {securityIssues.map(issue => {
            const CategoryIcon = getCategoryIcon(issue.category);
            return (
              <Card key={issue.id} className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-3">
                <div className="flex items-start md:items-center space-x-2 w-full">
                  <CategoryIcon className="mr-2 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold">{issue.title}</p>
                    <p className="text-sm">{issue.description}</p>
                    <Badge variant={getSeverityBadge(issue.severity)}>{issue.severity.toUpperCase()}</Badge>
                    {issue.status === 'fixed' && <Badge variant="success" className="ml-2">FIXED</Badge>}

                    {/* Show backend message (manual fix hints or success logs) */}
                    {issue.message && (
                      <pre className="mt-2 p-2 text-xs bg-gray-100 rounded whitespace-pre-wrap">
                        {issue.message}
                      </pre>
                    )}
                  </div>
                </div>
                {issue.fixable && issue.status === 'open' ? (
                  <Button onClick={() => handleFix(issue.id)} disabled={isFixing === issue.id}>
                    {isFixing === issue.id ? <RefreshCw className="animate-spin mr-1" /> : <Zap className="mr-1" />}
                    Fix
                  </Button>
                ) : (
                  !issue.fixable && <Button variant="outline" disabled><Settings className="mr-1" />Manual</Button>
                )}
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
