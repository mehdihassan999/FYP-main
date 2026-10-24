









// import { useState, useEffect, useCallback } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import {
//   Monitor,
//   Smartphone,
//   Printer,
//   Camera,
//   Tv,
//   Laptop,
//   AlertTriangle,
//   Scan,
//   Download,
//   RefreshCw,
//   Search,
//   Zap,
//   Trash2,
//   Info,
//   X,
//   Shield,
//   ShieldCheck,
//   ShieldAlert,
//   FileText,
//   Wrench,
//   CheckCircle,
//   XOctagon,
//   Clock,
//   Play,
//   Square,
//   Loader2,
//   AlertCircle,
//   Settings,
//   Network
// } from 'lucide-react';
// import { toast } from 'sonner';

// // Enhanced Type Definitions
// interface Vulnerability {
//   id: string;
//   description: string;
//   severity: 'low' | 'medium' | 'high' | 'critical';
//   mitigation?: string;
//   vulnerability_number?: number;
//   name?: string;
//   category?: 'auto-fixable' | 'manual' | 'non-fixable';
//   fix_method?: string;
//   fix_commands?: string[];
//   manual_steps?: string[];
//   potential_harm?: string;
//   status?: 'found' | 'fixed' | 'fix_failed' | 'in_progress';
//   detected_at?: string;
//   fixed_at?: string;
//   cve_id?: string;
//   port?: number;
//   service?: string;
// }

// interface Device {
//   id: string;
//   name: string;
//   ip: string;
//   mac: string;
//   type: string;
//   vendor: string;
//   status: 'online' | 'offline';
//   authorized?: boolean;
//   lastSeen: string;
//   vulnerabilities: Vulnerability[];
//   riskLevel: 'low' | 'medium' | 'high' | 'critical';
//   comprehensive_vulnerabilities?: Vulnerability[];
//   last_scanned?: string;
//   fix_results?: any;
//   os?: string;
//   open_ports?: number[];
//   services?: string[];
//   hostname?: string;
// }

// interface ScanProgress {
//   deviceId: string;
//   progress: number;
//   status: 'scanning' | 'vulnerability_scan' | 'completed' | 'failed';
//   current_task?: string;
// }

// interface ScanStatus {
//   [key: string]: {
//     progress: number;
//     status: string;
//     current_task: string;
//     started_at: string;
//     type: string;
//   };
// }

// interface FixStatus {
//   [key: string]: boolean;
// }

// // WebSocket event types
// interface SocketEvent {
//   type: string;
//   data: any;
// }

// export default function DevicesPanel() {
//   const [devices, setDevices] = useState<Device[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState<string>('all');
//   const [filterStatus, setFilterStatus] = useState<string>('all');
//   const [isScanningAll, setIsScanningAll] = useState(false);
//   const [selectedSubnet, setSelectedSubnet] = useState<string>('auto');
//   const [scanningDevices, setScanningDevices] = useState<Set<string>>(new Set());
//   const [fixingDevices, setFixingDevices] = useState<Set<string>>(new Set());
//   const [fixingVulnerabilities, setFixingVulnerabilities] = useState<Set<string>>(new Set());
//   const [scanProgress, setScanProgress] = useState<ScanStatus>({});
//   const [fixProgress, setFixProgress] = useState<FixStatus>({});
  
//   const [showInfoModal, setShowInfoModal] = useState(false);
//   const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // WebSocket connection for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket('ws://localhost:5000');
    
//     ws.onopen = () => {
//       console.log('✅ WebSocket connected');
//       setIsConnected(true);
//     };
    
//     ws.onmessage = (event) => {
//       try {
//         const data: SocketEvent = JSON.parse(event.data);
//         handleSocketEvent(data);
//       } catch (error) {
//         console.error('WebSocket message error:', error);
//       }
//     };
    
//     ws.onclose = () => {
//       console.log('❌ WebSocket disconnected');
//       setIsConnected(false);
//     };
    
//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setIsConnected(false);
//     };
    
//     setSocket(ws);
    
//     return () => {
//       ws.close();
//     };
//   }, []);

//   // Handle real-time WebSocket events
//   const handleSocketEvent = useCallback((event: SocketEvent) => {
//     switch (event.type) {
//       case 'device_scan_started':
//         toast.info(`Scan started for ${event.data.device_id}`);
//         setScanningDevices(prev => new Set(prev).add(event.data.device_id));
//         break;
        
//       case 'device_scan_progress':
//         setScanProgress(prev => ({
//           ...prev,
//           [event.data.device_id]: {
//             progress: event.data.progress,
//             status: event.data.status,
//             current_task: event.data.current_task,
//             started_at: new Date().toISOString(),
//             type: 'device_scan'
//           }
//         }));
//         break;
        
//       case 'device_scan_completed':
//         toast.success(`Scan completed for ${event.data.device_id}: ${event.data.vulnerabilities_found} vulnerabilities found`);
//         setScanningDevices(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(event.data.device_id);
//           return newSet;
//         });
//         setScanProgress(prev => {
//           const newProgress = { ...prev };
//           delete newProgress[event.data.device_id];
//           return newProgress;
//         });
//         // Refresh devices to get updated vulnerabilities
//         fetchDevices();
//         break;
        
//       case 'device_scan_failed':
//         toast.error(`Scan failed for ${event.data.device_id}: ${event.data.message}`);
//         setScanningDevices(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(event.data.device_id);
//           return newSet;
//         });
//         break;
        
//       case 'deep_scan_started':
//         toast.info('Deep IoT vulnerability scan started');
//         setIsScanningAll(true);
//         break;
        
//       case 'deep_scan_progress':
//         setScanProgress(prev => ({
//           ...prev,
//           'deep_iot_scan': {
//             progress: event.data.progress,
//             status: 'scanning',
//             current_task: `Scanning ${event.data.current_device} (${event.data.devices_scanned}/${event.data.total_devices})`,
//             started_at: new Date().toISOString(),
//             type: 'iot_scan'
//           }
//         }));
//         break;
        
//       case 'deep_scan_completed':
//         toast.success(`Deep IoT scan completed: ${event.data.total_vulnerabilities_found} vulnerabilities found across ${event.data.total_devices_scanned} devices`);
//         setIsScanningAll(false);
//         setScanProgress(prev => {
//           const newProgress = { ...prev };
//           delete newProgress['deep_iot_scan'];
//           return newProgress;
//         });
//         fetchDevices();
//         break;
        
//       case 'vulnerability_fix_attempt':
//         if (event.data.status === 'success') {
//           toast.success(`Vulnerability fixed: ${event.data.message}`);
//         } else {
//           toast.error(`Fix failed: ${event.data.message}`);
//         }
//         setFixingVulnerabilities(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(event.data.vulnerability_id);
//           return newSet;
//         });
//         // Refresh to get updated status
//         setTimeout(() => fetchDevices(), 1000);
//         break;
        
//       case 'all_scans_stopped':
//         toast.info(`All scans stopped: ${event.data.stopped_scans} scans terminated`);
//         setIsScanningAll(false);
//         setScanningDevices(new Set());
//         setScanProgress({});
//         break;
        
//       default:
//         console.log('Unhandled WebSocket event:', event);
//     }
//   }, []);

//   // Real-time updates via polling (fallback)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchDevices();
//       fetchScanStatus();
//     }, 10000);

//     return () => clearInterval(interval);
//   }, []);

//   // Fetch devices from backend
//   const fetchDevices = async (): Promise<void> => {
//     try {
//       const response = await fetch('http://localhost:5000/api/dp/devices/scan-network');
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const data = await response.json();
//       setDevices(data.devices || data.data || []);
//     } catch (err) {
//       console.error('Failed to fetch devices:', err);
//       toast.error('Failed to fetch devices');
//     }
//   };

//   // Fetch scan status
//   const fetchScanStatus = async (): Promise<void> => {
//     try {
//       const response = await fetch('http://localhost:5000/api/dp/devices/scan-status');
//       if (response.ok) {
//         const data = await response.json();
//         setScanProgress(data.active_scans || {});
//       }
//     } catch (err) {
//       console.error('Failed to fetch scan status:', err);
//     }
//   };

//   // Device classification
//   const classifyDeviceType = (device: Device): string => {
//     if (device.type && device.type !== 'unknown') return device.type;
    
//     const vendorLower = (device.vendor || '').toLowerCase();
//     const nameLower = (device.name || '').toLowerCase();
//     const osLower = (device.os || '').toLowerCase();

//     // IoT devices
//     if (
//       vendorLower.includes('hue') ||
//       vendorLower.includes('philips') ||
//       vendorLower.includes('sonos') ||
//       vendorLower.includes('nest') ||
//       vendorLower.includes('tplink') ||
//       vendorLower.includes('tp-link') ||
//       vendorLower.includes('smart') ||
//       vendorLower.includes('iot') ||
//       nameLower.includes('iot') ||
//       nameLower.includes('sensor') ||
//       nameLower.includes('smart') ||
//       (nameLower.includes('camera') && !nameLower.includes('webcam'))
//     ) {
//       return 'iot';
//     }

//     // Network equipment
//     if (
//       vendorLower.includes('cisco') ||
//       vendorLower.includes('netgear') ||
//       vendorLower.includes('d-link') ||
//       vendorLower.includes('linksys') ||
//       vendorLower.includes('tenda') ||
//       nameLower.includes('router') ||
//       nameLower.includes('switch') ||
//       nameLower.includes('access point')
//     ) {
//       return 'router';
//     }

//     // Computers
//     if (
//       osLower.includes('windows') ||
//       osLower.includes('linux') ||
//       osLower.includes('mac') ||
//       nameLower.includes('pc') ||
//       nameLower.includes('laptop') ||
//       nameLower.includes('desktop') ||
//       nameLower.includes('computer')
//     ) {
//       return 'computer';
//     }

//     return 'other';
//   };

//   // Device discovery scan
//   const handleScanAll = async (): Promise<void> => {
//     setIsScanningAll(true);
//     toast.info('Starting network device discovery...');
    
//     try {
//       let url = 'http://localhost:5000/api/dp/devices/scan-network';
//       if (selectedSubnet && selectedSubnet !== 'auto') {
//         url += `?subnet=${encodeURIComponent(selectedSubnet)}`;
//       }
      
//       const response = await fetch(url);
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const data = await response.json();
//       setDevices(data.devices || data.data || []);
//       toast.success(`Found ${data.devices?.length || data.data?.length || 0} devices`);
//     } catch (err) {
//       toast.error('Network scan failed');
//       console.error('Scan error:', err);
//     } finally {
//       setIsScanningAll(false);
//     }
//   };

//   // Deep IoT vulnerability scan
//   const handleScanIoTNetwork = async (): Promise<void> => {
//     setIsScanningAll(true);
//     toast.info('Starting comprehensive IoT vulnerability scan...');
    
//     try {
//       const response = await fetch('http://localhost:5000/api/dp/devices/iot/scan-all', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const data = await response.json();
      
//       if (data.status === 'success') {
//         toast.success('IoT vulnerability scan started successfully');
//       } else {
//         toast.error(`IoT scan failed: ${data.message}`);
//       }
//     } catch (err) {
//       toast.error('Failed to start IoT vulnerability scan');
//       console.error('IoT scan error:', err);
//     }
//   };

