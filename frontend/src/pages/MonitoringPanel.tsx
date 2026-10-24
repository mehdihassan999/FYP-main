import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Ban,
  Download,
  Play,
  Square,
  FileText,
  Cpu,
  Server,
  Wifi,
  Unlock,
  Globe,
  Shield,
  Network,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import io from "socket.io-client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_BASE = "http://127.0.0.1:5000";
const socket = io(API_BASE, { transports: ["websocket", "polling"], autoConnect: true });

interface TrafficLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  sourceMac?: string;
  protocol: string;
  port: number | null;
  deviceName: string | null;
  suspicious: boolean;
  blocked: boolean;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface Report {
  total_devices: number;
  suspicious: number;
  blocked: number;
  timestamp: string;
  devices: TrafficLog[];
}

// ========== Protocol Colors / Icons ==========
const getProtocolInfo = (protocol: string) => {
  switch (protocol.toUpperCase()) {
    case "TCP":
      return { color: "bg-blue-600 text-white", chartColor: "#2563eb", icon: <Server className="h-4 w-4 inline mr-1" /> };
    case "UDP":
      return { color: "bg-green-600 text-white", chartColor: "#16a34a", icon: <Wifi className="h-4 w-4 inline mr-1" /> };
    case "ICMP":
      return { color: "bg-red-600 text-white", chartColor: "#dc2626", icon: <Cpu className="h-4 w-4 inline mr-1" /> };
    case "HTTP":
      return { color: "bg-yellow-600 text-white", chartColor: "#eab308", icon: <Globe className="h-4 w-4 inline mr-1" /> };
    case "HTTPS":
      return { color: "bg-purple-600 text-white", chartColor: "#9333ea", icon: <Shield className="h-4 w-4 inline mr-1" /> };
    case "DNS":
      return { color: "bg-pink-600 text-white", chartColor: "#db2777", icon: <Network className="h-4 w-4 inline mr-1" /> };
    case "SSDP":
      return { color: "bg-orange-600 text-white", chartColor: "#ea580c", icon: <Radio className="h-4 w-4 inline mr-1" /> };
    case "MDNS":
      return { color: "bg-teal-600 text-white", chartColor: "#0d9488", icon: <Radio className="h-4 w-4 inline mr-1" /> };
    case "ARP":
      return { color: "bg-gray-600 text-white", chartColor: "#6b7280", icon: <Network className="h-4 w-4 inline mr-1" /> };
    default:
      return { color: "bg-gray-700 text-white", chartColor: "#9ca3af", icon: null };
  }
};

