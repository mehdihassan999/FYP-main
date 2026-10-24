// import { useState, useEffect } from "react";
// import { io } from "socket.io-client";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// export default function Logs() {
//   const [logs, setLogs] = useState<any[]>([]);
//   const [filterMalicious, setFilterMalicious] = useState(false);

//   useEffect(() => {
//     const socket = io("http://localhost:5000");

//     socket.on("sniffer_event", (event: any) => {
//       // Normalize protocol names
//       const protocol = event.protocol?.toUpperCase() || "UNKNOWN";

//       // Mark HTTP (not HTTPS) as malicious
//       const isHttpMalicious =
//         protocol === "HTTP" || (protocol === "TCP" && event.dstPort === 80);

//       const normalized = {
//         ...event,
//         protocol,
//         suspicious: event.suspicious || isHttpMalicious,
//       };

//       setLogs((prev) => [normalized, ...prev].slice(0, 200));
//     });

//     socket.on("traffic_cleared", () => {
//       setLogs([]);
//     });

//     socket.on("connect", () => {
//       console.log("[SOCKET] Connected to server");
//     });

//     socket.on("disconnect", () => {
//       console.log("[SOCKET] Disconnected from server");
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const clearTraffic = () => {
//     setLogs([]); // clear UI immediately
//     fetch("http://localhost:5000/clear-traffic", { method: "POST" });
//   };

//   const blockIp = (ip: string) => {
//     fetch("http://localhost:5000/block-ip", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ip }),
//     });
//   };

//   const unblockIp = (ip: string) => {
//     fetch("http://localhost:5000/unblock-ip", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ip }),
//     });
//   };

//   // Show only malicious logs if filter enabled
//   const displayedLogs = filterMalicious
//     ? logs.filter((log) => log.suspicious === true || log.severity === "high")
//     : logs;

//   return (
//     <div className="p-4 bg-gray-900 text-white rounded-lg shadow-lg">
//       {/* Header with controls */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">Live Traffic</h2>
//         <div className="space-x-2">
//           <Button
//             onClick={() => setFilterMalicious((prev) => !prev)}
//             className={filterMalicious ? "bg-red-600 hover:bg-red-700" : ""}
//           >
//             {filterMalicious ? "Show All" : "Show Malicious Only"}
//           </Button>
//           <Button onClick={clearTraffic} variant="destructive">
//             Clear Traffic
//           </Button>
//         </div>
//       </div>

//       {/* Traffic table */}
//       <div className="overflow-x-auto max-h-[500px] overflow-y-scroll">
//         <table className="table-auto w-full border border-gray-700 text-sm">
//           <thead>
//             <tr className="bg-gray-800 text-left">
//               <th className="px-2 py-1">Time</th>
//               <th className="px-2 py-1">Source IP</th>
//               <th className="px-2 py-1">Destination IP</th>
//               <th className="px-2 py-1">Protocol</th>
//               <th className="px-2 py-1">Src Port</th>
//               <th className="px-2 py-1">Dst Port</th>
//               <th className="px-2 py-1">Device</th>
//               <th className="px-2 py-1">Severity</th>
//               <th className="px-2 py-1">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {displayedLogs.map((log, i) => (
//               <tr
//                 key={i}
//                 className={`border-t border-gray-700 hover:bg-gray-800 transition ${
//                   log.suspicious ? "bg-red-900/40" : ""
//                 }`}
//               >
//                 <td className="px-2 py-1">
//                   {new Date(log.timestamp).toLocaleTimeString()}
//                 </td>
//                 <td className="px-2 py-1">{log.sourceIp || "-"}</td>
//                 <td className="px-2 py-1">{log.destinationIp || "-"}</td>
//                 <td className="px-2 py-1">{log.protocol}</td>
//                 <td className="px-2 py-1">{log.srcPort || "-"}</td>
//                 <td className="px-2 py-1">{log.dstPort || "-"}</td>
//                 <td className="px-2 py-1">{log.deviceName || "Unknown"}</td>
//                 <td className="px-2 py-1">
//                   <Badge
//                     className={
//                       log.severity === "high"
//                         ? "bg-red-600"
//                         : log.severity === "medium"
//                         ? "bg-yellow-600"
//                         : "bg-green-600"
//                     }
//                   >
//                     {log.severity?.toUpperCase() || "LOW"}
//                   </Badge>
//                 </td>
//                 <td className="px-2 py-1 space-x-2">
//                   {log.suspicious && (
//                     <>
//                       <Button
//                         size="sm"
//                         className="bg-red-700 hover:bg-red-800"
//                         onClick={() => blockIp(log.sourceIp)}
//                       >
//                         Block
//                       </Button>
//                       <Button
//                         size="sm"
//                         className="bg-green-700 hover:bg-green-800"
//                         onClick={() => unblockIp(log.sourceIp)}
//                       >
//                         Unblock
//                       </Button>
//                     </>
//                   )}
//                 </td>
//               </tr>
//             ))}
//             {displayedLogs.length === 0 && (
//               <tr>
//                 <td colSpan={9} className="text-center py-4 text-gray-400">
//                   No traffic captured yet.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




















import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterMalicious, setFilterMalicious] = useState(false);

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000", { transports: ["websocket", "polling"] });

    socket.on("sniffer_event", (event: any) => {
      // Normalize protocol
      const protocol = event.protocol?.toUpperCase() || "UNKNOWN";

      // Mark HTTP/TCP:80 as malicious
      const isHttpMalicious =
        protocol === "HTTP" || (protocol === "TCP" && event.dstPort === 80);

      const normalized = {
        ...event,
        protocol,
        suspicious: event.suspicious || isHttpMalicious,
      };

      setLogs((prev) => [normalized, ...prev].slice(0, 200));
    });

    socket.on("traffic_cleared", () => {
      setLogs([]);
    });

    socket.on("connect", () => {
      console.log("[SOCKET] Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ---- API helpers ----
  const clearTraffic = () => {
    setLogs([]); // clear UI immediately
    fetch("http://127.0.0.1:5000/clear", { method: "POST" });
  };

  const exportLogs = () => {
    fetch("http://127.0.0.1:5000/export")
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "traffic_logs.json";
        a.click();
      })
      .catch((err) => console.error("Export failed", err));
  };

  const blockIp = (ip: string) => {
    fetch("http://127.0.0.1:5000/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
  };

  const unblockIp = (ip: string) => {
    fetch("http://127.0.0.1:5000/unblock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
  };

  // Show only malicious logs if filter enabled
  const displayedLogs = filterMalicious
    ? logs.filter((log) => log.suspicious === true || log.severity === "high")
    : logs;

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Live Traffic</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setFilterMalicious((prev) => !prev)}
            className={filterMalicious ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {filterMalicious ? "Show All" : "Show Malicious Only"}
          </Button>
          <Button onClick={exportLogs} className="bg-blue-600 hover:bg-blue-700">
            Export Logs
          </Button>
          <Button onClick={clearTraffic} variant="destructive">
            Clear Traffic
          </Button>
        </div>
      </div>

      {/* Traffic table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-scroll">
        <table className="table-auto w-full border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-2 py-1">Time</th>
              <th className="px-2 py-1">Source IP</th>
              <th className="px-2 py-1">Destination IP</th>
              <th className="px-2 py-1">Protocol</th>
              <th className="px-2 py-1">Src Port</th>
              <th className="px-2 py-1">Dst Port</th>
              <th className="px-2 py-1">Device</th>
              <th className="px-2 py-1">Severity</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedLogs.map((log, i) => (
              <tr
                key={i}
                className={`border-t border-gray-700 hover:bg-gray-800 transition ${
                  log.suspicious ? "bg-red-900/40" : ""
                }`}
              >
                <td className="px-2 py-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-2 py-1">{log.sourceIp || "-"}</td>
                <td className="px-2 py-1">{log.destinationIp || "-"}</td>
                <td className="px-2 py-1">{log.protocol}</td>
                <td className="px-2 py-1">{log.srcPort || "-"}</td>
                <td className="px-2 py-1">{log.dstPort || "-"}</td>
                <td className="px-2 py-1">{log.deviceName || "Unknown"}</td>
                <td className="px-2 py-1">
                  <Badge
                    className={
                      log.severity === "high"
                        ? "bg-red-600"
                        : log.severity === "medium"
                        ? "bg-yellow-600"
                        : "bg-green-600"
                    }
                  >
                    {log.severity?.toUpperCase() || "LOW"}
                  </Badge>
                </td>
                <td className="px-2 py-1 space-x-2">
                  {log.suspicious && (
                    <>
                      <Button
                        size="sm"
                        className="bg-red-700 hover:bg-red-800"
                        onClick={() => blockIp(log.sourceIp)}
                      >
                        Block
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-800"
                        onClick={() => unblockIp(log.sourceIp)}
                      >
                        Unblock
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {displayedLogs.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-400">
                  No traffic captured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