//   // Individual device vulnerability scan
//   const handleScanDevice = async (deviceId: string): Promise<void> => {
//     setScanningDevices(prev => new Set(prev).add(deviceId));
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/dp/devices/${deviceId}/scan`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const data = await response.json();
      
//       if (data.status === 'success') {
//         toast.success(`Vulnerability scan started for device`);
//       } else {
//         toast.error(`Device scan failed: ${data.message}`);
//         setScanningDevices(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(deviceId);
//           return newSet;
//         });
//       }
//     } catch (err) {
//       toast.error('Failed to scan device');
//       console.error('Device scan error:', err);
//       setScanningDevices(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(deviceId);
//         return newSet;
//       });
//     }
//   };

//   // Stop all scans
//   const handleStopScan = async (): Promise<void> => {
//     try {
//       const response = await fetch('http://localhost:5000/api/dp/devices/stop-scan', {
//         method: 'POST'
//       });
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const data = await response.json();
//       toast.success(data.message || 'All scans stopped successfully');
      
//       // Update local state
//       setIsScanningAll(false);
//       setScanningDevices(new Set());
//       setScanProgress({});
//     } catch (err) {
//       toast.error('Failed to stop scans');
//       console.error('Stop scan error:', err);
//     }
//   };

//   // Fix individual vulnerability
//   const handleFixVulnerability = async (vulnerabilityId: string, deviceId: string): Promise<void> => {
//     setFixingVulnerabilities(prev => new Set(prev).add(vulnerabilityId));
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/dp/devices/vulnerabilities/${vulnerabilityId}/fix`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           device_id: deviceId
//         })
//       });
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const result = await response.json();
      
//       if (result.status === 'success') {
//         toast.success('Vulnerability fix initiated successfully');
//       } else if (result.status === 'non_fixable') {
//         toast.warning('This vulnerability requires manual intervention', {
//           description: result.message,
//           duration: 8000
//         });
        
//         if (result.manual_steps) {
//           const steps = Array.isArray(result.manual_steps) 
//             ? result.manual_steps.join('\n\n• ')
//             : result.manual_steps;
          
//           // Show manual steps in a modal or alert
//           alert(`🔧 Manual Fix Required\n\n${result.fix_method || 'Follow these steps:'}\n\n• ${steps}`);
//         }
//       } else {
//         toast.error(`Fix failed: ${result.message || 'Unknown error'}`);
//       }
//     } catch (err) {
//       toast.error('Failed to fix vulnerability');
//       console.error('Fix vulnerability error:', err);
//     } finally {
//       // Don't remove from fixing state immediately - wait for WebSocket event
//     }
//   };

//   // Batch fix all auto-fixable vulnerabilities on a device
//   const handleBatchFix = async (deviceId: string, vulnerabilityIds: string[]): Promise<void> => {
//     setFixingDevices(prev => new Set(prev).add(deviceId));
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/dp/devices/devices/${deviceId}/vulnerabilities/fix-multiple`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           vulnerability_ids: vulnerabilityIds,
//           auto_fix_only: true
//         })
//       });
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const result = await response.json();
      
//       if (result.status === 'success') {
//         toast.success(`Batch fix completed: ${result.data?.successful_fixes || 0} successful, ${result.data?.failed_fixes || 0} failed`);
        
//         // Refresh devices to get updated status
//         setTimeout(() => fetchDevices(), 2000);
//       } else {
//         toast.error(`Batch fix failed: ${result.message || 'Unknown error'}`);
//       }
//     } catch (err) {
//       toast.error('Failed to execute batch fix');
//       console.error('Batch fix error:', err);
//     } finally {
//       setFixingDevices(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(deviceId);
//         return newSet;
//       });
//     }
//   };

//   // Auto-fix all vulnerabilities on device
//   const handleAutoFix = async (deviceId: string): Promise<void> => {
//     setFixingDevices(prev => new Set(prev).add(deviceId));
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/dp/devices/${deviceId}/auto-fix`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const result = await response.json();
      
//       if (result.status === 'success') {
//         const summary = result.fix_summary;
//         toast.success(
//           `Auto-fix completed: ${summary.successful_fixes} fixed, ${summary.failed_fixes} failed, ${summary.non_fixable} non-fixable`
//         );
        
//         // Refresh devices
//         setTimeout(() => fetchDevices(), 2000);
//       } else {
//         toast.error(`Auto-fix failed: ${result.message || 'Unknown error'}`);
//       }
//     } catch (err) {
//       toast.error('Failed to execute auto-fix');
//       console.error('Auto-fix error:', err);
//     } finally {
//       setFixingDevices(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(deviceId);
//         return newSet;
//       });
//     }
//   };

//   // Get device info for modal
//   const handleInfoDevice = async (device: Device): Promise<void> => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/dp/devices/${device.id}/info`);
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const info = await response.json();
//       setSelectedDevice(info);
//       setShowInfoModal(true);
//     } catch (err) {
//       toast.error('Failed to fetch device details');
//       console.error('Device info error:', err);
//     }
//   };

//   // Generate vulnerability report
//   const handleGetVulnerabilityReport = async (deviceId: string): Promise<void> => {
//     try {
//       const device = devices.find(d => d.id === deviceId);
//       toast.info('Generating comprehensive vulnerability report...');
      
//       const response = await fetch(`http://localhost:5000/api/dp/devices/${deviceId}/vulnerability-report`);
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const report = await response.json();
      
//       if (report.status === 'success') {
//         let reportText = `=== COMPREHENSIVE VULNERABILITY REPORT ===\n\n`;
//         reportText += `Device: ${report.device_name}\n`;
//         reportText += `IP: ${report.ip_address}\n`;
//         reportText += `MAC: ${report.mac_address}\n`;
//         reportText += `Type: ${report.device_type}\n`;
//         reportText += `Vendor: ${report.vendor}\n`;
//         reportText += `Risk Level: ${report.risk_level.toUpperCase()}\n`;
//         reportText += `Scan Date: ${report.scan_date}\n`;
//         reportText += `Total Vulnerabilities: ${report.total_vulnerabilities}\n\n`;
        
//         reportText += "VULNERABILITY SUMMARY:\n";
//         reportText += "=".repeat(50) + "\n";
//         reportText += `Auto-fixable: ${report.auto_fixable}\n`;
//         reportText += `Manual: ${report.manual}\n`;
//         reportText += `Non-fixable: ${report.non_fixable}\n`;
//         reportText += `Already Fixed: ${report.fixed}\n\n`;
        
//         reportText += "SEVERITY BREAKDOWN:\n";
//         reportText += "=".repeat(50) + "\n";
//         reportText += `Critical: ${report.by_severity.critical}\n`;
//         reportText += `High: ${report.by_severity.high}\n`;
//         reportText += `Medium: ${report.by_severity.medium}\n`;
//         reportText += `Low: ${report.by_severity.low}\n\n`;
        
//         if (report.vulnerabilities && report.vulnerabilities.length > 0) {
//           reportText += "DETAILED VULNERABILITIES:\n";
//           reportText += "=".repeat(50) + "\n";
          
//           report.vulnerabilities.forEach((vuln: Vulnerability, index: number) => {
//             reportText += `\n${index + 1}. ${vuln.name || vuln.id}\n`;
//             reportText += `   Severity: ${vuln.severity?.toUpperCase()}\n`;
//             reportText += `   Category: ${vuln.category || 'unknown'}\n`;
//             reportText += `   Status: ${vuln.status || 'found'}\n`;
//             reportText += `   Description: ${vuln.description}\n`;
            
//             if (vuln.fix_method) {
//               reportText += `   Fix Method: ${vuln.fix_method}\n`;
//             }
            
//             if (vuln.manual_steps && Array.isArray(vuln.manual_steps)) {
//               reportText += `   Manual Steps:\n`;
//               vuln.manual_steps.forEach((step: string, stepIndex: number) => {
//                 reportText += `     ${stepIndex + 1}. ${step}\n`;
//               });
//             }
            
//             if (vuln.potential_harm) {
//               reportText += `   Potential Harm: ${vuln.potential_harm}\n`;
//             }
            
//             if (vuln.port) {
//               reportText += `   Affected Port: ${vuln.port}\n`;
//             }
            
//             reportText += `   Detected: ${vuln.detected_at || 'Unknown'}\n`;
//             if (vuln.fixed_at) {
//               reportText += `   Fixed: ${vuln.fixed_at}\n`;
//             }
//             reportText += "-".repeat(40) + "\n";
//           });
//         } else {
//           reportText += "No vulnerabilities found. Device appears to be secure.\n";
//         }
        
//         // Create downloadable report
//         const blob = new Blob([reportText], { type: 'text/plain' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `vulnerability-report-${report.device_name}-${new Date().toISOString().split('T')[0]}.txt`;
//         a.click();
//         window.URL.revokeObjectURL(url);
        
//         toast.success('Vulnerability report downloaded');
//       } else {
//         toast.error('Failed to generate vulnerability report');
//       }
//     } catch (err) {
//       toast.error('Failed to get vulnerability report');
//       console.error('Report generation error:', err);
//     }
//   };

//   // Export PDF report
//   const handleExportPDF = async (deviceId: string): Promise<void> => {
//     try {
//       toast.info('Generating PDF report...');
      
//       const response = await fetch(`http://localhost:5000/api/dp/devices/${deviceId}/export-pdf`);
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `device-security-report-${deviceId}-${new Date().toISOString().split('T')[0]}.pdf`;
//       a.click();
//       window.URL.revokeObjectURL(url);
      
//       toast.success('PDF report downloaded');
//     } catch (err) {
//       toast.error('Failed to export PDF report');
//       console.error('PDF export error:', err);
//     }
//   };

//   // Clear all devices
//   const handleClearDevices = async (): Promise<void> => {
//     try {
//       const response = await fetch('http://localhost:5000/api/dp/devices/clear', {
//         method: 'POST'
//       });
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       setDevices([]);
//       toast.success('Devices cleared from memory');
//     } catch (err) {
//       toast.error('Failed to clear devices');
//       console.error('Clear devices error:', err);
//     }
//   };

//   // Export all devices report
//   const handleExportAll = async (): Promise<void> => {
//     toast.info('Generating comprehensive network report...');
//     try {
//       const response = await fetch('http://localhost:5000/api/dp/devices/export-all');
      
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `network-security-report-${new Date().toISOString().split('T')[0]}.pdf`;
//       a.click();
//       window.URL.revokeObjectURL(url);
      
//       toast.success('Comprehensive report downloaded');
//     } catch (err) {
//       toast.error('Report export failed');
//       console.error('Export error:', err);
//     }
//   };

//   // Utility functions
//   const getDeviceIcon = (type: string) => {
//     switch (type) {
//       case 'computer': return Laptop;
//       case 'mobile': return Smartphone;
//       case 'printer': return Printer;
//       case 'camera': return Camera;
//       case 'tv': return Tv;
//       case 'router': return Monitor;
//       case 'iot': return Zap;
//       default: return Monitor;
//     }
//   };

//   const getRiskBadge = (risk: string) => {
//     switch (risk) {
//       case 'critical': return 'destructive';
//       case 'high': return 'warning';
//       case 'medium': return 'secondary';
//       case 'low': return 'success';
//       default: return 'outline';
//     }
//   };

//   const getVulnerabilityBadge = (category?: string) => {
//     switch (category) {
//       case 'auto-fixable': return 'success';
//       case 'manual': return 'warning';
//       case 'non-fixable': return 'secondary';
//       default: return 'outline';
//     }
//   };

