// src/pages/ReportsPanel.tsx
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Network,
  Shield,
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  Ban,
  Wifi,
  Server,
  Cpu,
  BarChart3,
  WifiOff,
  Play,
  Square,
  AlertCircle,
  MapPin,
  Download,
  Trash2
} from "lucide-react";

interface MITMThreat {
  type: string;
  message: string;
  ip?: string;
  mac1?: string;
  mac2?: string;
  ssid?: string;
  dns_server?: string;
  dns_servers?: string[];
  source_ip?: string;
  target_ip?: string;
  source_mac?: string;
  gateway_ip?: string;
  gateway_mac?: string;
  domain?: string;
  target_port?: number;
  packet_count?: number;
  timestamp: number;
  severity: "high" | "medium" | "low" | "info";
}

interface MITMStats {
  is_running: boolean;
  threats_detected: number;
  packets_analyzed?: number;
  recent_threats: MITMThreat[];
}

interface NetworkTrafficEvent {
  type: string;
  message: string;
  source_ip?: string;
  target_ip?: string;
  protocol?: string;
  target_port?: number;
  packets_analyzed?: number;
  threats_detected?: number;
  timestamp: number;
  severity: "high" | "medium" | "low" | "info";
}

const ReportsPanel: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mitmStats, setMitmStats] = useState<MITMStats>({
    is_running: false,
    threats_detected: 0,
    recent_threats: []
  });
  const [threats, setThreats] = useState<MITMThreat[]>([]);
  const [traffic, setTraffic] = useState<NetworkTrafficEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Initialize Socket.IO connection
  useEffect(() => {
    console.log("🔌 Attempting to connect to Socket.IO...");
    
    const newSocket = io("http://127.0.0.1:5000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to MITM detection server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from MITM detection server:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.log("❌ Connection error:", error.message);
      setIsConnected(false);
    });

    // MITM Threat Detection Events
    newSocket.on("mitm_threat_detected", (threat: MITMThreat) => {
      console.log("🚨 MITM Threat Detected:", threat);
      setThreats(prev => [threat, ...prev].slice(0, 100));
      setMitmStats(prev => ({
        ...prev,
        threats_detected: prev.threats_detected + 1,
        recent_threats: [threat, ...prev.recent_threats].slice(0, 10)
      }));
    });

    // Live network traffic stream
    newSocket.on("network_traffic", (evt: NetworkTrafficEvent) => {
      setTraffic(prev => [evt, ...prev].slice(0, 300));
      setMitmStats(prev => ({
        ...prev,
        packets_analyzed: evt.packets_analyzed ?? prev.packets_analyzed
      }));
    });

    newSocket.on("mitm_started", (data: any) => {
      console.log("🎯 MITM Detection Started:", data);
      setMitmStats(prev => ({ ...prev, is_running: true }));
    });

    newSocket.on("mitm_stopped", (data: any) => {
      console.log("⏹️ MITM Detection Stopped:", data);
      setMitmStats(prev => ({ ...prev, is_running: false }));
    });

    newSocket.on("mitm_reset", (data: any) => {
      console.log("🧹 MITM Detection Reset:", data);
      setThreats([]);
      setTraffic([]);
      setMitmStats(prev => ({ ...prev, threats_detected: 0, packets_analyzed: 0, recent_threats: [] }));
    });

    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up Socket.IO connection");
      newSocket.close();
    };
  }, []);

  // Fetch initial status
  useEffect(() => {
    fetchMITMStatus();
  }, []);

  const fetchMITMStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/mitm/status");
      
      if (response.ok) {
        const data = await response.json();
        setMitmStats(data.mitm_detection);
        setThreats(data.mitm_detection.recent_threats || []);
        // do not prefill traffic with demo; keep empty until events arrive
      }
    } catch (error) {
      console.error("Failed to fetch MITM status:", error);
    }
  };

  const startMITMDetection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/mitm/start");

      if (response.ok) {
        console.log("MITM detection started");
        setTimeout(fetchMITMStatus, 1000);
      } else {
        console.error("Failed to start MITM detection, status:", response.status);
      }
    } catch (error) {
      console.error("Error starting MITM detection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFReport = async () => {
    try {
      const resp = await fetch("http://127.0.0.1:5000/api/mitm/report", {
        method: "GET",
      });
      if (!resp.ok) {
        console.error("Failed to generate report");
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mitm-threats-${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error generating report:", e);
    }
  };

  const stopMITMDetection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/mitm/stop");

      if (response.ok) {
        console.log("MITM detection stopped");
        setTimeout(fetchMITMStatus, 1000);
      } else {
        console.error("Failed to stop MITM detection");
      }
    } catch (error) {
      console.error("Error stopping MITM detection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = async () => {
    try {
      await fetch("http://127.0.0.1:5000/api/mitm/reset");
    } catch (e) {
      console.error("Failed to reset backend state, clearing UI only:", e);
    } finally {
      setThreats([]);
      setTraffic([]);
      setMitmStats(prev => ({ ...prev, threats_detected: 0, packets_analyzed: 0, recent_threats: [] }));
    }
  };

  const exportThreats = () => {
    const dataStr = JSON.stringify(threats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mitm-threats-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <ShieldAlert className="h-4 w-4 text-orange-500" />;
      case "low":
        return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case "ARP Spoofing":
      case "ARP Probe":
      case "ARP Conflict":
        return <Network className="h-4 w-4" />;
      case "Rogue AP":
        return <Wifi className="h-4 w-4" />;
      case "DNS Monitoring":
      case "DNS Spoofing Check":
      case "Suspicious DNS Query":
        return <Server className="h-4 w-4" />;
      case "Port Probe":
        return <Cpu className="h-4 w-4" />;
      case "Network Traffic":
      case "High Traffic":
        return <Activity className="h-4 w-4" />;
      case "Gateway Monitoring":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const getThreatDetails = (threat: MITMThreat) => {
    const details = [];
    
    if (threat.ip) details.push(`IP: ${threat.ip}`);
    if (threat.mac1) details.push(`MAC1: ${threat.mac1}`);
    if (threat.mac2) details.push(`MAC2: ${threat.mac2}`);
    if (threat.source_ip) details.push(`Source: ${threat.source_ip}`);
    if (threat.target_ip) details.push(`Target: ${threat.target_ip}`);
    if (threat.source_mac) details.push(`Source MAC: ${threat.source_mac}`);
    if (threat.gateway_ip) details.push(`Gateway: ${threat.gateway_ip}`);
    if (threat.gateway_mac) details.push(`Gateway MAC: ${threat.gateway_mac}`);
    if (threat.domain) details.push(`Domain: ${threat.domain}`);
    if (threat.target_port) details.push(`Port: ${threat.target_port}`);
    if (threat.dns_server) details.push(`DNS: ${threat.dns_server}`);
    if (threat.dns_servers) details.push(`DNS Servers: ${threat.dns_servers.join(', ')}`);
    if (threat.packet_count) details.push(`Packets: ${threat.packet_count}`);
    if (threat.ssid) details.push(`SSID: ${threat.ssid}`);
    
    return details.join(' | ');
  };

  const formatTrafficLine = (evt: NetworkTrafficEvent) => {
    const t = new Date((evt.timestamp || 0) * 1000).toLocaleTimeString();
    const src = evt.source_ip || "-";
    const dst = evt.target_ip || "-";
    const proto = evt.protocol || "?";
    const port = evt.target_port != null ? `:${evt.target_port}` : "";
    const msg = evt.message || "packet";
    return `${t} ${src} -> ${dst} ${proto}${port} ${msg}`;
  };

  const highPriorityThreats = threats.filter(t => t.severity === 'high' || t.severity === 'medium');
  const recentThreats = threats.slice(0, 20);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-orange-500" />
            MITM Attack Detection
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time detection of Man-in-the-Middle attacks on your network
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          
          <Button
            onClick={mitmStats.is_running ? stopMITMDetection : startMITMDetection}
            disabled={isLoading}
            variant={mitmStats.is_running ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : mitmStats.is_running ? (
              <Square className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {mitmStats.is_running ? "Stop Detection" : "Start Detection"}
          </Button>
          
          <Button
            onClick={fetchMITMStatus}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Detection Status</p>
                <p className={`text-2xl font-bold ${mitmStats.is_running ? "text-green-600" : "text-red-600"}`}>
                  {mitmStats.is_running ? "ACTIVE" : "INACTIVE"}
                </p>
              </div>
              <div className={`p-3 rounded-full ${mitmStats.is_running ? "bg-green-100" : "bg-red-100"}`}>
                {mitmStats.is_running ? (
                  <Eye className="h-6 w-6 text-green-600" />
                ) : (
                  <EyeOff className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threats Detected</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mitmStats.threats_detected}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <ShieldAlert className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-red-600">
                  {highPriorityThreats.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Packets Analyzed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mitmStats.packets_analyzed || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Live Threats ({threats.length})
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Network Analysis
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Threat Overview
                </CardTitle>
                <CardDescription>
                  Real-time MITM attack detection summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Detection Engine</span>
                  <Badge variant="outline" className={mitmStats.is_running ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                    {mitmStats.is_running ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Threats Detected</span>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    {mitmStats.threats_detected}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Packets Analyzed</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {mitmStats.packets_analyzed || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent High Priority Threats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Critical Threats
                </CardTitle>
                <CardDescription>
                  Recent high and medium severity threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {highPriorityThreats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No critical threats detected</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {highPriorityThreats.slice(0, 5).map((threat, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityIcon(threat.severity)}
                            <span className="font-medium text-sm">{threat.type}</span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{threat.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(threat.timestamp)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Threats Tab */}
        <TabsContent value="threats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Live Threat Detection
                </CardTitle>
                <CardDescription>
                  Real-time MITM attack alerts and suspicious activities
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportThreats}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={threats.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  onClick={generatePDFReport}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF Report
                </Button>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={threats.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {recentThreats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No threats detected. Monitoring is active.</p>
                    <p className="text-sm mt-2">Run network commands to test detection</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentThreats.map((threat, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getThreatTypeIcon(threat.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{threat.type}</span>
                                <Badge className={getSeverityColor(threat.severity)}>
                                  {threat.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{threat.message}</p>
                              {getThreatDetails(threat) && (
                                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  {getThreatDetails(threat)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {formatTimestamp(threat.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Analysis Tab */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Security
                </CardTitle>
                <CardDescription>
                  Current network security posture and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Live Traffic</span>
                    <Badge className="bg-blue-50 text-blue-700">{traffic.length} events</Badge>
                  </div>
                  <div className="h-64 overflow-y-auto text-xs bg-black rounded-md p-2">
                    {traffic.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">No traffic yet. Start detection to stream packets.</div>
                    ) : (
                      <pre className="font-mono text-green-400 whitespace-pre-wrap leading-5">
                        {traffic.slice(0, 300).map((evt, idx) => (
                          <div key={idx} className="py-0.5">{formatTrafficLine(evt)}</div>
                        ))}
                      </pre>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Detection Metrics
                </CardTitle>
                <CardDescription>
                  MITM detection performance and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 border-b">
                    <span>Detection Accuracy:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      High
                    </Badge>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span>Response Time:</span>
                    <span className="font-medium">&lt; 3 seconds</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span>Monitoring Coverage:</span>
                    <span className="font-medium">Network Layer</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span>Threat Types Detected:</span>
                    <span className="font-medium">8+</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span>Last System Check:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPanel;












// // src/pages/ReportsPanel.tsx
// import React, { useEffect, useState, useRef } from "react";
// import { io, Socket } from "socket.io-client";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   AlertTriangle,
//   ShieldAlert,
//   ShieldCheck,
//   Network,
//   Shield,
//   Activity,
//   Eye,
//   EyeOff,
//   RefreshCw,
//   Ban,
//   Wifi,
//   Server,
//   Cpu,
//   BarChart3,
//   WifiOff,
//   Play,
//   Square,
//   AlertCircle,
//   MapPin,
//   Download,
//   Trash2,
//   Radio,
//   Globe,
//   Scan
// } from "lucide-react";

// interface MITMThreat {
//   type: string;
//   message: string;
//   ip?: string;
//   mac1?: string;
//   mac2?: string;
//   ssid?: string;
//   dns_server?: string;
//   dns_servers?: string[];
//   source_ip?: string;
//   target_ip?: string;
//   source_mac?: string;
//   gateway_ip?: string;
//   gateway_mac?: string;
//   domain?: string;
//   target_port?: number;
//   packet_count?: number;
//   attacker_ip?: string;
//   attacker_mac?: string;
//   victim_ip?: string;
//   original_mac?: string;
//   spoofed_mac?: string;
//   ports_targeted?: number[];
//   scan_count?: number;
//   request_count?: number;
//   evidence?: string;
//   timestamp: number;
//   threat_level: "HIGH" | "MEDIUM" | "LOW" | "INFO";
//   severity?: "high" | "medium" | "low" | "info";
// }

// interface NetworkTraffic {
//   type: string;
//   message: string;
//   total_packets?: number;
//   packets_per_second?: number;
//   arp_packets?: number;
//   tcp_packets?: number;
//   udp_packets?: number;
//   dns_packets?: number;
//   threats_detected?: number;
//   uptime_seconds?: number;
//   threat_level: "HIGH" | "MEDIUM" | "LOW" | "INFO";
//   timestamp: number;
//   [key: string]: any;
// }

// interface MITMStats {
//   is_running: boolean;
//   threats_detected: number;
//   total_packets?: number;
//   packets_analyzed?: number;
//   uptime_seconds?: number;
//   recent_threats: MITMThreat[];
//   traffic_breakdown?: {
//     arp: number;
//     tcp: number;
//     udp: number;
//     dns: number;
//   };
// }

// const ReportsPanel: React.FC = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [mitmStats, setMitmStats] = useState<MITMStats>({
//     is_running: false,
//     threats_detected: 0,
//     recent_threats: []
//   });
//   const [threats, setThreats] = useState<MITMThreat[]>([]);
//   const [networkTraffic, setNetworkTraffic] = useState<NetworkTraffic[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("dashboard");

//   // Initialize Socket.IO connection
//   useEffect(() => {
//     console.log("🔌 Initializing Socket.IO connection...");
    
//     const newSocket = io("http://localhost:5000", {
//       transports: ["websocket", "polling"],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       timeout: 20000
//     });

//     newSocket.on("connect", () => {
//       console.log("✅ Connected to MITM detection server");
//       setIsConnected(true);
//     });

//     newSocket.on("disconnect", (reason) => {
//       console.log("❌ Disconnected from MITM detection server:", reason);
//       setIsConnected(false);
//     });

//     newSocket.on("connect_error", (error) => {
//       console.log("❌ Connection error:", error.message);
//       setIsConnected(false);
//     });

//     // MITM Threat Detection Events
//     newSocket.on("mitm_threat_detected", (threat: MITMThreat) => {
//       console.log("🚨 MITM Threat Detected:", threat);
//       setThreats(prev => [threat, ...prev].slice(0, 100));
//       setMitmStats(prev => ({
//         ...prev,
//         threats_detected: prev.threats_detected + 1,
//         recent_threats: [threat, ...prev.recent_threats].slice(0, 10)
//       }));
//     });

//     // Network Traffic Events
//     newSocket.on("network_traffic", (traffic: NetworkTraffic) => {
//       console.log("📊 Network Traffic:", traffic);
//       setNetworkTraffic(prev => [traffic, ...prev].slice(0, 50));
//     });

//     newSocket.on("mitm_started", (data: any) => {
//       console.log("🎯 MITM Detection Started:", data);
//       setMitmStats(prev => ({ ...prev, is_running: true }));
//     });

//     newSocket.on("mitm_stopped", (data: any) => {
//       console.log("⏹️ MITM Detection Stopped:", data);
//       setMitmStats(prev => ({ ...prev, is_running: false }));
//     });

//     setSocket(newSocket);

//     return () => {
//       console.log("🧹 Cleaning up Socket.IO connection");
//       newSocket.close();
//     };
//   }, []);

//   // Fetch initial status
//   useEffect(() => {
//     fetchMITMStatus();
//   }, []);

//   const fetchMITMStatus = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/api/mitm/status", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         credentials: 'include'
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setMitmStats(data.mitm_detection);
//         setThreats(data.mitm_detection.recent_threats || []);
//       }
//     } catch (error) {
//       console.error("Failed to fetch MITM status:", error);
//     }
//   };

//   const startMITMDetection = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch("http://localhost:5000/api/mitm/start", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         credentials: 'include'
//       });

//       if (response.ok) {
//         console.log("MITM detection started");
//         setTimeout(fetchMITMStatus, 1000);
//       } else {
//         console.error("Failed to start MITM detection, status:", response.status);
//       }
//     } catch (error) {
//       console.error("Error starting MITM detection:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const stopMITMDetection = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch("http://localhost:5000/api/mitm/stop", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         credentials: 'include'
//       });

//       if (response.ok) {
//         console.log("MITM detection stopped");
//         setTimeout(fetchMITMStatus, 1000);
//       } else {
//         console.error("Failed to stop MITM detection");
//       }
//     } catch (error) {
//       console.error("Error stopping MITM detection:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearThreats = () => {
//     setThreats([]);
//     setNetworkTraffic([]);
//     setMitmStats(prev => ({
//       ...prev,
//       threats_detected: 0,
//       recent_threats: []
//     }));
//   };

//   const exportThreats = () => {
//     const data = {
//       threats: threats,
//       stats: mitmStats,
//       export_time: new Date().toISOString()
//     };
//     const dataStr = JSON.stringify(data, null, 2);
//     const dataBlob = new Blob([dataStr], { type: 'application/json' });
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `mitm-threats-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const getThreatLevelIcon = (threatLevel: string) => {
//     switch (threatLevel) {
//       case "HIGH":
//         return <AlertTriangle className="h-4 w-4 text-red-500" />;
//       case "MEDIUM":
//         return <ShieldAlert className="h-4 w-4 text-orange-500" />;
//       case "LOW":
//         return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
//       default:
//         return <Activity className="h-4 w-4 text-blue-500" />;
//     }
//   };

//   const getThreatLevelColor = (threatLevel: string) => {
//     switch (threatLevel) {
//       case "HIGH":
//         return "bg-red-100 text-red-800 border-red-200";
//       case "MEDIUM":
//         return "bg-orange-100 text-orange-800 border-orange-200";
//       case "LOW":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       default:
//         return "bg-blue-100 text-blue-800 border-blue-200";
//     }
//   };

//   const getThreatTypeIcon = (type: string) => {
//     if (type.includes("ARP_SPOOFING")) return <Network className="h-4 w-4 text-red-500" />;
//     if (type.includes("PORT_SCAN")) return <Scan className="h-4 w-4 text-orange-500" />;
//     if (type.includes("ARP_FLOOD")) return <Radio className="h-4 w-4 text-yellow-500" />;
//     if (type.includes("DNS")) return <Globe className="h-4 w-4 text-blue-500" />;
//     if (type.includes("SYSTEM")) return <Shield className="h-4 w-4 text-green-500" />;
//     return <Activity className="h-4 w-4" />;
//   };

//   const formatTimestamp = (timestamp: number) => {
//     return new Date(timestamp * 1000).toLocaleTimeString();
//   };

//   const getThreatDetails = (threat: MITMThreat) => {
//     const details = [];
    
//     if (threat.attacker_ip) details.push(`Attacker: ${threat.attacker_ip}`);
//     if (threat.attacker_mac) details.push(`Attacker MAC: ${threat.attacker_mac}`);
//     if (threat.victim_ip) details.push(`Victim: ${threat.victim_ip}`);
//     if (threat.original_mac) details.push(`Original MAC: ${threat.original_mac}`);
//     if (threat.spoofed_mac) details.push(`Spoofed MAC: ${threat.spoofed_mac}`);
//     if (threat.ports_targeted) details.push(`Ports: ${threat.ports_targeted.join(', ')}`);
//     if (threat.scan_count) details.push(`Scan Count: ${threat.scan_count}`);
//     if (threat.request_count) details.push(`Requests: ${threat.request_count}`);
//     if (threat.evidence) details.push(`Evidence: ${threat.evidence}`);
    
//     return details.join(' | ');
//   };

//   const highPriorityThreats = threats.filter(t => t.threat_level === "HIGH" || t.threat_level === "MEDIUM");
//   const recentThreats = threats.slice(0, 20);
//   const recentTraffic = networkTraffic.slice(0, 30);

//   const trafficStats = networkTraffic.find(t => t.type === "TRAFFIC_STATS");

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold flex items-center gap-2">
//             <ShieldAlert className="h-8 w-8 text-orange-500" />
//             Enterprise MITM Detection
//           </h1>
//           <p className="text-gray-600 mt-2">
//             Real-time network traffic monitoring and threat detection
//           </p>
//         </div>
        
//         <div className="flex items-center gap-4">
//           <Badge 
//             variant={isConnected ? "default" : "secondary"}
//             className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
//           >
//             {isConnected ? "Connected" : "Disconnected"}
//           </Badge>
          
//           <Button
//             onClick={mitmStats.is_running ? stopMITMDetection : startMITMDetection}
//             disabled={isLoading}
//             variant={mitmStats.is_running ? "destructive" : "default"}
//             className="flex items-center gap-2"
//           >
//             {isLoading ? (
//               <RefreshCw className="h-4 w-4 animate-spin" />
//             ) : mitmStats.is_running ? (
//               <Square className="h-4 w-4" />
//             ) : (
//               <Play className="h-4 w-4" />
//             )}
//             {mitmStats.is_running ? "Stop Detection" : "Start Detection"}
//           </Button>
          
//           <Button
//             onClick={fetchMITMStatus}
//             variant="outline"
//             size="sm"
//             className="flex items-center gap-2"
//           >
//             <RefreshCw className="h-4 w-4" />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Detection Status</p>
//                 <p className={`text-2xl font-bold ${mitmStats.is_running ? "text-green-600" : "text-red-600"}`}>
//                   {mitmStats.is_running ? "ACTIVE" : "INACTIVE"}
//                 </p>
//               </div>
//               <div className={`p-3 rounded-full ${mitmStats.is_running ? "bg-green-100" : "bg-red-100"}`}>
//                 {mitmStats.is_running ? (
//                   <Eye className="h-6 w-6 text-green-600" />
//                 ) : (
//                   <EyeOff className="h-6 w-6 text-red-600" />
//                 )}
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Threats Detected</p>
//                 <p className="text-2xl font-bold text-orange-600">
//                   {mitmStats.threats_detected}
//                 </p>
//               </div>
//               <div className="p-3 rounded-full bg-orange-100">
//                 <ShieldAlert className="h-6 w-6 text-orange-600" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Packets Analyzed</p>
//                 <p className="text-2xl font-bold text-blue-600">
//                   {mitmStats.total_packets || mitmStats.packets_analyzed || 0}
//                 </p>
//               </div>
//               <div className="p-3 rounded-full bg-blue-100">
//                 <Activity className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Active Threats</p>
//                 <p className="text-2xl font-bold text-red-600">
//                   {highPriorityThreats.length}
//                 </p>
//               </div>
//               <div className="p-3 rounded-full bg-red-100">
//                 <AlertCircle className="h-6 w-6 text-red-600" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="dashboard" className="flex items-center gap-2">
//             <BarChart3 className="h-4 w-4" />
//             Dashboard
//           </TabsTrigger>
//           <TabsTrigger value="threats" className="flex items-center gap-2">
//             <AlertTriangle className="h-4 w-4" />
//             Live Threats ({threats.length})
//           </TabsTrigger>
//           <TabsTrigger value="traffic" className="flex items-center gap-2">
//             <Activity className="h-4 w-4" />
//             Network Traffic ({recentTraffic.length})
//           </TabsTrigger>
//           <TabsTrigger value="analysis" className="flex items-center gap-2">
//             <Cpu className="h-4 w-4" />
//             Analysis
//           </TabsTrigger>
//         </TabsList>

//         {/* Dashboard Tab */}
//         <TabsContent value="dashboard" className="space-y-4">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Threat Overview */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Shield className="h-5 w-5" />
//                   Threat Overview
//                 </CardTitle>
//                 <CardDescription>
//                   Real-time MITM attack detection summary
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="font-medium">ARP Spoofing Detection</span>
//                   <Badge variant="outline" className="bg-green-50 text-green-700">
//                     Active
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="font-medium">Port Scanning Detection</span>
//                   <Badge variant="outline" className="bg-green-50 text-green-700">
//                     Active
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="font-medium">Network Traffic Analysis</span>
//                   <Badge variant="outline" className="bg-green-50 text-green-700">
//                     Active
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <span className="font-medium">DNS Monitoring</span>
//                   <Badge variant="outline" className="bg-green-50 text-green-700">
//                     Active
//                   </Badge>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Recent High Priority Threats */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <AlertCircle className="h-5 w-5 text-red-500" />
//                   Critical Threats
//                 </CardTitle>
//                 <CardDescription>
//                   Recent high and medium severity threats
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ScrollArea className="h-64">
//                   {highPriorityThreats.length === 0 ? (
//                     <div className="text-center py-8 text-gray-500">
//                       <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
//                       <p>No critical threats detected</p>
//                     </div>
//                   ) : (
//                     <div className="space-y-3">
//                       {highPriorityThreats.slice(0, 5).map((threat, index) => (
//                         <div key={index} className="p-3 border rounded-lg">
//                           <div className="flex items-center gap-2 mb-1">
//                             {getThreatLevelIcon(threat.threat_level)}
//                             <span className="font-medium text-sm">{threat.type}</span>
//                           </div>
//                           <p className="text-xs text-gray-600 truncate">{threat.message}</p>
//                           <p className="text-xs text-gray-400 mt-1">
//                             {formatTimestamp(threat.timestamp)}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </ScrollArea>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Traffic Statistics */}
//           {trafficStats && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Activity className="h-5 w-5" />
//                   Live Traffic Statistics
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center p-4 bg-blue-50 rounded-lg">
//                     <p className="text-2xl font-bold text-blue-600">{trafficStats.total_packets || 0}</p>
//                     <p className="text-sm text-blue-700">Total Packets</p>
//                   </div>
//                   <div className="text-center p-4 bg-green-50 rounded-lg">
//                     <p className="text-2xl font-bold text-green-600">{trafficStats.packets_per_second || 0}</p>
//                     <p className="text-sm text-green-700">Packets/Sec</p>
//                   </div>
//                   <div className="text-center p-4 bg-orange-50 rounded-lg">
//                     <p className="text-2xl font-bold text-orange-600">{trafficStats.threats_detected || 0}</p>
//                     <p className="text-sm text-orange-700">Threats Found</p>
//                   </div>
//                   <div className="text-center p-4 bg-purple-50 rounded-lg">
//                     <p className="text-2xl font-bold text-purple-600">{Math.round(trafficStats.uptime_seconds || 0)}s</p>
//                     <p className="text-sm text-purple-700">Uptime</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </TabsContent>

//         {/* Live Threats Tab */}
//         <TabsContent value="threats">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="flex items-center gap-2">
//                   <AlertTriangle className="h-5 w-5 text-orange-500" />
//                   Live Threat Detection
//                 </CardTitle>
//                 <CardDescription>
//                   Real-time MITM attack alerts and security events
//                 </CardDescription>
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   onClick={exportThreats}
//                   variant="outline"
//                   size="sm"
//                   className="flex items-center gap-2"
//                   disabled={threats.length === 0}
//                 >
//                   <Download className="h-4 w-4" />
//                   Export
//                 </Button>
//                 <Button
//                   onClick={clearThreats}
//                   variant="outline"
//                   size="sm"
//                   className="flex items-center gap-2"
//                   disabled={threats.length === 0}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                   Clear
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ScrollArea className="h-[500px]">
//                 {recentThreats.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
//                     <p>No threats detected. Monitoring is active.</p>
//                     <p className="text-sm mt-2">Run network commands to test detection</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {recentThreats.map((threat, index) => (
//                       <div
//                         key={index}
//                         className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex items-start gap-3 flex-1">
//                             {getThreatTypeIcon(threat.type)}
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2 mb-1">
//                                 <span className="font-semibold">{threat.type}</span>
//                                 <Badge className={getThreatLevelColor(threat.threat_level)}>
//                                   {threat.threat_level}
//                                 </Badge>
//                               </div>
//                               <p className="text-sm text-gray-700 mb-2">{threat.message}</p>
//                               {getThreatDetails(threat) && (
//                                 <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
//                                   {getThreatDetails(threat)}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                           <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
//                             {formatTimestamp(threat.timestamp)}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </ScrollArea>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Network Traffic Tab */}
//         <TabsContent value="traffic">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Activity className="h-5 w-5 text-blue-500" />
//                 Real-Time Network Traffic
//               </CardTitle>
//               <CardDescription>
//                 Live packet analysis and network traffic monitoring
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ScrollArea className="h-[500px]">
//                 {recentTraffic.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                     <p>No traffic data yet. Monitoring network...</p>
//                     <p className="text-sm mt-2">Start detection to begin monitoring</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {recentTraffic.map((traffic, index) => (
//                       <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="font-medium">{traffic.type}</span>
//                               <Badge variant={
//                                 traffic.threat_level === "HIGH" ? "destructive" :
//                                 traffic.threat_level === "MEDIUM" ? "default" :
//                                 traffic.threat_level === "LOW" ? "secondary" : "outline"
//                               }>
//                                 {traffic.threat_level}
//                               </Badge>
//                             </div>
//                             <p className="text-sm text-gray-700">{traffic.message}</p>
//                             {traffic.total_packets && (
//                               <p className="text-xs text-gray-500 mt-1">
//                                 Packets: {traffic.total_packets} | {traffic.packets_per_second} p/s
//                               </p>
//                             )}
//                           </div>
//                           <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
//                             {formatTimestamp(traffic.timestamp)}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </ScrollArea>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Network Analysis Tab */}
//         <TabsContent value="analysis">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Network className="h-5 w-5" />
//                   Network Security
//                 </CardTitle>
//                 <CardDescription>
//                   Current network security posture and monitoring
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Radio className="h-4 w-4 text-blue-600" />
//                     <span className="font-medium">ARP Spoofing Protection</span>
//                   </div>
//                   <p className="text-sm text-blue-700">
//                     Monitoring ARP tables for MAC address conflicts and spoofing attempts
//                   </p>
//                 </div>
                
//                 <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Scan className="h-4 w-4 text-green-600" />
//                     <span className="font-medium">Port Scan Detection</span>
//                   </div>
//                   <p className="text-sm text-green-700">
//                     Detecting network scanning and port enumeration attempts
//                   </p>
//                 </div>
                
//                 <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Globe className="h-4 w-4 text-orange-600" />
//                     <span className="font-medium">DNS Monitoring</span>
//                   </div>
//                   <p className="text-sm text-orange-700">
//                     Analyzing DNS queries for suspicious patterns and hijacking attempts
//                   </p>
//                 </div>

//                 <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
//                   <div className="flex items-center gap-2 mb-1">
//                     <Activity className="h-4 w-4 text-purple-600" />
//                     <span className="font-medium">Traffic Analysis</span>
//                   </div>
//                   <p className="text-sm text-purple-700">
//                     Real-time network traffic analysis and protocol monitoring
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Cpu className="h-5 w-5" />
//                   Detection Metrics
//                 </CardTitle>
//                 <CardDescription>
//                   MITM detection performance and statistics
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div className="flex justify-between p-2 border-b">
//                     <span>Detection Accuracy:</span>
//                     <Badge variant="outline" className="bg-green-50 text-green-700">
//                       Enterprise
//                     </Badge>
//                   </div>
//                   <div className="flex justify-between p-2 border-b">
//                     <span>Response Time:</span>
//                     <span className="font-medium">Real-time</span>
//                   </div>
//                   <div className="flex justify-between p-2 border-b">
//                     <span>Monitoring Coverage:</span>
//                     <span className="font-medium">Network Layer</span>
//                   </div>
//                   <div className="flex justify-between p-2 border-b">
//                     <span>Threat Types Detected:</span>
//                     <span className="font-medium">10+</span>
//                   </div>
//                   <div className="flex justify-between p-2">
//                     <span>Last System Check:</span>
//                     <span className="font-medium">{new Date().toLocaleTimeString()}</span>
//                   </div>
//                 </div>

//                 {/* Test Commands */}
//                 <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//                   <h4 className="font-medium mb-2">Test Real Attacks:</h4>
//                   <div className="space-y-2 text-sm">
//                     <div>
//                       <code className="bg-black text-white px-2 py-1 rounded text-xs">arpspoof -i eth0 192.168.1.1</code>
//                       <p className="text-gray-600 text-xs mt-1">Triggers ARP spoofing detection</p>
//                     </div>
                    
//                     <div>
//                       <code className="bg-black text-white px-2 py-1 rounded text-xs">nmap -sS 192.168.1.0/24</code>
//                       <p className="text-gray-600 text-xs mt-1">Triggers port scan detection</p>
//                     </div>
                    
//                     <div>
//                       <code className="bg-black text-white px-2 py-1 rounded text-xs">arp -d *</code>
//                       <p className="text-gray-600 text-xs mt-1">Triggers ARP monitoring</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ReportsPanel;