export default function MonitoringPanel() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TrafficLog[]>([]);
  const [showMaliciousOnly, setShowMaliciousOnly] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [selectedLog, setSelectedLog] = useState<TrafficLog | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);

  // Load existing logs on component mount
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/logs`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTrafficLogs(data.slice(0, 300));
            setIsMonitoring(true);
          }
        }
      } catch (err) {
        console.warn("Initial logs check failed:", err);
      }
    };
    fetchInitialLogs();
  }, []);

  // ========== Live Socket Updates ==========
  useEffect(() => {
    const handleNewEvent = (event: TrafficLog) => {
      setTrafficLogs((prev) => {
        if (prev.some((item) => item.id === event.id)) return prev;
        return [event, ...prev].slice(0, 300);
      });
    };

    const handleBatchEvents = (batch: TrafficLog[]) => {
      if (Array.isArray(batch) && batch.length > 0) {
        setTrafficLogs((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const fresh = batch.filter((b) => !existingIds.has(b.id));
          return [...fresh, ...prev].slice(0, 300);
        });
      }
    };

    const handleCleared = () => {
      setTrafficLogs([]);
      setSelectedLog(null);
      toast.info("Traffic cleared from backend");
    };

    socket.on("new_event", handleNewEvent);
    socket.on("sniffer_event", handleNewEvent);
    socket.on("new_event_batch", handleBatchEvents);
    socket.on("traffic_cleared", handleCleared);

    return () => {
      socket.off("new_event", handleNewEvent);
      socket.off("sniffer_event", handleNewEvent);
      socket.off("new_event_batch", handleBatchEvents);
      socket.off("traffic_cleared", handleCleared);
    };
  }, []);

  // ========== Poll Logs API (Fallback & Sync) ==========
  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/logs`);
        if (res.ok) {
          const data: TrafficLog[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTrafficLogs(data.slice(0, 300));
          }
        }
      } catch (err) {
        console.error("Error fetching logs", err);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // ========== Filtering ==========
  useEffect(() => {
    let filtered = trafficLogs;
    if (showMaliciousOnly) filtered = filtered.filter((log) => log.suspicious);
    setFilteredLogs(filtered);
  }, [trafficLogs, showMaliciousOnly]);

  // ========== Auto-scroll Table Only (does not hijack page scroll) ==========
  useEffect(() => {
    if (autoScroll && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [filteredLogs, autoScroll]);

  // ========== Control Handlers ==========
  const handleStartMonitoring = async () => {
    try {
      await fetch(`${API_BASE}/api/start_monitor`, { method: "POST" });
      setIsMonitoring(true);
      toast.success("Monitoring started - capturing real-time traffic");

      // Immediate fetch after start so table populates immediately
      setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/logs`);
          if (res.ok) {
            const data: TrafficLog[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setTrafficLogs(data.slice(0, 300));
            }
          }
        } catch {}
      }, 500);
    } catch {
      toast.error("Failed to start monitoring");
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await fetch(`${API_BASE}/api/stop_monitor`, { method: "POST" });
      setIsMonitoring(false);
      toast.info("Monitoring stopped");
    } catch {
      toast.error("Failed to stop monitoring");
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch(`${API_BASE}/api/clear`, { method: "POST" });
      setTrafficLogs([]);
      setSelectedLog(null);
      toast.success("Traffic cleared");
    } catch {
      toast.error("Failed to clear traffic");
    }
  };

  const handleBlockDevice = async (sourceIp: string) => {
    try {
      await fetch(`${API_BASE}/api/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: sourceIp }),
      });
      setTrafficLogs((prev) =>
        prev.map((log) =>
          log.sourceIp === sourceIp ? { ...log, blocked: true } : log
        )
      );
      if (selectedLog?.sourceIp === sourceIp)
        setSelectedLog((prev) => (prev ? { ...prev, blocked: true } : prev));
      toast.success(`Device blocked: ${sourceIp}`);
    } catch {
      toast.error("Failed to block device");
    }
  };

  const handleUnblockDevice = async (sourceIp: string) => {
    try {
      await fetch(`${API_BASE}/api/unblock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: sourceIp }),
      });
      setTrafficLogs((prev) =>
        prev.map((log) =>
          log.sourceIp === sourceIp ? { ...log, blocked: false } : log
        )
      );
      if (selectedLog?.sourceIp === sourceIp)
        setSelectedLog((prev) => (prev ? { ...prev, blocked: false } : prev));
      toast.success(`Device unblocked: ${sourceIp}`);
    } catch {
      toast.error("Failed to unblock device");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/monitoring/report`, {
        headers: { "Accept": "application/json" }
      });
      const data: Report = await res.json();
      setReport(data);
      toast.success("Report generated");
    } catch {
      toast.error("Failed to generate report");
    }
  };

  const exportLogs = () => {
    if (filteredLogs.length === 0) return toast.error("No logs to export");

    const csv = [
      Object.keys(filteredLogs[0]).join(","),
      ...filteredLogs.map((log) =>
        Object.values(log)
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lan-monitoring-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported");
  };

  // ========== Chart Data ==========
  const protocolCounts = trafficLogs.reduce<Record<string, number>>(
    (acc, log) => {
      const proto = log.protocol?.toUpperCase() || "UNKNOWN";
      acc[proto] = (acc[proto] || 0) + 1;
      return acc;
    },
    {}
  );

  const chartData = Object.entries(protocolCounts).map(([proto, count]) => {
    const info = getProtocolInfo(proto);
    return { name: proto, value: count, color: info.chartColor };
  });

  // ========== UI ==========
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center space-x-3 flex-wrap">
        {isMonitoring ? (
          <Button onClick={handleStopMonitoring} variant="destructive">
            <Square className="h-4 w-4 mr-2" /> Stop Monitor
          </Button>
        ) : (
          <Button onClick={handleStartMonitoring} variant="cyber">
            <Play className="h-4 w-4 mr-2" /> Start Monitor
          </Button>
        )}

        <Button onClick={handleGenerateReport} variant="outline">
          <FileText className="h-4 w-4 mr-2" /> Generate Report
        </Button>

        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export Logs
        </Button>

        <Button onClick={handleClearLogs} variant="outline">
          Clear Traffic
        </Button>

        <Button
          onClick={() => {
            setShowMaliciousOnly(!showMaliciousOnly);
            if (showMaliciousOnly) setSelectedLog(null);
          }}
          variant={showMaliciousOnly ? "destructive" : "outline"}
        >
          Malicious Traffic
        </Button>

        <Button
          onClick={() => setAutoScroll(!autoScroll)}
          variant={autoScroll ? "default" : "outline"}
        >
          {autoScroll ? "Auto-scroll: ON" : "Auto-scroll: OFF"}
        </Button>
      </div>

      {/* Protocol Distribution Chart */}
      <div className="border rounded-lg bg-gray-900 text-white p-3 shadow-md h-[250px]">
        <h3 className="text-sm font-medium mb-2">Protocol Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", color: "white" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Logs Table */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto border rounded-lg bg-black text-white max-h-[400px] overflow-y-auto"
      >
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-800 sticky top-0 text-white z-10">
            <tr>
              <th className="px-2 py-2 text-left">Time</th>
              <th className="px-2 py-2 text-left">Source</th>
              <th className="px-2 py-2 text-left">Destination</th>
              <th className="px-2 py-2 text-left">Protocol</th>
              <th className="px-2 py-2 text-left">Port</th>
              <th className="px-2 py-2 text-left">Device</th>
              <th className="px-2 py-2 text-left">Severity</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => {
              const protocolInfo = getProtocolInfo(log.protocol || "UNKNOWN");
              let rowBg = idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800";
              if (log.suspicious && !log.blocked) rowBg = "bg-yellow-900/40";
              if (log.blocked) rowBg = "bg-red-900/50 line-through";

              return (
                <tr
                  key={log.id}
                  className={`${rowBg} hover:bg-gray-700 transition`}
                  onClick={() => setSelectedLog(log)}
                  style={{ cursor: "pointer" }}
                  title="Click to select row"
                >
                  <td className="px-2 py-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-2 py-2">{log.sourceIp}</td>
                  <td className="px-2 py-2">{log.destinationIp}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`px-1 py-0.5 rounded text-xs font-medium ${protocolInfo.color}`}
                    >
                      {protocolInfo.icon}
                      {log.protocol || "Unknown"}
                    </span>
                  </td>
                  <td className="px-2 py-2">{log.port ?? "—"}</td>
                  <td className="px-2 py-2">{log.deviceName || "Unknown"}</td>
                  <td className="px-2 py-2">
                    {log.blocked ? (
                      <Badge variant="destructive">BLOCKED</Badge>
                    ) : log.suspicious ? (
                      <Badge
                        variant={
                          log.severity === "critical" ? "destructive" : "warning"
                        }
                      >
                        {log.severity.toUpperCase()}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {log.severity.toUpperCase()}
                      </Badge>
                    )}
                  </td>
                  <td className="px-2 py-2 space-x-1">
                    {!log.blocked ? (
                      <Button
                        size="sm"
                        className="bg-red-700 hover:bg-red-600 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlockDevice(log.sourceIp);
                        }}
                        disabled={!log.suspicious}
                      >
                        <Ban className="h-3 w-3 mr-1" /> Block
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-600 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnblockDevice(log.sourceIp);
                        }}
                      >
                        <Unlock className="h-3 w-3 mr-1" /> Unblock
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" /> Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Log Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Traffic Details</DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto text-xs space-y-1">
              {Object.entries(selectedLog).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value?.toString()}
                </p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Modal */}
      {report && (
        <Dialog open={!!report} onOpenChange={() => setReport(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Scan Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p><strong>Total Devices:</strong> {report.total_devices}</p>
              <p><strong>Suspicious:</strong> {report.suspicious}</p>
              <p><strong>Blocked:</strong> {report.blocked}</p>
              <p><strong>Generated:</strong> {report.timestamp}</p>
              <Button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(report, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `scan-report-${new Date()
                    .toISOString()
                    .split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" /> Download Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}