//   const getStatusIcon = (status?: string) => {
//     switch (status) {
//       case 'fixed': return <CheckCircle className="h-3 w-3 text-green-500" />;
//       case 'fix_failed': return <XOctagon className="h-3 w-3 text-red-500" />;
//       case 'in_progress': return <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />;
//       default: return <AlertTriangle className="h-3 w-3 text-orange-500" />;
//     }
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'critical': return 'text-red-500';
//       case 'high': return 'text-orange-500';
//       case 'medium': return 'text-yellow-500';
//       case 'low': return 'text-blue-500';
//       default: return 'text-gray-500';
//     }
//   };

//   // Filter devices
//   const filteredDevices = devices.filter(device => {
//     const actualType = classifyDeviceType(device);
//     const matchesSearch =
//       device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       device.ip.includes(searchTerm) ||
//       device.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       device.mac.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesType = filterType === 'all' || actualType === filterType;
//     const matchesStatus =
//       filterStatus === 'all' ||
//       (filterStatus === 'online' && device.status === 'online') ||
//       (filterStatus === 'offline' && device.status === 'offline');
//     return matchesSearch && matchesType && matchesStatus;
//   });

//   // Statistics calculations
//   const totalDevices = devices.length;
//   const onlineDevices = devices.filter(d => d.status === 'online').length;
//   const vulnerableDevices = devices.filter(
//     d => (d.vulnerabilities?.length > 0) || (d.comprehensive_vulnerabilities?.length > 0)
//   ).length;

//   const autoFixableVulnerabilities = devices.reduce((total, device) => {
//     const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
//     return total + vulns.filter(v => v.category === 'auto-fixable' && v.status !== 'fixed').length;
//   }, 0);

//   const manualVulnerabilities = devices.reduce((total, device) => {
//     const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
//     return total + vulns.filter(v => v.category === 'manual').length;
//   }, 0);

//   const nonFixableVulnerabilities = devices.reduce((total, device) => {
//     const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
//     return total + vulns.filter(v => v.category === 'non-fixable').length;
//   }, 0);

//   const fixedVulnerabilities = devices.reduce((total, device) => {
//     const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
//     return total + vulns.filter(v => v.status === 'fixed').length;
//   }, 0);

//   const iotDevices = devices.filter(d => classifyDeviceType(d) === 'iot');
//   const criticalRiskDevices = devices.filter(d => d.riskLevel === 'critical').length;

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Connection Status */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
//           <span className="text-sm text-muted-foreground">
//             {isConnected ? 'Real-time updates connected' : 'Real-time updates disconnected'}
//           </span>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-primary">
//             Network Security Dashboard
//           </h1>
//           <p className="text-muted-foreground font-code text-sm">
//             Real-time device monitoring and vulnerability management
//           </p>
//           <p className="text-muted-foreground font-code text-xs mt-1">
//             Active scanning, auto-remediation, and comprehensive security reporting
//           </p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <Select value={selectedSubnet} onValueChange={setSelectedSubnet}>
//             <SelectTrigger className="w-32 bg-input/50 border-border font-code">
//               <SelectValue placeholder="Subnet" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="auto">Auto Detect</SelectItem>
//               <SelectItem value="192.168.1.0/24">/24 (Fast)</SelectItem>
//               <SelectItem value="192.168.0.0/20">/20 (Slower)</SelectItem>
//               <SelectItem value="10.0.0.0/16">10.0.0.0/16</SelectItem>
//               <SelectItem value="172.16.0.0/16">172.16.0.0/16</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button
//             onClick={handleScanAll}
//             disabled={isScanningAll}
//             variant="default"
//             size="sm"
//             className="font-code"
//           >
//             {isScanningAll ? (
//               <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
//             ) : (
//               <Scan className="h-4 w-4 mr-1" />
//             )}
//             {isScanningAll ? 'Scanning...' : 'Discover Devices'}
//           </Button>
//           <Button
//             onClick={handleScanIoTNetwork}
//             disabled={isScanningAll}
//             variant="default"
//             size="sm"
//             className="font-code bg-cyan-600 hover:bg-cyan-700"
//           >
//             <Zap className="h-4 w-4 mr-1" />
//             {isScanningAll ? 'Scanning...' : 'Deep IoT Scan'}
//           </Button>
//           <Button
//             onClick={handleStopScan}
//             variant="outline"
//             size="sm"
//             className="font-code"
//             disabled={!isScanningAll && scanningDevices.size === 0}
//           >
//             <Square className="h-4 w-4 mr-1" />
//             Stop All
//           </Button>
//           <Button
//             onClick={handleClearDevices}
//             variant="destructive"
//             size="sm"
//             className="font-code"
//           >
//             <Trash2 className="h-4 w-4 mr-1" />
//             Clear
//           </Button>
//           <Button
//             onClick={handleExportAll}
//             variant="outline"
//             size="sm"
//             className="font-code"
//           >
//             <Download className="h-4 w-4 mr-1" />
//             Export
//           </Button>
//         </div>
//       </div>

//       {/* Enhanced Statistics */}
//       <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
//         <Card className="bg-card/80 backdrop-blur-sm">
//           <CardContent className="p-4 text-center">
//             <div className="text-2xl font-orbitron font-bold text-primary mb-1">
//               {totalDevices}
//             </div>
//             <div className="text-xs font-code text-muted-foreground">
//               Total Devices
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-card/80 backdrop-blur-sm">
//           <CardContent className="p-4 text-center">
//             <div className="text-2xl font-orbitron font-bold text-green-500 mb-1">
//               {onlineDevices}
//             </div>
//             <div className="text-xs font-code text-muted-foreground">
//               Online
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-card/80 backdrop-blur-sm">
//           <CardContent className="p-4 text-center">
//             <div className="text-2xl font-orbitron font-bold text-red-500 mb-1">
//               {vulnerableDevices}
//             </div>
//             <div className="text-xs font-code text-muted-foreground">
//               Vulnerable
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-card/80 backdrop-blur-sm">
//           <CardContent className="p-4 text-center">
//             <div className="text-2xl font-orbitron font-bold text-cyan-500 mb-1">
//               {iotDevices.length}
//             </div>
//             <div className="text-xs font-code text-muted-foreground">
//               IoT Devices
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-card/80 backdrop-blur-sm">
//           <CardContent className="p-4 text-center">
//             <div className="text-2xl font-orbitron font-bold text-yellow-500 mb-1">
//               {criticalRiskDevices}
//             </div>
//             <div className="text-xs font-code text-muted-foreground">
//               Critical Risk
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="bg-card/80 backdrop-blur-sm">
//           <CardContent className="p-4 text-center">
//             <div className="text-2xl font-orbitron font-bold text-green-500 mb-1">
//               {fixedVulnerabilities}
//             </div>
//             <div className="text-xs font-code text-muted-foreground">
//               Fixed Vulns
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Vulnerability Management Summary */}
//       {(autoFixableVulnerabilities > 0 || manualVulnerabilities > 0 || nonFixableVulnerabilities > 0 || fixedVulnerabilities > 0) && (
//         <Card className="bg-card/80 backdrop-blur-sm">
//           <CardContent className="p-4">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               <div>
//                 <h3 className="font-orbitron font-bold text-primary mb-2">
//                   Vulnerability Management
//                 </h3>
//                 <div className="flex flex-wrap gap-4 text-sm font-code">
//                   <div className="flex items-center gap-2">
//                     <ShieldCheck className="h-4 w-4 text-green-500" />
//                     <span>Auto-fixable: {autoFixableVulnerabilities}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Wrench className="h-4 w-4 text-yellow-500" />
//                     <span>Manual: {manualVulnerabilities}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <ShieldAlert className="h-4 w-4 text-orange-500" />
//                     <span>Non-fixable: {nonFixableVulnerabilities}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <CheckCircle className="h-4 w-4 text-green-500" />
//                     <span>Fixed: {fixedVulnerabilities}</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   onClick={() => {
//                     alert(`Vulnerability Classification:\n\n` +
//                       `🟢 Auto-fixable: Vulnerabilities that can be automatically remediated\n` +
//                       `🟡 Manual: Vulnerabilities requiring manual intervention\n` +
//                       `🔴 Non-fixable: Vulnerabilities that cannot be fixed automatically\n\n` +
//                       `Click individual fix buttons to remediate vulnerabilities.`);
//                   }}
//                   variant="outline"
//                   size="sm"
//                   className="font-code"
//                 >
//                   <FileText className="h-4 w-4 mr-1" />
//                   Help
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Active Scans Progress */}
//       {Object.keys(scanProgress).length > 0 && (
//         <Card className="bg-card/80 backdrop-blur-sm border-yellow-500/50">
//           <CardContent className="p-4">
//             <h3 className="font-orbitron font-bold text-yellow-500 mb-3 flex items-center">
//               <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//               Active Scans ({Object.keys(scanProgress).length})
//             </h3>
//             <div className="space-y-3">
//               {Object.entries(scanProgress).map(([scanId, progress]) => (
//                 <div key={scanId} className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="font-medium">
//                       {scanId === 'deep_iot_scan' ? 'Deep IoT Scan' : `Device: ${scanId}`}
//                     </span>
//                     <span className="text-muted-foreground">{progress.progress}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="h-2 rounded-full bg-yellow-500 transition-all duration-300"
//                       style={{ width: `${progress.progress}%` }}
//                     ></div>
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     {progress.current_task}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Enhanced Filters */}
//       <Card className="bg-card/80 backdrop-blur-sm">
//         <CardContent className="p-4">
//           <div className="flex flex-col md:flex-row md:items-center gap-3">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search devices by name, IP, MAC, or vendor..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="pl-10 bg-input/50 border-border font-code"
//               />
//             </div>
//             <Select value={filterType} onValueChange={setFilterType}>
//               <SelectTrigger className="w-40 bg-input/50 border-border font-code">
//                 <SelectValue placeholder="Device Type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Types</SelectItem>
//                 <SelectItem value="computer">Computers</SelectItem>
//                 <SelectItem value="mobile">Mobile Devices</SelectItem>
//                 <SelectItem value="iot">IoT Devices</SelectItem>
//                 <SelectItem value="router">Network Equipment</SelectItem>
//                 <SelectItem value="printer">Printers</SelectItem>
//                 <SelectItem value="camera">Cameras</SelectItem>
//                 <SelectItem value="tv">TV & Media</SelectItem>
//                 <SelectItem value="other">Other</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select value={filterStatus} onValueChange={setFilterStatus}>
//               <SelectTrigger className="w-32 bg-input/50 border-border font-code">
//                 <SelectValue placeholder="Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="online">Online</SelectItem>
//                 <SelectItem value="offline">Offline</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Enhanced Device List */}
//       <Card className="bg-card/80 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="font-orbitron text-primary flex items-center">
//             <Monitor className="h-5 w-5 mr-2" />
//             Device Inventory ({filteredDevices.length})
//             {scanningDevices.size > 0 && (
//               <Badge variant="secondary" className="ml-2 font-code">
//                 Scanning: {scanningDevices.size}
//               </Badge>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {filteredDevices.map(device => {
//               const actualType = classifyDeviceType(device);
//               const DeviceIcon = getDeviceIcon(actualType);
//               const hasComprehensiveScan = device.comprehensive_vulnerabilities && device.comprehensive_vulnerabilities.length > 0;
//               const vulnerabilities = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
//               const isIoTDevice = actualType === 'iot';
//               const autoFixableVulns = vulnerabilities.filter(v => 
//                 v.category === 'auto-fixable' && v.status !== 'fixed'
//               );
//               const manualVulns = vulnerabilities.filter(v => 
//                 v.category === 'manual' && v.status !== 'fixed'
//               );
//               const currentScanProgress = scanProgress[device.id];
              
