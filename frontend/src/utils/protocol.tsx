import { Cpu, Server, Wifi } from "lucide-react"; // Example icons, you can choose better ones

export const getProtocolInfo = (protocol: string) => {
  switch (protocol.toUpperCase()) {
    case "TCP":
      return { color: "bg-blue-100 text-blue-800", icon: <Server className="h-4 w-4 inline mr-1" /> };
    case "UDP":
      return { color: "bg-green-100 text-green-800", icon: <Wifi className="h-4 w-4 inline mr-1" /> };
    case "ICMP":
      return { color: "bg-red-100 text-red-800", icon: <Cpu className="h-4 w-4 inline mr-1" /> };
    default:
      return { color: "bg-gray-100 text-gray-800", icon: null };
  }
};