//               return (
//                 <div
//                   key={device.id}
//                   className={`p-4 rounded-lg border transition-colors ${
//                     isIoTDevice 
//                       ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30' 
//                       : 'bg-card/30 hover:bg-card/50 border-border'
//                   } ${device.riskLevel === 'critical' ? 'border-red-500/50 bg-red-500/5' : ''}`}
//                 >
//                   <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
//                     <div className="flex items-start space-x-4 flex-1">
//                       <DeviceIcon className={`h-7 w-7 mt-1 ${
//                         isIoTDevice ? 'text-cyan-500' : 'text-primary'
//                       }`} />
//                       <div className="space-y-2 flex-1">
//                         <div className="flex flex-wrap items-center gap-2">
//                           <h3 className="font-semibold text-foreground">
//                             {device.name}
//                           </h3>
//                           <Badge
//                             variant={
//                               device.status === 'online'
//                                 ? 'success'
//                                 : 'secondary'
//                             }
//                             className="font-code text-2xs"
//                           >
//                             {device.status.toUpperCase()}
//                           </Badge>
//                           <Badge
//                             variant={getRiskBadge(device.riskLevel)}
//                             className="font-code text-2xs"
//                           >
//                             {device.riskLevel.toUpperCase()} RISK
//                           </Badge>
//                           {isIoTDevice && (
//                             <Badge variant="outline" className="font-code text-2xs bg-cyan-500/20 text-cyan-500 border-cyan-500/50">
//                               IoT
//                             </Badge>
//                           )}
//                           {hasComprehensiveScan && (
//                             <Badge variant="success" className="font-code text-2xs">
//                               COMPREHENSIVE SCAN
//                             </Badge>
//                           )}
//                           {device.last_scanned && (
//                             <Badge variant="outline" className="font-code text-2xs">
//                               Scanned: {new Date(device.last_scanned).toLocaleDateString()}
//                             </Badge>
//                           )}
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-code text-muted-foreground">
//                           <div>IP: {device.ip}</div>
//                           <div>MAC: {device.mac}</div>
//                           <div>Vendor: {device.vendor}</div>
//                           <div>Last Seen: {device.lastSeen}</div>
//                         </div>
                        
//                         {/* Scan Progress */}
//                         {currentScanProgress && (
//                           <div className="mt-2">
//                             <div className="flex items-center justify-between text-xs font-code">
//                               <span className="text-muted-foreground">
//                                 {currentScanProgress.current_task}
//                               </span>
//                               <span>{currentScanProgress.progress}%</span>
//                             </div>
//                             <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
//                               <div 
//                                 className={`h-1.5 rounded-full ${
//                                   currentScanProgress.status === 'completed' ? 'bg-green-500' :
//                                   currentScanProgress.status === 'failed' ? 'bg-red-500' :
//                                   'bg-blue-500'
//                                 }`}
//                                 style={{ width: `${currentScanProgress.progress}%` }}
//                               ></div>
//                             </div>
//                           </div>
//                         )}

//                         {/* Enhanced Vulnerabilities Display */}
//                         {vulnerabilities.length > 0 && (
//                           <div className="text-xs space-y-2 mt-3">
//                             <div className="flex items-center justify-between">
//                               <span className="font-semibold text-foreground">
//                                 Vulnerabilities ({vulnerabilities.length})
//                               </span>
//                               <div className="flex gap-2 text-2xs">
//                                 {autoFixableVulns.length > 0 && (
//                                   <span className="text-green-500">
//                                     {autoFixableVulns.length} auto-fixable
//                                   </span>
//                                 )}
//                                 {manualVulns.length > 0 && (
//                                   <span className="text-yellow-500">
//                                     {manualVulns.length} manual
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
                            
//                             {vulnerabilities.slice(0, 3).map((vuln, index) => (
//                               <div
//                                 key={vuln.id || `vuln-${index}`}
//                                 className="flex items-center justify-between p-2 bg-background/50 rounded border"
//                               >
//                                 <div className="flex items-center space-x-2 flex-1">
//                                   {getStatusIcon(vuln.status || 'found')}
//                                   <span className={`font-code ${getSeverityColor(vuln.severity)}`}>
//                                     {vuln.severity?.toUpperCase()}: 
//                                   </span>
//                                   <span className="flex-1 truncate">
//                                     {vuln.name || vuln.description}
//                                   </span>
//                                   {vuln.category && (
//                                     <Badge 
//                                       variant={getVulnerabilityBadge(vuln.category)} 
//                                       className="text-2xs whitespace-nowrap"
//                                     >
//                                       {vuln.category}
//                                     </Badge>
//                                   )}
//                                 </div>
//                                 {/* Individual Fix Button */}
//                                 {vuln.category === 'auto-fixable' && vuln.status !== 'fixed' && (
//                                   <Button
//                                     onClick={() => handleFixVulnerability(vuln.id, device.id)}
//                                     variant="outline"
//                                     size="sm"
//                                     className="h-6 text-2xs ml-2"
//                                     disabled={fixingVulnerabilities.has(vuln.id)}
//                                   >
//                                     {fixingVulnerabilities.has(vuln.id) ? (
//                                       <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                                     ) : (
//                                       <Wrench className="h-3 w-3 mr-1" />
//                                     )}
//                                     Fix
//                                   </Button>
//                                 )}
//                                 {vuln.category === 'manual' && vuln.status !== 'fixed' && (
//                                   <Button
//                                     onClick={() => {
//                                       if (vuln.manual_steps) {
//                                         const steps = Array.isArray(vuln.manual_steps) 
//                                           ? vuln.manual_steps.join('\n\n• ')
//                                           : vuln.manual_steps;
//                                         alert(`🔧 Manual Fix Required\n\n${vuln.fix_method || 'Follow these steps:'}\n\n• ${steps}`);
//                                       } else {
//                                         alert('Manual intervention required for this vulnerability. No specific steps provided.');
//                                       }
//                                     }}
//                                     variant="outline"
//                                     size="sm"
//                                     className="h-6 text-2xs ml-2 bg-yellow-500/20 hover:bg-yellow-500/30"
//                                   >
//                                     <Settings className="h-3 w-3 mr-1" />
//                                     Manual
//                                   </Button>
//                                 )}
//                               </div>
//                             ))}
                            
//                             {vulnerabilities.length > 3 && (
//                               <div className="text-muted-foreground font-code text-center">
//                                 +{vulnerabilities.length - 3} more vulnerabilities...
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* Action Buttons */}
//                     <div className="flex flex-wrap gap-2">
//                       {/* Scan Button */}
//                       <Button
//                         onClick={() => handleScanDevice(device.id)}
//                         variant="outline"
//                         size="sm"
//                         className="font-code"
//                         disabled={scanningDevices.has(device.id)}
//                       >
//                         {scanningDevices.has(device.id) ? (
//                           <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                         ) : (
//                           <Scan className="h-3 w-3 mr-1" />
//                         )}
//                         {scanningDevices.has(device.id) ? 'Scanning' : 'Scan'}
//                       </Button>
                      
//                       {/* Auto-Fix All Button */}
//                       {autoFixableVulns.length > 0 && (
//                         <Button
//                           onClick={() => handleBatchFix(device.id, autoFixableVulns.map(v => v.id))}
//                           variant="default"
//                           size="sm"
//                           className="font-code bg-green-600 hover:bg-green-700"
//                           disabled={fixingDevices.has(device.id)}
//                         >
//                           {fixingDevices.has(device.id) ? (
//                             <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                           ) : (
//                             <ShieldCheck className="h-3 w-3 mr-1" />
//                           )}
//                           Fix All ({autoFixableVulns.length})
//                         </Button>
//                       )}
                      
//                       {/* Legacy Auto-Fix Button */}
//                       {vulnerabilities.length > 0 && (
//                         <Button
//                           onClick={() => handleAutoFix(device.id)}
//                           variant="outline"
//                           size="sm"
//                           className="font-code"
//                           disabled={fixingDevices.has(device.id)}
//                         >
//                           {fixingDevices.has(device.id) ? (
//                             <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                           ) : (
//                             <Shield className="h-3 w-3 mr-1" />
//                           )}
//                           Auto-Fix All
//                         </Button>
//                       )}
                      
//                       {/* Report Button */}
//                       <Button
//                         onClick={() => handleGetVulnerabilityReport(device.id)}
//                         variant="outline"
//                         size="sm"
//                         className="font-code"
//                       >
//                         <FileText className="h-3 w-3 mr-1" />
//                         Report
//                       </Button>

//                       {/* PDF Export Button */}
//                       <Button
//                         onClick={() => handleExportPDF(device.id)}
//                         variant="outline"
//                         size="sm"
//                         className="font-code"
//                       >
//                         <Download className="h-3 w-3 mr-1" />
//                         PDF
//                       </Button>
                      
//                       {/* Info Button */}
//                       <Button
//                         onClick={() => handleInfoDevice(device)}
//                         variant="outline"
//                         size="sm"
//                         className="font-code"
//                       >
//                         <Info className="h-3 w-3 mr-1" />
//                         Info
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
            
//             {filteredDevices.length === 0 && (
//               <div className="text-center py-8 text-muted-foreground font-code">
//                 {devices.length === 0 ? 'No devices found. Click "Discover Devices" to start scanning.' : 'No devices match your filters.'}
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Enhanced Info Modal */}
//       {showInfoModal && selectedDevice && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//           <div className="bg-card text-foreground rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
//             <div className="flex items-center justify-between p-6 border-b border-border">
//               <h2 className="text-xl font-orbitron font-bold">
//                 Device Details: {selectedDevice.name} ({selectedDevice.ip})
//               </h2>
//               <button
//                 onClick={() => setShowInfoModal(false)}
//                 className="text-muted-foreground hover:text-foreground p-1"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6">
//               {/* Device Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-code text-sm mb-6">
//                 <div className="space-y-2">
//                   <div><span className="font-semibold">IP Address:</span> {selectedDevice.ip}</div>
//                   <div><span className="font-semibold">MAC Address:</span> {selectedDevice.mac}</div>
//                   <div><span className="font-semibold">Vendor:</span> {selectedDevice.vendor}</div>
//                 </div>
//                 <div className="space-y-2">
//                   <div><span className="font-semibold">Type:</span> {classifyDeviceType(selectedDevice)}</div>
//                   <div><span className="font-semibold">Status:</span> 
//                     <Badge variant={selectedDevice.status === 'online' ? 'success' : 'secondary'} className="ml-2 text-2xs">
//                       {selectedDevice.status.toUpperCase()}
//                     </Badge>
//                   </div>
//                   <div><span className="font-semibold">Risk Level:</span>
//                     <Badge variant={getRiskBadge(selectedDevice.riskLevel)} className="ml-2 text-2xs">
//                       {selectedDevice.riskLevel.toUpperCase()}
//                     </Badge>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <div><span className="font-semibold">Last Seen:</span> {selectedDevice.lastSeen}</div>
//                   {selectedDevice.last_scanned && (
//                     <div><span className="font-semibold">Last Scanned:</span> {selectedDevice.last_scanned}</div>
//                   )}
//                   {selectedDevice.os && (
//                     <div><span className="font-semibold">Operating System:</span> {selectedDevice.os}</div>
//                   )}
//                 </div>
//               </div>

//               {/* Enhanced Vulnerabilities Display */}
//               {selectedDevice.comprehensive_vulnerabilities && selectedDevice.comprehensive_vulnerabilities.length > 0 ? (
//                 <div className="mt-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-orbitron font-bold text-primary">
//                       Detected Vulnerabilities ({selectedDevice.comprehensive_vulnerabilities.length})
//                     </h3>
//                     <div className="flex gap-2">
//                       <Button
//                         onClick={() => {
//                           const autoFixableVulns = selectedDevice.comprehensive_vulnerabilities?.filter(v => 
//                             v.category === 'auto-fixable' && v.status !== 'fixed'
//                           ) || [];
//                           if (autoFixableVulns.length > 0) {
//                             handleBatchFix(selectedDevice.id, autoFixableVulns.map(v => v.id));
//                           }
//                         }}
//                         variant="default"
//                         size="sm"
//                         className="font-code bg-green-600 hover:bg-green-700"
//                         disabled={fixingDevices.has(selectedDevice.id)}
//                       >
//                         {fixingDevices.has(selectedDevice.id) ? (
//                           <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                         ) : (
//                           <ShieldCheck className="h-3 w-3 mr-1" />
//                         )}
//                         Fix All Auto-Fixable
//                       </Button>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-3 max-h-96 overflow-y-auto">
//                     {selectedDevice.comprehensive_vulnerabilities.map((vuln, index) => (
//                       <div
//                         key={vuln.id || `modal-vuln-${index}`}
//                         className="p-4 rounded border border-border bg-card/30 space-y-3"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex items-start space-x-3 flex-1">
//                             {getStatusIcon(vuln.status || 'found')}
//                             <div className="flex-1">
//                               <div className="flex items-center space-x-2 mb-1">
//                                 <span className="font-code font-semibold text-foreground">
//                                   {vuln.name || vuln.id}
//                                 </span>
//                                 <Badge variant={getRiskBadge(vuln.severity)} className="text-2xs">
//                                   {vuln.severity?.toUpperCase()}
//                                 </Badge>
//                                 {vuln.category && (
//                                   <Badge variant={getVulnerabilityBadge(vuln.category)} className="text-2xs">
//                                     {vuln.category}
//                                   </Badge>
//                                 )}
//                                 {vuln.cve_id && (
//                                   <Badge variant="outline" className="text-2xs">
//                                     {vuln.cve_id}
//                                   </Badge>
//                                 )}
//                               </div>
//                               <div className="font-code text-sm text-muted-foreground mb-2">
//                                 {vuln.description}
//                               </div>
//                             </div>
//                           </div>
                          
//                           {/* Fix Button in Modal */}
//                           {(vuln.category === 'auto-fixable' && vuln.status !== 'fixed') && (
//                             <Button
//                               onClick={() => handleFixVulnerability(vuln.id, selectedDevice.id)}
//                               variant="outline"
//                               size="sm"
//                               className="ml-2 flex-shrink-0"
//                               disabled={fixingVulnerabilities.has(vuln.id)}
//                             >
//                               {fixingVulnerabilities.has(vuln.id) ? (
//                                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                               ) : (
//                                 <Wrench className="h-3 w-3 mr-1" />
//                               )}
//                               Fix
//                             </Button>
//                           )}
//                           {(vuln.category === 'manual' && vuln.status !== 'fixed') && (
//                             <Button
//                               onClick={() => {
//                                 if (vuln.manual_steps) {
//                                   const steps = Array.isArray(vuln.manual_steps) 
//                                     ? vuln.manual_steps.join('\n\n• ')
//                                     : vuln.manual_steps;
//                                   alert(`🔧 Manual Fix Required\n\n${vuln.fix_method || 'Follow these steps:'}\n\n• ${steps}`);
//                                 }
//                               }}
//                               variant="outline"
//                               size="sm"
//                               className="ml-2 flex-shrink-0 bg-yellow-500/20 hover:bg-yellow-500/30"
//                             >
//                               <Settings className="h-3 w-3 mr-1" />
//                               Manual Steps
//                             </Button>
//                           )}
//                           {vuln.status === 'fixed' && (
//                             <Badge variant="success" className="ml-2 flex-shrink-0">
//                               FIXED
//                             </Badge>
//                           )}
//                         </div>
                        
//                         {/* Vulnerability Details */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-code">
//                           {vuln.fix_method && (
//                             <div>
//                               <span className="font-semibold">Fix Method:</span> {vuln.fix_method}
//                             </div>
//                           )}
//                           {vuln.port && (
//                             <div>
//                               <span className="font-semibold">Affected Port:</span> {vuln.port}
//                             </div>
//                           )}
//                           {vuln.service && (
//                             <div>
//                               <span className="font-semibold">Service:</span> {vuln.service}
//                             </div>
//                           )}
//                           {vuln.potential_harm && (
//                             <div className="md:col-span-2">
//                               <span className="font-semibold text-red-500">Risk:</span> {vuln.potential_harm}
//                             </div>
//                           )}
//                         </div>
                        
//                         {/* Fix Commands */}
//                         {vuln.fix_commands && vuln.fix_commands.length > 0 && (
//                           <div className="text-xs">
//                             <div className="font-semibold mb-1">Fix Commands:</div>
//                             <div className="bg-muted p-2 rounded space-y-1">
//                               {vuln.fix_commands.map((cmd, cmdIndex) => (
//                                 <div key={cmdIndex} className="font-mono text-2xs">
//                                   {cmd}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
                        
//                         {/* Status and Timestamps */}
//                         <div className="flex justify-between items-center text-xs text-muted-foreground">
//                           <div>
//                             <span className="font-semibold">Detected:</span> {vuln.detected_at || 'Unknown'}
//                           </div>
//                           {vuln.fixed_at && (
//                             <div>
//                               <span className="font-semibold">Fixed:</span> {vuln.fixed_at}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : selectedDevice.vulnerabilities && selectedDevice.vulnerabilities.length > 0 ? (
//                 <div className="mt-6">
//                   <h3 className="text-lg font-orbitron font-bold text-destructive mb-4">
//                     Basic Vulnerabilities ({selectedDevice.vulnerabilities.length})
//                   </h3>
//                   <div className="space-y-2 max-h-60 overflow-y-auto">
//                     {selectedDevice.vulnerabilities.map(vuln => (
//                       <div
//                         key={vuln.id}
//                         className="p-3 rounded border border-border bg-card/30 space-y-1"
//                       >
//                         <div className="flex items-center space-x-2">
//                           <AlertTriangle className="h-4 w-4 text-warning" />
//                           <span className="font-code text-sm text-warning">
//                             {vuln.id} – {vuln.severity.toUpperCase()}
//                           </span>
//                         </div>
//                         <div className="font-code text-xs text-muted-foreground">
//                           {vuln.description}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-success font-code">
//                   <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
//                   <div>No vulnerabilities detected.</div>
//                   <div className="text-muted-foreground text-sm mt-1">This device appears to be secure.</div>
//                 </div>
//               )}
//             </div>

//             {/* Modal Footer */}
//             <div className="flex justify-between items-center p-6 border-t border-border bg-card/50">
//               <div className="text-xs font-code text-muted-foreground">
//                 Device ID: {selectedDevice.id}
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   onClick={() => handleGetVulnerabilityReport(selectedDevice.id)}
//                   variant="outline"
//                   size="sm"
//                   className="font-code"
//                 >
//                   <FileText className="h-4 w-4 mr-1" /> Detailed Report
//                 </Button>
//                 <Button
//                   onClick={() => handleExportPDF(selectedDevice.id)}
//                   variant="outline"
//                   size="sm"
//                   className="font-code"
//                 >
//                   <Download className="h-4 w-4 mr-1" /> Export PDF
//                 </Button>
//                 <Button
//                   onClick={() => setShowInfoModal(false)}
//                   variant="destructive"
//                   size="sm"
//                   className="font-code"
//                 >
//                   Close
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




















import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Monitor,
  Smartphone,
  Printer,
  Camera,
  Tv,
  Laptop,
  AlertTriangle,
  Scan,
  Download,
  RefreshCw,
  Search,
  Zap,
  Trash2,
  Info,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Wrench,
  CheckCircle,
  XOctagon,
  Clock,
  Play,
  Square,
  Loader2,
  AlertCircle,
  Settings,
  Network,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import io from 'socket.io-client';

// Enhanced Type Definitions
interface Vulnerability {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
  vulnerability_number?: number;
  name?: string;
  category?: 'auto-fixable' | 'manual' | 'non-fixable';
  fix_method?: string;
  fix_commands?: string[];
  manual_steps?: string[];
  potential_harm?: string;
  status?: 'found' | 'fixed' | 'fix_failed' | 'in_progress';
  detected_at?: string;
  fixed_at?: string;
  cve_id?: string;
  port?: number;
  service?: string;
}

interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: string;
  vendor: string;
  status: 'online' | 'offline';
  authorized?: boolean;
  lastSeen: string;
  vulnerabilities: Vulnerability[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  comprehensive_vulnerabilities?: Vulnerability[];
  last_scanned?: string;
  fix_results?: any;
  os?: string;
  open_ports?: number[];
  services?: string[];
  hostname?: string;
}

interface ScanStatus {
  [key: string]: {
    progress: number;
    status: string;
    current_task: string;
    started_at: string;
    type: string;
  };
}

interface FixStatus {
  [key: string]: boolean;
}

// WebSocket event types
interface SocketEvent {
  type: string;
  data: any;
}

export default function DevicesPanel() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [selectedSubnet, setSelectedSubnet] = useState<string>('auto');
  const [scanningDevices, setScanningDevices] = useState<Set<string>>(new Set());
  const [fixingDevices, setFixingDevices] = useState<Set<string>>(new Set());
  const [fixingVulnerabilities, setFixingVulnerabilities] = useState<Set<string>>(new Set());
  const [scanProgress, setScanProgress] = useState<ScanStatus>({});
  const [fixProgress, setFixProgress] = useState<FixStatus>({});
  
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pollTimer, setPollTimer] = useState<number | null>(null);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const s = io('http://127.0.0.1:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });
    
    s.on('connect', () => {
      console.log('✅ Socket.IO connected for devices');
      setIsConnected(true);
    });
    
    s.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    const eventNames = [
      'device_scan_started',
      'device_scan_progress',
      'device_scan_completed',
      'device_scan_failed',
      'deep_scan_started',
      'deep_scan_progress',
      'deep_scan_completed',
      'all_scans_stopped',
      'device_fix_started',
      'device_fix_completed',
      'vulnerability_fix_started',
      'vulnerability_fix_completed',
      'device_removed',
      'device_authorized',
      'device_unauthorized'
    ];

    eventNames.forEach(evt => {
      s.on(evt, (data: any) => {
        handleSocketEvent({ type: evt, data });
      });
    });
    
    setSocket(s);
    
    return () => {
      s.disconnect();
    };
  }, []);

  // Handle real-time WebSocket events
  const handleSocketEvent = useCallback((event: SocketEvent) => {
    switch (event.type) {
      case 'device_scan_started':
        toast.info(`Scan started for device`);
        setScanningDevices(prev => new Set(prev).add(event.data.device_id));
        break;
        
      case 'device_scan_progress':
        setScanProgress(prev => ({
          ...prev,
          [event.data.device_id]: {
            progress: event.data.progress || 50,
            status: event.data.status || 'scanning',
            current_task: event.data.current_task || 'Scanning vulnerabilities',
            started_at: new Date().toISOString(),
            type: 'device_scan'
          }
        }));
        break;
        
      case 'device_scan_completed':
        toast.success(`Scan completed: ${event.data.vulnerabilities_found} vulnerabilities found`);
        setScanningDevices(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.data.device_id);
          return newSet;
        });
        setScanProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[event.data.device_id];
          return newProgress;
        });
        fetchDevices();
        break;
        
      case 'device_scan_failed':
        toast.error(`Scan failed: ${event.data.message}`);
        setScanningDevices(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.data.device_id);
          return newSet;
        });
        break;
        
      case 'deep_scan_started':
        toast.info('Deep IoT vulnerability scan started');
        setIsScanningAll(true);
        break;
        
      case 'deep_scan_progress':
        setScanProgress(prev => ({
          ...prev,
          'deep_iot_scan': {
            progress: event.data.progress || 30,
            status: 'scanning',
            current_task: `Scanning IoT devices (${event.data.devices_scanned || 0}/${event.data.total_devices || 0})`,
            started_at: new Date().toISOString(),
            type: 'iot_scan'
          }
        }));
        break;
        
      case 'deep_scan_completed':
        toast.success(`Deep IoT scan completed: ${event.data.total_vulnerabilities_found} vulnerabilities found across ${event.data.total_devices_scanned} devices`);
        setIsScanningAll(false);
        setScanProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress['deep_iot_scan'];
          return newProgress;
        });
        fetchDevices();
        break;
        
      case 'vulnerability_fix_attempt':
        if (event.data.status === 'success') {
          toast.success(`Vulnerability fixed: ${event.data.message}`);
        } else {
          toast.error(`Fix failed: ${event.data.message}`);
        }
        setFixingVulnerabilities(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.data.vulnerability_id);
          return newSet;
        });
        setTimeout(() => fetchDevices(), 1000);
        break;
        
      case 'all_scans_stopped':
        toast.info(`All scans stopped`);
        setIsScanningAll(false);
        setScanningDevices(new Set());
        setScanProgress({});
        break;
        
      default:
        console.log('Unhandled WebSocket event:', event);
    }
  }, []);

  // Load devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Poll scan status regularly to prevent UI from getting stuck (fallback when Socket.IO is unavailable)
  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:5000/api/dp/devices/scan-status');
        if (!resp.ok) return;
        const data = await resp.json();
        const active = data.active_scans || {};
        setScanProgress(active);
        // If IoT batch scan finished, clear scanning flag
        if (!('iot_batch_scan' in active) && !('deep_iot_scan' in active)) {
          setIsScanningAll(false);
        }
      } catch (e) {
        // ignore polling errors
      }
    };

    const shouldPoll = isScanningAll || scanningDevices.size > 0 || Object.keys(scanProgress).length > 0;
    if (shouldPoll && pollTimer === null) {
      const id = window.setInterval(poll, 2000);
      setPollTimer(id);
    }
    if (!shouldPoll && pollTimer !== null) {
      window.clearInterval(pollTimer);
      setPollTimer(null);
    }

    return () => {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanningAll, scanningDevices, scanProgress, pollTimer]);

  // Fetch devices from backend
  const fetchDevices = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/dp/devices/scan-network');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setDevices(data.devices || data.data || data || []);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      toast.error('Failed to fetch devices. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Device discovery scan
  const handleScanAll = async (): Promise<void> => {
    setIsScanningAll(true);
    toast.info('Starting REAL network device discovery...');
    
    try {
      let url = 'http://127.0.0.1:5000/api/dp/devices/scan-network';
      if (selectedSubnet && selectedSubnet !== 'auto') {
        url += `?subnet=${encodeURIComponent(selectedSubnet)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setDevices(data.devices || data.data || data || []);
      toast.success(`Found ${data.devices?.length || data.data?.length || data?.length || 0} REAL devices`);
    } catch (err) {
      toast.error('Network scan failed. Check backend connection.');
      console.error('Scan error:', err);
    } finally {
      setIsScanningAll(false);
    }
  };

  // Deep IoT vulnerability scan
  const handleScanIoTNetwork = async (): Promise<void> => {
    setIsScanningAll(true);
    toast.info('Starting comprehensive IoT vulnerability scan...');
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/dp/devices/iot/scan-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('IoT vulnerability scan started successfully');
      } else {
        toast.error(`IoT scan failed: ${data.message}`);
        setIsScanningAll(false);
      }
    } catch (err) {
      toast.error('Failed to start IoT vulnerability scan');
      console.error('IoT scan error:', err);
      setIsScanningAll(false);
    }
  };

  // Individual device vulnerability scan
  const handleScanDevice = async (deviceId: string): Promise<void> => {
    setScanningDevices(prev => new Set(prev).add(deviceId));
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/dp/devices/${deviceId}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.status === 'success' || data.vulnerabilities_found !== undefined) {
        toast.success(`Vulnerability scan started for device`);
      } else {
        toast.error(`Device scan failed: ${data.message || 'Unknown error'}`);
        setScanningDevices(prev => {
          const newSet = new Set(prev);
          newSet.delete(deviceId);
          return newSet;
        });
      }
    } catch (err) {
      toast.error('Failed to scan device');
      console.error('Device scan error:', err);
      setScanningDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(deviceId);
        return newSet;
      });
    }
  };

  // Stop all scans
  const handleStopScan = async (): Promise<void> => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/dp/devices/stop-scan', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      toast.success(data.message || 'All scans stopped successfully');
      
      // Update local state
      setIsScanningAll(false);
      setScanningDevices(new Set());
      setScanProgress({});
    } catch (err) {
      toast.error('Failed to stop scans');
      console.error('Stop scan error:', err);
    }
  };

  // Fix individual vulnerability
  const handleFixVulnerability = async (vulnerabilityId: string, deviceId: string): Promise<void> => {
    setFixingVulnerabilities(prev => new Set(prev).add(vulnerabilityId));
    
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) {
        toast.error('Device not found');
        return;
      }

      const response = await fetch(`http://127.0.0.1:5000/api/dp/devices/vulnerabilities/${encodeURIComponent(vulnerabilityId)}/fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: deviceId
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (result.status === 'success') {
        toast.success('Vulnerability fix initiated successfully');
      } else if (result.status === 'non_fixable') {
        toast.warning('This vulnerability requires manual intervention', {
          description: result.message,
          duration: 8000
        });
        if (result.manual_steps) {
          const steps = Array.isArray(result.manual_steps) ? result.manual_steps.join('\n\n• ') : result.manual_steps;
          alert(`🔧 Manual Fix Required\n\n${result.fix_method || 'Follow these steps:'}\n\n• ${steps}`);
        }
      } else {
        toast.error(`Fix failed: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error('Failed to fix vulnerability');
      console.error('Fix vulnerability error:', err);
    } finally {
      setTimeout(() => {
        setFixingVulnerabilities(prev => {
          const newSet = new Set(prev);
          newSet.delete(vulnerabilityId);
          return newSet;
        });
        fetchDevices();
      }, 1500);
    }
  };



  // Batch fix all auto-fixable vulnerabilities on a device
  const handleBatchFix = async (deviceId: string): Promise<void> => {
    setFixingDevices(prev => new Set(prev).add(deviceId));
    
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device || !device.ip) {
        toast.error('Device not found or missing IP address');
        return;
      }

      const vulnerabilities = device.comprehensive_vulnerabilities || [];
      const autoFixableVulns = vulnerabilities.filter(v => 
        v.category === 'auto-fixable' && v.status !== 'fixed'
      );

      if (autoFixableVulns.length === 0) {
        toast.info('No auto-fixable vulnerabilities found');
        return;
      }

      const response = await fetch(`http://127.0.0.1:5000/api/dp/devices/${deviceId}/auto-fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (result.status === 'success') {
        const summary = result.fix_summary;
        toast.success(
          `Auto-fix completed: ${summary.successful_fixes} fixed, ${summary.failed_fixes} failed`
        );
      } else {
        toast.error(`Batch fix failed: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error('Failed to execute batch fix');
      console.error('Batch fix error:', err);
    } finally {
      setFixingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(deviceId);
        return newSet;
      });
      setTimeout(() => fetchDevices(), 2000);
    }
  };

  // Auto-fix all vulnerabilities on device
  const handleAutoFix = async (deviceId: string): Promise<void> => {
    setFixingDevices(prev => new Set(prev).add(deviceId));
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/dp/devices/${deviceId}/auto-fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (result.status === 'success') {
        const summary = result.fix_summary;
        toast.success(
          `Auto-fix completed: ${summary.successful_fixes} fixed, ${summary.failed_fixes} failed, ${summary.non_fixable} non-fixable`
        );
      } else {
        toast.error(`Auto-fix failed: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error('Failed to execute auto-fix');
      console.error('Auto-fix error:', err);
    } finally {
      setFixingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(deviceId);
        return newSet;
      });
      setTimeout(() => fetchDevices(), 2000);
    }
  };

  // Get device info for modal
  const handleInfoDevice = async (device: Device): Promise<void> => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/dp/devices/${device.id}/info`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const info = await response.json();
      setSelectedDevice(info);
      setShowInfoModal(true);
    } catch (err) {
      // If info endpoint fails, use the device data we have
      setSelectedDevice(device);
      setShowInfoModal(true);
    }
  };

  // Generate vulnerability report
  const handleGetVulnerabilityReport = async (deviceId: string): Promise<void> => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) {
        toast.error('Device not found');
        return;
      }

      toast.info('Generating comprehensive vulnerability report...');
      
      // Create report from device data
      const vulnerabilities = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
      const autoFixable = vulnerabilities.filter(v => v.category === 'auto-fixable').length;
      const manual = vulnerabilities.filter(v => v.category === 'manual').length;
      const nonFixable = vulnerabilities.filter(v => v.category === 'non-fixable').length;
      const fixed = vulnerabilities.filter(v => v.status === 'fixed').length;
      
      let reportText = `=== COMPREHENSIVE VULNERABILITY REPORT ===\n\n`;
      reportText += `Device: ${device.name}\n`;
      reportText += `IP: ${device.ip}\n`;
      reportText += `MAC: ${device.mac}\n`;
      reportText += `Type: ${device.type}\n`;
      reportText += `Vendor: ${device.vendor}\n`;
      reportText += `Risk Level: ${device.riskLevel.toUpperCase()}\n`;
      reportText += `Scan Date: ${device.last_scanned || new Date().toISOString()}\n`;
      reportText += `Total Vulnerabilities: ${vulnerabilities.length}\n\n`;
      
      reportText += "VULNERABILITY SUMMARY:\n";
      reportText += "=".repeat(50) + "\n";
      reportText += `Auto-fixable: ${autoFixable}\n`;
      reportText += `Manual: ${manual}\n`;
      reportText += `Non-fixable: ${nonFixable}\n`;
      reportText += `Already Fixed: ${fixed}\n\n`;
      
      if (vulnerabilities.length > 0) {
        reportText += "DETAILED VULNERABILITIES:\n";
        reportText += "=".repeat(50) + "\n";
        
        vulnerabilities.forEach((vuln, index) => {
          reportText += `\n${index + 1}. ${vuln.name || vuln.id}\n`;
          reportText += `   Severity: ${vuln.severity?.toUpperCase()}\n`;
          reportText += `   Category: ${vuln.category || 'unknown'}\n`;
          reportText += `   Status: ${vuln.status || 'found'}\n`;
          reportText += `   Description: ${vuln.description}\n`;
          
          if (vuln.fix_method) {
            reportText += `   Fix Method: ${vuln.fix_method}\n`;
          }
          
          if (vuln.manual_steps && Array.isArray(vuln.manual_steps)) {
            reportText += `   Manual Steps:\n`;
            vuln.manual_steps.forEach((step, stepIndex) => {
              reportText += `     ${stepIndex + 1}. ${step}\n`;
            });
          }
          
          if (vuln.potential_harm) {
            reportText += `   Potential Harm: ${vuln.potential_harm}\n`;
          }
          
          if (vuln.port) {
            reportText += `   Affected Port: ${vuln.port}\n`;
          }
          
          reportText += `   Detected: ${vuln.detected_at || 'Unknown'}\n`;
          if (vuln.fixed_at) {
            reportText += `   Fixed: ${vuln.fixed_at}\n`;
          }
          reportText += "-".repeat(40) + "\n";
        });
      } else {
        reportText += "No vulnerabilities found. Device appears to be secure.\n";
      }
      
      // Create downloadable report
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vulnerability-report-${device.name}-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Vulnerability report downloaded');
    } catch (err) {
      toast.error('Failed to generate vulnerability report');
      console.error('Report generation error:', err);
    }
  };

  // Clear all devices
  const handleClearDevices = async (): Promise<void> => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/dp/devices/clear', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      setDevices([]);
      toast.success('Devices cleared from memory');
    } catch (err) {
      toast.error('Failed to clear devices');
      console.error('Clear devices error:', err);
    }
  };

  // Export all devices report
  const handleExportAll = async (): Promise<void> => {
    toast.info('Generating comprehensive network report...');
    try {
      let reportText = `=== NETWORK SECURITY REPORT ===\n\n`;
      reportText += `Generated: ${new Date().toISOString()}\n`;
      reportText += `Total Devices: ${devices.length}\n\n`;
      
      reportText += "DEVICE SUMMARY:\n";
      reportText += "=".repeat(50) + "\n";
      
      devices.forEach((device, index) => {
        const vulnerabilities = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
        reportText += `\n${index + 1}. ${device.name} (${device.ip})\n`;
        reportText += `   Type: ${device.type}\n`;
        reportText += `   Vendor: ${device.vendor}\n`;
        reportText += `   Risk Level: ${device.riskLevel}\n`;
        reportText += `   Vulnerabilities: ${vulnerabilities.length}\n`;
      });
      
      // Create downloadable report
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `network-security-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Comprehensive report downloaded');
    } catch (err) {
      toast.error('Report export failed');
      console.error('Export error:', err);
    }
  };

  // Utility functions
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'computer': return Laptop;
      case 'mobile': return Smartphone;
      case 'printer': return Printer;
      case 'camera': return Camera;
      case 'tv': return Tv;
      case 'router': return Monitor;
      case 'iot': return Radio;
      default: return Monitor;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'success';
      default: return 'outline';
    }
  };

  const getVulnerabilityBadge = (category?: string) => {
    switch (category) {
      case 'auto-fixable': return 'success';
      case 'manual': return 'warning';
      case 'non-fixable': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'fixed': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'fix_failed': return <XOctagon className="h-3 w-3 text-red-500" />;
      case 'in_progress': return <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />;
      default: return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  // Enhanced device classification
  const classifyDeviceType = (device: Device): string => {
    if (device.type && device.type !== 'unknown') return device.type;
    
    const vendorLower = (device.vendor || '').toLowerCase();
    const nameLower = (device.name || '').toLowerCase();

    // IoT devices
    if (
      vendorLower.includes('hue') ||
      vendorLower.includes('philips') ||
      vendorLower.includes('sonos') ||
      vendorLower.includes('nest') ||
      vendorLower.includes('tplink') ||
      vendorLower.includes('tp-link') ||
      vendorLower.includes('smart') ||
      vendorLower.includes('iot') ||
      nameLower.includes('iot') ||
      nameLower.includes('sensor') ||
      nameLower.includes('smart') ||
      (nameLower.includes('camera') && !nameLower.includes('webcam')) ||
      nameLower.includes('thermostat') ||
      nameLower.includes('plug') ||
      nameLower.includes('switch') ||
      nameLower.includes('bulb') ||
      nameLower.includes('doorbell')
    ) {
      return 'iot';
    }

    // Network equipment
    if (
      vendorLower.includes('cisco') ||
      vendorLower.includes('netgear') ||
      vendorLower.includes('d-link') ||
      vendorLower.includes('linksys') ||
      vendorLower.includes('tenda') ||
      nameLower.includes('router') ||
      nameLower.includes('switch') ||
      nameLower.includes('access point') ||
      nameLower.includes('gateway') ||
      device.ip.endsWith('.1')
    ) {
      return 'router';
    }

    // Computers
    if (
      nameLower.includes('pc') ||
      nameLower.includes('laptop') ||
      nameLower.includes('desktop') ||
      nameLower.includes('computer') ||
      nameLower.includes('windows') ||
      nameLower.includes('mac') ||
      nameLower.includes('linux')
    ) {
      return 'computer';
    }

    // Mobile devices
    if (
      vendorLower.includes('apple') ||
      vendorLower.includes('samsung') ||
      vendorLower.includes('android') ||
      vendorLower.includes('xiaomi') ||
      vendorLower.includes('huawei')
    ) {
      return 'mobile';
    }

    return device.type || 'unknown';
  };

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const actualType = classifyDeviceType(device);
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.includes(searchTerm) ||
      device.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.mac.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || actualType === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'online' && device.status === 'online') ||
      (filterStatus === 'offline' && device.status === 'offline');
    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistics calculations
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const vulnerableDevices = devices.filter(
    d => (d.vulnerabilities?.length > 0) || (d.comprehensive_vulnerabilities?.length > 0)
  ).length;

  const autoFixableVulnerabilities = devices.reduce((total, device) => {
    const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
    return total + vulns.filter(v => v.category === 'auto-fixable' && v.status !== 'fixed').length;
  }, 0);

  const manualVulnerabilities = devices.reduce((total, device) => {
    const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
    return total + vulns.filter(v => v.category === 'manual').length;
  }, 0);

  const nonFixableVulnerabilities = devices.reduce((total, device) => {
    const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
    return total + vulns.filter(v => v.category === 'non-fixable').length;
  }, 0);

  const fixedVulnerabilities = devices.reduce((total, device) => {
    const vulns = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
    return total + vulns.filter(v => v.status === 'fixed').length;
  }, 0);

  const iotDevices = devices.filter(d => classifyDeviceType(d) === 'iot');
  const criticalRiskDevices = devices.filter(d => d.riskLevel === 'critical').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Real-time updates connected' : 'Real-time updates disconnected'}
          </span>
        </div>
        <Button
          onClick={fetchDevices}
          variant="outline"
          size="sm"
          className="font-code"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Network Security Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time device monitoring and vulnerability management
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Active scanning, auto-remediation, and comprehensive security reporting
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          // In your DevicesPanel component, update the subnet selector:
<Select value={selectedSubnet} onValueChange={setSelectedSubnet}>
  <SelectTrigger className="w-40 bg-input/50 border-border">
    <SelectValue placeholder="Subnet" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="auto">Auto Detect</SelectItem>
    <SelectItem value="192.168.1.0/24">192.168.1.0/24</SelectItem>
    <SelectItem value="192.168.0.0/24">192.168.0.0/24</SelectItem>
    <SelectItem value="192.168.0.0/20">192.168.0.0/20 (Large Scan)</SelectItem>
    <SelectItem value="10.0.0.0/24">10.0.0.0/24</SelectItem>
    <SelectItem value="172.16.0.0/24">172.16.0.0/24</SelectItem>
  </SelectContent>
</Select>
          <Button
            onClick={handleScanAll}
            disabled={isScanningAll}
            variant="default"
            size="sm"
          >
            {isScanningAll ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Scan className="h-4 w-4 mr-1" />
            )}
            {isScanningAll ? 'Scanning...' : 'Discover Devices'}
          </Button>
          <Button
            onClick={handleScanIoTNetwork}
            disabled={isScanningAll}
            variant="default"
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Zap className="h-4 w-4 mr-1" />
            {isScanningAll ? 'Scanning...' : 'Deep IoT Scan'}
          </Button>
          <Button
            onClick={handleStopScan}
            variant="outline"
            size="sm"
            disabled={!isScanningAll && scanningDevices.size === 0}
          >
            <Square className="h-4 w-4 mr-1" />
            Stop All
          </Button>
          <Button
            onClick={handleClearDevices}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {totalDevices}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Devices
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {onlineDevices}
            </div>
            <div className="text-xs text-muted-foreground">
              Online
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500 mb-1">
              {vulnerableDevices}
            </div>
            <div className="text-xs text-muted-foreground">
              Vulnerable
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-500 mb-1">
              {iotDevices.length}
            </div>
            <div className="text-xs text-muted-foreground">
              IoT Devices
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-1">
              {criticalRiskDevices}
            </div>
            <div className="text-xs text-muted-foreground">
              Critical Risk
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {fixedVulnerabilities}
            </div>
            <div className="text-xs text-muted-foreground">
              Fixed Vulns
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerability Management Summary */}
      {(autoFixableVulnerabilities > 0 || manualVulnerabilities > 0 || nonFixableVulnerabilities > 0 || fixedVulnerabilities > 0) && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="font-bold text-primary mb-2">
                  Vulnerability Management
                </h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Auto-fixable: {autoFixableVulnerabilities}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-yellow-500" />
                    <span>Manual: {manualVulnerabilities}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span>Non-fixable: {nonFixableVulnerabilities}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Fixed: {fixedVulnerabilities}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExportAll}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Scans Progress */}
      {Object.keys(scanProgress).length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-yellow-500/50">
          <CardContent className="p-4">
            <h3 className="font-bold text-yellow-500 mb-3 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Active Scans ({Object.keys(scanProgress).length})
            </h3>
            <div className="space-y-3">
              {Object.entries(scanProgress).map(([scanId, progress]) => (
                <div key={scanId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {scanId === 'deep_iot_scan' ? 'Deep IoT Scan' : `Device: ${scanId}`}
                    </span>
                    <span className="text-muted-foreground">{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {progress.current_task}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Filters */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices by name, IP, MAC, or vendor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-input/50 border-border"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-input/50 border-border">
                <SelectValue placeholder="Device Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="computer">Computers</SelectItem>
                <SelectItem value="mobile">Mobile Devices</SelectItem>
                <SelectItem value="iot">IoT Devices</SelectItem>
                <SelectItem value="router">Network Equipment</SelectItem>
                <SelectItem value="printer">Printers</SelectItem>
                <SelectItem value="camera">Cameras</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-input/50 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Device List */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Device Inventory ({filteredDevices.length})
            {scanningDevices.size > 0 && (
              <Badge variant="secondary" className="ml-2">
                Scanning: {scanningDevices.size}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDevices.map(device => {
              const actualType = classifyDeviceType(device);
              const DeviceIcon = getDeviceIcon(actualType);
              const hasComprehensiveScan = device.comprehensive_vulnerabilities && device.comprehensive_vulnerabilities.length > 0;
              const vulnerabilities = device.comprehensive_vulnerabilities || device.vulnerabilities || [];
              const isIoTDevice = actualType === 'iot';
              const autoFixableVulns = vulnerabilities.filter(v => 
                v.category === 'auto-fixable' && v.status !== 'fixed'
              );
              const manualVulns = vulnerabilities.filter(v => 
                v.category === 'manual' && v.status !== 'fixed'
              );
              const currentScanProgress = scanProgress[device.id];
              
              return (
                <div
                  key={device.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isIoTDevice 
                      ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30' 
                      : 'bg-card/30 hover:bg-card/50 border-border'
                  } ${device.riskLevel === 'critical' ? 'border-red-500/50 bg-red-500/5' : ''}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex items-start space-x-4 flex-1">
                      <DeviceIcon className={`h-7 w-7 mt-1 ${
                        isIoTDevice ? 'text-cyan-500' : 'text-primary'
                      }`} />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {device.name}
                          </h3>
                          <Badge
                            variant={
                              device.status === 'online'
                                ? 'success'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {device.status.toUpperCase()}
                          </Badge>
                          <Badge
                            variant={getRiskBadge(device.riskLevel)}
                            className="text-xs"
                          >
                            {device.riskLevel.toUpperCase()} RISK
                          </Badge>
                          {isIoTDevice && (
                            <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-500 border-cyan-500/50">
                              IoT
                            </Badge>
                          )}
                          {hasComprehensiveScan && (
                            <Badge variant="success" className="text-xs">
                              COMPREHENSIVE SCAN
                            </Badge>
                          )}
                          {device.last_scanned && (
                            <Badge variant="outline" className="text-xs">
                              Scanned: {new Date(device.last_scanned).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                          <div>IP: {device.ip}</div>
                          <div>MAC: {device.mac}</div>
                          <div>Vendor: {device.vendor}</div>
                          <div>Last Seen: {new Date(device.lastSeen).toLocaleString()}</div>
                        </div>
                        
                        {/* Scan Progress */}
                        {currentScanProgress && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {currentScanProgress.current_task}
                              </span>
                              <span>{currentScanProgress.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  currentScanProgress.status === 'completed' ? 'bg-green-500' :
                                  currentScanProgress.status === 'failed' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`}
                                style={{ width: `${currentScanProgress.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Enhanced Vulnerabilities Display */}
                        {vulnerabilities.length > 0 && (
                          <div className="text-xs space-y-2 mt-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">
                                Vulnerabilities ({vulnerabilities.length})
                              </span>
                              <div className="flex gap-2 text-xs">
                                {autoFixableVulns.length > 0 && (
                                  <span className="text-green-500">
                                    {autoFixableVulns.length} auto-fixable
                                  </span>
                                )}
                                {manualVulns.length > 0 && (
                                  <span className="text-yellow-500">
                                    {manualVulns.length} manual
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {vulnerabilities.slice(0, 3).map((vuln, index) => (
                              <div
                                key={vuln.id || `vuln-${index}`}
                                className="flex items-center justify-between p-2 bg-background/50 rounded border"
                              >
                                <div className="flex items-center space-x-2 flex-1">
                                  {getStatusIcon(vuln.status || 'found')}
                                  <span className={`${getSeverityColor(vuln.severity)}`}>
                                    {vuln.severity?.toUpperCase()}: 
                                  </span>
                                  <span className="flex-1 truncate">
                                    {vuln.name || vuln.description}
                                  </span>
                                  {vuln.category && (
                                    <Badge 
                                      variant={getVulnerabilityBadge(vuln.category)} 
                                      className="text-xs whitespace-nowrap"
                                    >
                                      {vuln.category}
                                    </Badge>
                                  )}
                                </div>
                                {/* Individual Fix Button */}
                                {vuln.category === 'auto-fixable' && vuln.status !== 'fixed' && (
                                  <Button
                                    onClick={() => handleFixVulnerability(vuln.id, device.id)}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs ml-2"
                                    disabled={fixingVulnerabilities.has(vuln.id)}
                                  >
                                    {fixingVulnerabilities.has(vuln.id) ? (
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                      <Wrench className="h-3 w-3 mr-1" />
                                    )}
                                    Fix
                                  </Button>
                                )}
                                {vuln.category === 'manual' && vuln.status !== 'fixed' && (
                                  <Button
                                    onClick={() => {
                                      if (vuln.manual_steps) {
                                        const steps = Array.isArray(vuln.manual_steps) 
                                          ? vuln.manual_steps.join('\n\n• ')
                                          : vuln.manual_steps;
                                        alert(`🔧 Manual Fix Required\n\n${vuln.fix_method || 'Follow these steps:'}\n\n• ${steps}`);
                                      } else {
                                        alert('Manual intervention required for this vulnerability. No specific steps provided.');
                                      }
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs ml-2 bg-yellow-500/20 hover:bg-yellow-500/30"
                                  >
                                    <Settings className="h-3 w-3 mr-1" />
                                    Manual
                                  </Button>
                                )}
                              </div>
                            ))}
                            
                            {vulnerabilities.length > 3 && (
                              <div className="text-muted-foreground text-center">
                                +{vulnerabilities.length - 3} more vulnerabilities...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {/* Scan Button */}
                      <Button
                        onClick={() => handleScanDevice(device.id)}
                        variant="outline"
                        size="sm"
                        disabled={scanningDevices.has(device.id)}
                      >
                        {scanningDevices.has(device.id) ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Scan className="h-3 w-3 mr-1" />
                        )}
                        {scanningDevices.has(device.id) ? 'Scanning' : 'Scan'}
                      </Button>
                      
                      {/* Auto-Fix All Button */}
                      {autoFixableVulns.length > 0 && (
                        <Button
                          onClick={() => handleBatchFix(device.id)}
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={fixingDevices.has(device.id)}
                        >
                          {fixingDevices.has(device.id) ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-3 w-3 mr-1" />
                          )}
                          Fix All ({autoFixableVulns.length})
                        </Button>
                      )}
                      
                      {/* Report Button */}
                      <Button
                        onClick={() => handleGetVulnerabilityReport(device.id)}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                      
                      {/* Info Button */}
                      <Button
                        onClick={() => handleInfoDevice(device)}
                        variant="outline"
                        size="sm"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Info
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredDevices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {devices.length === 0 ? 'No devices found. Click "Discover Devices" to start REAL network scanning.' : 'No devices match your filters.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Info Modal */}
      {showInfoModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-foreground rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                Device Details: {selectedDevice.name} ({selectedDevice.ip})
              </h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Device Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-6">
                <div className="space-y-2">
                  <div><span className="font-semibold">IP Address:</span> {selectedDevice.ip}</div>
                  <div><span className="font-semibold">MAC Address:</span> {selectedDevice.mac}</div>
                  <div><span className="font-semibold">Vendor:</span> {selectedDevice.vendor}</div>
                </div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Type:</span> {classifyDeviceType(selectedDevice)}</div>
                  <div><span className="font-semibold">Status:</span> 
                    <Badge variant={selectedDevice.status === 'online' ? 'success' : 'secondary'} className="ml-2 text-xs">
                      {selectedDevice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div><span className="font-semibold">Risk Level:</span>
                    <Badge variant={getRiskBadge(selectedDevice.riskLevel)} className="ml-2 text-xs">
                      {selectedDevice.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Last Seen:</span> {new Date(selectedDevice.lastSeen).toLocaleString()}</div>
                  {selectedDevice.last_scanned && (
                    <div><span className="font-semibold">Last Scanned:</span> {new Date(selectedDevice.last_scanned).toLocaleString()}</div>
                  )}
                  {selectedDevice.hostname && (
                    <div><span className="font-semibold">Hostname:</span> {selectedDevice.hostname}</div>
                  )}
                </div>
              </div>

              {/* Enhanced Vulnerabilities Display */}
              {selectedDevice.comprehensive_vulnerabilities && selectedDevice.comprehensive_vulnerabilities.length > 0 ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-primary">
                      Detected Vulnerabilities ({selectedDevice.comprehensive_vulnerabilities.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleBatchFix(selectedDevice.id)}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={fixingDevices.has(selectedDevice.id)}
                      >
                        {fixingDevices.has(selectedDevice.id) ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3 w-3 mr-1" />
                        )}
                        Fix All Auto-Fixable
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedDevice.comprehensive_vulnerabilities.map((vuln, index) => (
                      <div
                        key={vuln.id || `modal-vuln-${index}`}
                        className="p-4 rounded border border-border bg-card/30 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getStatusIcon(vuln.status || 'found')}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-foreground">
                                  {vuln.name || vuln.id}
                                </span>
                                <Badge variant={getRiskBadge(vuln.severity)} className="text-xs">
                                  {vuln.severity?.toUpperCase()}
                                </Badge>
                                {vuln.category && (
                                  <Badge variant={getVulnerabilityBadge(vuln.category)} className="text-xs">
                                    {vuln.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {vuln.description}
                              </div>
                            </div>
                          </div>
                          
                          {/* Fix Button in Modal */}
                          {(vuln.category === 'auto-fixable' && vuln.status !== 'fixed') && (
                            <Button
                              onClick={() => handleFixVulnerability(vuln.id, selectedDevice.id)}
                              variant="outline"
                              size="sm"
                              className="ml-2 flex-shrink-0"
                              disabled={fixingVulnerabilities.has(vuln.id)}
                            >
                              {fixingVulnerabilities.has(vuln.id) ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Wrench className="h-3 w-3 mr-1" />
                              )}
                              Fix
                            </Button>
                          )}
                          {(vuln.category === 'manual' && vuln.status !== 'fixed') && (
                            <Button
                              onClick={() => {
                                if (vuln.manual_steps) {
                                  const steps = Array.isArray(vuln.manual_steps) 
                                    ? vuln.manual_steps.join('\n\n• ')
                                    : vuln.manual_steps;
                                  alert(`🔧 Manual Fix Required\n\n${vuln.fix_method || 'Follow these steps:'}\n\n• ${steps}`);
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="ml-2 flex-shrink-0 bg-yellow-500/20 hover:bg-yellow-500/30"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Manual Steps
                            </Button>
                          )}
                          {vuln.status === 'fixed' && (
                            <Badge variant="success" className="ml-2 flex-shrink-0">
                              FIXED
                            </Badge>
                          )}
                        </div>
                        
                        {/* Vulnerability Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {vuln.fix_method && (
                            <div>
                              <span className="font-semibold">Fix Method:</span> {vuln.fix_method}
                            </div>
                          )}
                          {vuln.port && (
                            <div>
                              <span className="font-semibold">Affected Port:</span> {vuln.port}
                            </div>
                          )}
                          {vuln.potential_harm && (
                            <div className="md:col-span-2">
                              <span className="font-semibold text-red-500">Risk:</span> {vuln.potential_harm}
                            </div>
                          )}
                        </div>
                        
                        {/* Fix Commands */}
                        {vuln.fix_commands && vuln.fix_commands.length > 0 && (
                          <div className="text-xs">
                            <div className="font-semibold mb-1">Fix Commands:</div>
                            <div className="bg-muted p-2 rounded space-y-1">
                              {vuln.fix_commands.map((cmd, cmdIndex) => (
                                <div key={cmdIndex} className="font-mono text-xs">
                                  {cmd}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Status and Timestamps */}
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <div>
                            <span className="font-semibold">Detected:</span> {vuln.detected_at ? new Date(vuln.detected_at).toLocaleString() : 'Unknown'}
                          </div>
                          {vuln.fixed_at && (
                            <div>
                              <span className="font-semibold">Fixed:</span> {new Date(vuln.fixed_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedDevice.vulnerabilities && selectedDevice.vulnerabilities.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-destructive mb-4">
                    Basic Vulnerabilities ({selectedDevice.vulnerabilities.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedDevice.vulnerabilities.map(vuln => (
                      <div
                        key={vuln.id}
                        className="p-3 rounded border border-border bg-card/30 space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="text-sm text-warning">
                            {vuln.id} – {vuln.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {vuln.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-success">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <div>No vulnerabilities detected.</div>
                  <div className="text-muted-foreground text-sm mt-1">This device appears to be secure.</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-border bg-card/50">
              <div className="text-xs text-muted-foreground">
                Device ID: {selectedDevice.id}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGetVulnerabilityReport(selectedDevice.id)}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-1" /> Detailed Report
                </Button>
                <Button
                  onClick={() => setShowInfoModal(false)}
                  variant="destructive"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}