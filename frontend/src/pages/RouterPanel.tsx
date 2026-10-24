







// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Router, 
//   AlertTriangle, 
//   CheckCircle, 
//   Settings,
//   Scan,
//   Download,
//   RefreshCw,
//   Zap,
//   X,
//   Shield,
//   Clock,
//   Wifi
// } from 'lucide-react';
// import { toast } from 'sonner';
// import axios from 'axios';

// interface RouterInfo {
//   name: string;
//   model: string;
//   ip: string;
//   mac: string;
//   firmware: string;
//   status: 'online' | 'offline';
//   lastScan: string;
//   uptime: string;
// }

// interface Vulnerability {
//   id: string;
//   title: string;
//   severity: 'critical' | 'high' | 'medium' | 'low';
//   description: string;
//   fixable: boolean;
//   status: 'open' | 'fixed';
//   category: string;
//   riskLevel: number;
//   recommendation: string;
// }

// export default function RouterPanel() {
//   const [routerInfo, setRouterInfo] = useState<RouterInfo | null>(null);
//   const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
//   const [isScanning, setIsScanning] = useState(false);
//   const [isFixing, setIsFixing] = useState<string | null>(null);
//   const [scanProgress, setScanProgress] = useState(0);
//   const [scanController, setScanController] = useState<AbortController | null>(null);

//   const openVulns = vulnerabilities.filter(v => v.status === 'open').length;
//   const fixedVulns = vulnerabilities.filter(v => v.status === 'fixed').length;
//   const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'open').length;

//   const getSeverityBadge = (severity: string) => {
//     switch (severity) {
//       case 'critical': return 'destructive';
//       case 'high': return 'warning';
//       case 'medium': return 'secondary';
//       case 'low': return 'outline';
//       default: return 'outline';
//     }
//   };

//   const getSeverityIcon = (severity: string) => {
//     switch (severity) {
//       case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
//       case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
//       case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
//       case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
//       default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   // ---------------- Scan Router ----------------
//   const handleScan = async () => {
//     setIsScanning(true);
//     setScanProgress(0);
    
//     const controller = new AbortController();
//     setScanController(controller);
    
//     toast.info('Router scan started', { description: 'Analyzing router configuration...' });

//     try {
//       // Simulate scan progress
//       const progressInterval = setInterval(() => {
//         setScanProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return prev;
//           }
//           return prev + 10;
//         });
//       }, 500);

//       const token = localStorage.getItem('access_token');
//       const res = await axios.post('http://127.0.0.1:5000/api/scan-router', {}, {
//         headers: { Authorization: `Bearer ${token}` },
//         signal: controller.signal
//       });

//       clearInterval(progressInterval);
//       setScanProgress(100);

//       setRouterInfo(res.data.routerInfo);
//       setVulnerabilities(res.data.vulnerabilities);

//       toast.success('Router scan completed', { 
//         description: `Found ${res.data.vulnerabilities.filter((v:any) => v.status === 'open').length} security issues`
//       });
//     } catch (error: any) {
//       if (error.name === 'CanceledError') {
//         toast.info('Scan cancelled', { description: 'Router scan was stopped' });
//       } else {
//         console.error(error);
//         toast.error('Scan failed', { description: 'Unable to scan router' });
//       }
//     } finally {
//       setIsScanning(false);
//       setScanProgress(0);
//       setScanController(null);
//     }
//   };

//   // ---------------- Stop Scan ----------------
//   const handleStopScan = () => {
//     if (scanController) {
//       scanController.abort();
//       setIsScanning(false);
//       setScanProgress(0);
//       setScanController(null);
//     }
//   };

//   // ---------------- Fix Single Vulnerability ----------------
//   const handleFix = async (vulnId: string) => {
//     setIsFixing(vulnId);
    
//     try {
//       const token = localStorage.getItem('access_token');
//       await axios.post(`http://127.0.0.1:5000/api/fix-vulnerability/${vulnId}`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setVulnerabilities(prev => 
//         prev.map(v => v.id === vulnId ? { ...v, status: 'fixed' } : v)
//       );
      
//       toast.success('Security fix applied', { description: 'Vulnerability has been resolved' });
//     } catch (error) {
//       console.error(error);
//       toast.error('Fix failed', { description: 'Unable to apply security fix' });
//     } finally {
//       setIsFixing(null);
//     }
//   };

//   // ---------------- Manual Fix ----------------
//   const handleManualFix = (vuln: Vulnerability) => {
//     toast.info('Manual Fix Instructions', {
//       description: (
//         <div className="space-y-2">
//           <p className="font-semibold">{vuln.title}</p>
//           <p>{vuln.recommendation}</p>
//           <Button 
//             size="sm" 
//             className="mt-2"
//             onClick={() => window.open(`/guides/${vuln.id}`, '_blank')}
//           >
//             View Detailed Guide
//           </Button>
//         </div>
//       ),
//       duration: 10000
//     });
//   };

//   // ---------------- Fix All Vulnerabilities ----------------
//   const handleFixAll = async () => {
//     const fixable = vulnerabilities.filter(v => v.fixable && v.status === 'open');
    
//     if (fixable.length === 0) {
//       toast.info('No fixable vulnerabilities', { description: 'All issues require manual intervention' });
//       return;
//     }

//     toast.info(`Fixing ${fixable.length} vulnerabilities...`, { duration: 2000 });

//     for (const vuln of fixable) {
//       await handleFix(vuln.id);
//       await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between fixes
//     }
//   };

//   const generateReport = () => {
//     const reportData = {
//       routerInfo,
//       vulnerabilities,
//       scanDate: new Date().toISOString(),
//       summary: {
//         total: vulnerabilities.length,
//         open: openVulns,
//         fixed: fixedVulns,
//         critical: criticalVulns
//       }
//     };
    
//     const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `router-security-report-${new Date().toISOString().split('T')[0]}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
    
//     toast.success('Report downloaded', { description: 'Security report has been generated' });
//   };

//   // Mock data for demonstration
//   useEffect(() => {
//     if (!routerInfo) {
//       setRouterInfo({
//         name: 'Home Router',
//         model: 'ASUS AX6000',
//         ip: '192.168.1.1',
//         mac: '88:D7:F6:XX:XX:XX',
//         firmware: '3.0.0.4.388.23285',
//         status: 'online',
//         lastScan: 'Never',
//         uptime: '15 days, 4 hours'
//       });
//     }
//   }, []);

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Header + Scan Button */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-primary">Router Security</h1>
//           <p className="text-muted-foreground text-sm">Gateway protection and vulnerability management</p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {isScanning ? (
//             <Button onClick={handleStopScan} variant="destructive">
//               <X className="h-4 w-4 mr-2"/>
//               Stop Scan
//             </Button>
//           ) : (
//             <Button onClick={handleScan} variant="cyber">
//               <Scan className="h-4 w-4 mr-2"/>
//               Scan Router
//             </Button>
//           )}
//           <Button onClick={handleFixAll} variant="success" disabled={openVulns === 0}>
//             <Zap className="h-4 w-4 mr-1"/>
//             Fix All ({openVulns})
//           </Button>
//           <Button onClick={generateReport} variant="outline">
//             <Download className="h-4 w-4 mr-1"/>
//             Report
//           </Button>
//         </div>
//       </div>

//       {/* Scan Progress */}
//       {isScanning && (
//         <Card className="neon-border bg-card/80 backdrop-blur-sm">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center space-x-2">
//                 <RefreshCw className="h-4 w-4 animate-spin text-primary" />
//                 <span className="text-sm font-medium">Scanning Router...</span>
//               </div>
//               <span className="text-sm text-muted-foreground">{scanProgress}%</span>
//             </div>
//             <div className="w-full bg-secondary rounded-full h-2">
//               <div 
//                 className="bg-primary h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${scanProgress}%` }}
//               />
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Router Info */}
//       <Card className="neon-border bg-card/80 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Router className="h-5 w-5 mr-2"/> 
//             Router Overview
//             {criticalVulns > 0 && (
//               <Badge variant="destructive" className="ml-2">
//                 <AlertTriangle className="h-3 w-3 mr-1"/>
//                 {criticalVulns} Critical
//               </Badge>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <div>
//               <div className="text-sm text-muted-foreground">Name & Model</div>
//               <div className="font-medium">{routerInfo?.name ?? 'Home Router'}</div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.model ?? 'ASUS AX6000'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">IP & MAC</div>
//               <div className="font-medium">{routerInfo?.ip ?? '192.168.1.1'}</div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.mac ?? '88:D7:F6:XX:XX:XX'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">Status & Uptime</div>
//               <div className="flex items-center space-x-2">
//                 <CheckCircle className="h-4 w-4 text-success"/>
//                 <span className="font-medium text-success">{routerInfo?.status ?? 'online'}</span>
//               </div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.uptime ?? '15 days, 4 hours'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">Firmware & Last Scan</div>
//               <div className="font-medium">{routerInfo?.firmware ?? '3.0.0.4.388.23285'}</div>
//               <div className="text-sm text-muted-foreground">Last scan: {routerInfo?.lastScan ?? 'Never'}</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Vulnerability Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-destructive">{openVulns}</div>
//           <div className="text-sm text-muted-foreground">Open Vulnerabilities</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-success">{fixedVulns}</div>
//           <div className="text-sm text-muted-foreground">Fixed Issues</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-warning">{criticalVulns}</div>
//           <div className="text-sm text-muted-foreground">Critical Issues</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-primary">
//             {vulnerabilities.length ? Math.round((fixedVulns/vulnerabilities.length)*100) : 100}%
//           </div>
//           <div className="text-sm text-muted-foreground">Security Score</div>
//         </Card>
//       </div>

//       {/* Vulnerabilities List */}
//       <Card className="neon-border bg-card/80 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Shield className="h-5 w-5 mr-2"/>
//             Detected Vulnerabilities
//             <Badge variant="outline" className="ml-2">{openVulns} Open</Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {vulnerabilities.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
//               <p>No vulnerabilities detected</p>
//               <p className="text-sm">Run a scan to check for security issues</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {vulnerabilities.map((vulnerability) => (
//                 <div
//                   key={vulnerability.id}
//                   className={`p-4 rounded-lg border ${
//                     vulnerability.status === 'fixed' 
//                       ? 'bg-success/10 border-success/20' 
//                       : 'bg-card border-border'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-start space-x-3 flex-1">
//                       {getSeverityIcon(vulnerability.severity)}
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-2 mb-1">
//                           <h3 className="font-semibold">{vulnerability.title}</h3>
//                           <Badge variant={getSeverityBadge(vulnerability.severity)}>
//                             {vulnerability.severity}
//                           </Badge>
//                           {vulnerability.status === 'fixed' && (
//                             <Badge variant="success" className="bg-success/20 text-success">
//                               <CheckCircle className="h-3 w-3 mr-1"/>
//                               Fixed
//                             </Badge>
//                           )}
//                         </div>
//                         <p className="text-sm text-muted-foreground mb-2">
//                           {vulnerability.description}
//                         </p>
//                         <div className="flex items-center space-x-4 text-xs text-muted-foreground">
//                           <span className="flex items-center">
//                             <Wifi className="h-3 w-3 mr-1"/>
//                             {vulnerability.category}
//                           </span>
//                           <span className="flex items-center">
//                             <Clock className="h-3 w-3 mr-1"/>
//                             Risk Level: {vulnerability.riskLevel}/10
//                           </span>
//                         </div>
//                         {vulnerability.recommendation && (
//                           <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
//                             <strong>Recommendation:</strong> {vulnerability.recommendation}
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="flex space-x-2 ml-4">
//                       {vulnerability.status === 'open' && (
//                         <>
//                           {vulnerability.fixable ? (
//                             <Button
//                               size="sm"
//                               onClick={() => handleFix(vulnerability.id)}
//                               disabled={isFixing === vulnerability.id}
//                               variant="success"
//                             >
//                               {isFixing === vulnerability.id ? (
//                                 <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
//                               ) : (
//                                 <Zap className="h-3 w-3 mr-1" />
//                               )}
//                               Auto Fix
//                             </Button>
//                           ) : (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleManualFix(vulnerability)}
//                             >
//                               <Settings className="h-3 w-3 mr-1" />
//                               Manual Fix
//                             </Button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }











// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Router, 
//   AlertTriangle, 
//   CheckCircle, 
//   Settings,
//   Scan,
//   Download,
//   RefreshCw,
//   Zap,
//   X,
//   Shield,
//   Clock,
//   Wifi,
//   LogIn
// } from 'lucide-react';
// import { toast } from 'sonner';
// import axios from 'axios';

// interface RouterInfo {
//   name: string;
//   model: string;
//   ip: string;
//   mac: string;
//   firmware: string;
//   status: 'online' | 'offline';
//   lastScan: string;
//   uptime: string;
// }

// interface Vulnerability {
//   id: string;
//   title: string;
//   severity: 'critical' | 'high' | 'medium' | 'low';
//   description: string;
//   fixable: boolean;
//   status: 'open' | 'fixed';
//   category: string;
//   riskLevel: number;
//   recommendation: string;
//   evidence?: string;
//   impact?: string;
// }

// export default function RouterPanel() {
//   const [routerInfo, setRouterInfo] = useState<RouterInfo | null>(null);
//   const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
//   const [isScanning, setIsScanning] = useState(false);
//   const [isFixing, setIsFixing] = useState<string | null>(null);
//   const [scanProgress, setScanProgress] = useState(0);
//   const [scanController, setScanController] = useState<AbortController | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

//   const openVulns = vulnerabilities.filter(v => v.status === 'open').length;
//   const fixedVulns = vulnerabilities.filter(v => v.status === 'fixed').length;
//   const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'open').length;

//   // Check authentication status on component mount
//   useEffect(() => {
//     checkAuthentication();
//   }, []);

//   const checkAuthentication = () => {
//     // Check multiple possible token storage locations
//     const token = 
//       localStorage.getItem('access_token') ||
//       localStorage.getItem('token') ||
//       sessionStorage.getItem('access_token') ||
//       sessionStorage.getItem('token');
    
//     setIsAuthenticated(!!token);
//     return !!token;
//   };

//   const getAuthToken = () => {
//     // Check multiple possible token storage locations
//     const token = 
//       localStorage.getItem('access_token') ||
//       localStorage.getItem('token') ||
//       sessionStorage.getItem('access_token') ||
//       sessionStorage.getItem('token');
    
//     if (!token) {
//       toast.error('Authentication required', { 
//         description: 'Please log in to scan router security' 
//       });
//       setIsAuthenticated(false);
//       throw new Error('No authentication token found');
//     }
    
//     setIsAuthenticated(true);
//     return token;
//   };

//   const getSeverityBadge = (severity: string) => {
//     switch (severity) {
//       case 'critical': return 'destructive';
//       case 'high': return 'warning';
//       case 'medium': return 'secondary';
//       case 'low': return 'outline';
//       default: return 'outline';
//     }
//   };

//   const getSeverityIcon = (severity: string) => {
//     switch (severity) {
//       case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
//       case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
//       case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
//       case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
//       default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   // ---------------- Scan Router ----------------
//   const handleScan = async () => {
//     // Check authentication first
//     if (!checkAuthentication()) {
//       toast.error('Please log in first', {
//         description: 'Authentication is required to scan router security'
//       });
//       return;
//     }

//     setIsScanning(true);
//     setScanProgress(0);
    
//     const controller = new AbortController();
//     setScanController(controller);
    
//     toast.info('Router scan started', { description: 'Analyzing router configuration...' });

//     try {
//       const token = getAuthToken();
      
//       // Real scan progress simulation
//       const progressInterval = setInterval(() => {
//         setScanProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return prev;
//           }
//           return prev + 10;
//         });
//       }, 500);

//       console.log('Sending scan request with token...');
//       const res = await axios.post('http://127.0.0.1:5000/api/scan-router', {}, {
//         headers: { Authorization: `Bearer ${token}` },
//         signal: controller.signal,
//         timeout: 60000 // 60 second timeout
//       });

//       console.log('Scan response:', res.data);
//       clearInterval(progressInterval);
//       setScanProgress(100);

//       if (res.data.status === 'success') {
//         setRouterInfo(res.data.routerInfo);
//         setVulnerabilities(res.data.vulnerabilities);

//         const openVulnsCount = res.data.vulnerabilities.filter((v: any) => v.status === 'open').length;
//         toast.success('Router scan completed', { 
//           description: `Found ${openVulnsCount} security issues`
//         });
//       } else {
//         throw new Error(res.data.message || 'Scan failed');
//       }
//     } catch (error: any) {
//       if (error.name === 'CanceledError') {
//         toast.info('Scan cancelled', { description: 'Router scan was stopped' });
//       } else if (error.response?.status === 401) {
//         toast.error('Authentication failed', { 
//           description: 'Please log in again' 
//         });
//         setIsAuthenticated(false);
//       } else {
//         console.error('Scan error:', error);
//         toast.error('Scan failed', { 
//           description: error.response?.data?.message || 'Unable to scan router. Please check if the backend is running.' 
//         });
//       }
//     } finally {
//       setIsScanning(false);
//       setScanProgress(0);
//       setScanController(null);
//     }
//   };

//   // ---------------- Stop Scan ----------------
//   const handleStopScan = () => {
//     if (scanController) {
//       scanController.abort();
//       setIsScanning(false);
//       setScanProgress(0);
//       setScanController(null);
//       toast.info('Scan stopped', { description: 'Router scan was cancelled' });
//     }
//   };

//   // ---------------- Fix Single Vulnerability ----------------
//   const handleFix = async (vulnId: string) => {
//     if (!checkAuthentication()) {
//       toast.error('Please log in first', {
//         description: 'Authentication is required to fix vulnerabilities'
//       });
//       return;
//     }

//     setIsFixing(vulnId);
    
//     try {
//       const token = getAuthToken();
//       const res = await axios.post(`http://127.0.0.1:5000/api/fix-vulnerability/${vulnId}`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.data.status === 'success') {
//         setVulnerabilities(prev => 
//           prev.map(v => v.id === vulnId ? { ...v, status: 'fixed' } : v)
//         );
//         toast.success('Security fix applied', { 
//           description: res.data.message || 'Vulnerability has been resolved' 
//         });
//       } else {
//         throw new Error(res.data.message || 'Fix failed');
//       }
//     } catch (error: any) {
//       console.error('Fix error:', error);
//       if (error.response?.status === 401) {
//         toast.error('Authentication failed', { 
//           description: 'Please log in again' 
//         });
//         setIsAuthenticated(false);
//       } else {
//         toast.error('Fix failed', { 
//           description: error.response?.data?.message || 'Unable to apply security fix' 
//         });
//       }
//     } finally {
//       setIsFixing(null);
//     }
//   };

//   // ---------------- Manual Fix ----------------
//   const handleManualFix = (vuln: Vulnerability) => {
//     toast.info('Manual Fix Required', {
//       description: (
//         <div className="space-y-2">
//           <p className="font-semibold">{vuln.title}</p>
//           <p className="text-sm">{vuln.description}</p>
//           {vuln.recommendation && (
//             <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
//               <strong>Manual Steps:</strong> {vuln.recommendation}
//             </div>
//           )}
//           <Button 
//             size="sm" 
//             className="mt-2"
//             onClick={() => window.open(`/guides/router-security`, '_blank')}
//           >
//             <Settings className="h-3 w-3 mr-1" />
//             View Security Guide
//           </Button>
//         </div>
//       ),
//       duration: 15000
//     });
//   };

//   // ---------------- Fix All Vulnerabilities ----------------
//   const handleFixAll = async () => {
//     if (!checkAuthentication()) {
//       toast.error('Please log in first', {
//         description: 'Authentication is required to fix vulnerabilities'
//       });
//       return;
//     }

//     const fixable = vulnerabilities.filter(v => v.fixable && v.status === 'open');
    
//     if (fixable.length === 0) {
//       toast.info('No fixable vulnerabilities', { 
//         description: 'All issues require manual intervention or are already fixed' 
//       });
//       return;
//     }

//     try {
//       const token = getAuthToken();
//       toast.info(`Fixing ${fixable.length} vulnerabilities...`);

//       const res = await axios.post('http://127.0.0.1:5000/api/fix-all-router-vulnerabilities', {
//         vulnerabilities: fixable
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.data.status === 'success') {
//         // Update all fixed vulnerabilities
//         setVulnerabilities(prev => 
//           prev.map(v => 
//             fixable.some(f => f.id === v.id) ? { ...v, status: 'fixed' } : v
//           )
//         );
        
//         toast.success('Batch fix completed', { 
//           description: res.data.message || `Fixed ${res.data.results?.successful_fixes || 0} vulnerabilities` 
//         });
//       } else {
//         throw new Error(res.data.message || 'Batch fix failed');
//       }
//     } catch (error: any) {
//       console.error('Batch fix error:', error);
//       if (error.response?.status === 401) {
//         toast.error('Authentication failed', { 
//           description: 'Please log in again' 
//         });
//         setIsAuthenticated(false);
//       } else {
//         toast.error('Batch fix failed', { 
//           description: error.response?.data?.message || 'Unable to fix all vulnerabilities' 
//         });
//       }
//     }
//   };

//   // ---------------- Generate PDF Report ----------------
//   const generateReport = async () => {
//     if (!checkAuthentication()) {
//       toast.error('Please log in first', {
//         description: 'Authentication is required to generate reports'
//       });
//       return;
//     }

//     try {
//       const token = getAuthToken();
      
//       toast.info('Generating security report...');
      
//       const response = await axios.get('http://127.0.0.1:5000/api/router-security-report', {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: 'blob'
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `router-security-report-${new Date().toISOString().split('T')[0]}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
      
//       toast.success('Report downloaded', { 
//         description: 'PDF security report has been generated' 
//       });
//     } catch (error: any) {
//       console.error('Report generation error:', error);
//       if (error.response?.status === 401) {
//         toast.error('Authentication failed', { 
//           description: 'Please log in to generate report' 
//         });
//         setIsAuthenticated(false);
//       } else {
//         // Fallback to JSON report if PDF fails
//         generateJSONReport();
//       }
//     }
//   };

//   // Fallback JSON report
//   const generateJSONReport = () => {
//     const reportData = {
//       routerInfo,
//       vulnerabilities,
//       scanDate: new Date().toISOString(),
//       summary: {
//         total: vulnerabilities.length,
//         open: openVulns,
//         fixed: fixedVulns,
//         critical: criticalVulns
//       }
//     };
    
//     const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `router-security-report-${new Date().toISOString().split('T')[0]}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
    
//     toast.success('Report downloaded', { 
//       description: 'JSON security report has been generated' 
//     });
//   };

//   // Handle login redirect
//   const handleLogin = () => {
//     // Redirect to your login page or show login modal
//     window.location.href = '/login'; // Adjust this to your login route
//   };

//   // Load initial router info
//   useEffect(() => {
//     // Set default router info
//     if (!routerInfo) {
//       setRouterInfo({
//         name: 'Home Router',
//         model: 'ASUS AX6000',
//         ip: '192.168.1.1',
//         mac: '88:D7:F6:XX:XX:XX',
//         firmware: '3.0.0.4.388.23285',
//         status: 'online',
//         lastScan: 'Never',
//         uptime: '15 days, 4 hours'
//       });
//     }
//   }, []);

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Header + Scan Button */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-primary">Router Security</h1>
//           <p className="text-muted-foreground text-sm">Gateway protection and vulnerability management</p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {!isAuthenticated ? (
//             <Button onClick={handleLogin} variant="cyber">
//               <LogIn className="h-4 w-4 mr-2"/>
//               Login to Scan
//             </Button>
//           ) : isScanning ? (
//             <Button onClick={handleStopScan} variant="destructive">
//               <X className="h-4 w-4 mr-2"/>
//               Stop Scan
//             </Button>
//           ) : (
//             <Button onClick={handleScan} variant="cyber">
//               <Scan className="h-4 w-4 mr-2"/>
//               Scan Router
//             </Button>
//           )}
//           <Button 
//             onClick={handleFixAll} 
//             variant="success" 
//             disabled={openVulns === 0 || isScanning || !isAuthenticated}
//           >
//             <Zap className="h-4 w-4 mr-1"/>
//             Fix All ({openVulns})
//           </Button>
//           <Button 
//             onClick={generateReport} 
//             variant="outline"
//             disabled={isScanning || !isAuthenticated}
//           >
//             <Download className="h-4 w-4 mr-1"/>
//             Report
//           </Button>
//         </div>
//       </div>

//       {/* Authentication Warning */}
//       {!isAuthenticated && (
//         <Card className="neon-border bg-yellow-50 border-yellow-200">
//           <CardContent className="pt-6">
//             <div className="flex items-center space-x-3">
//               <AlertTriangle className="h-5 w-5 text-yellow-600" />
//               <div>
//                 <h3 className="font-semibold text-yellow-800">Authentication Required</h3>
//                 <p className="text-sm text-yellow-700">
//                   Please log in to scan your router for security vulnerabilities and apply fixes.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Scan Progress */}
//       {isScanning && (
//         <Card className="neon-border bg-card/80 backdrop-blur-sm">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center space-x-2">
//                 <RefreshCw className="h-4 w-4 animate-spin text-primary" />
//                 <span className="text-sm font-medium">Scanning Router...</span>
//               </div>
//               <span className="text-sm text-muted-foreground">{scanProgress}%</span>
//             </div>
//             <div className="w-full bg-secondary rounded-full h-2">
//               <div 
//                 className="bg-primary h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${scanProgress}%` }}
//               />
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Router Info */}
//       <Card className="neon-border bg-card/80 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Router className="h-5 w-5 mr-2"/> 
//             Router Overview
//             {criticalVulns > 0 && (
//               <Badge variant="destructive" className="ml-2">
//                 <AlertTriangle className="h-3 w-3 mr-1"/>
//                 {criticalVulns} Critical
//               </Badge>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <div>
//               <div className="text-sm text-muted-foreground">Name & Model</div>
//               <div className="font-medium">{routerInfo?.name ?? 'Home Router'}</div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.model ?? 'ASUS AX6000'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">IP & MAC</div>
//               <div className="font-medium">{routerInfo?.ip ?? '192.168.1.1'}</div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.mac ?? '88:D7:F6:XX:XX:XX'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">Status & Uptime</div>
//               <div className="flex items-center space-x-2">
//                 <CheckCircle className="h-4 w-4 text-success"/>
//                 <span className="font-medium text-success">{routerInfo?.status ?? 'online'}</span>
//               </div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.uptime ?? '15 days, 4 hours'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">Firmware & Last Scan</div>
//               <div className="font-medium">{routerInfo?.firmware ?? '3.0.0.4.388.23285'}</div>
//               <div className="text-sm text-muted-foreground">Last scan: {routerInfo?.lastScan ?? 'Never'}</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Vulnerability Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-destructive">{openVulns}</div>
//           <div className="text-sm text-muted-foreground">Open Vulnerabilities</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-success">{fixedVulns}</div>
//           <div className="text-sm text-muted-foreground">Fixed Issues</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-warning">{criticalVulns}</div>
//           <div className="text-sm text-muted-foreground">Critical Issues</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-primary">
//             {vulnerabilities.length ? Math.round((fixedVulns/vulnerabilities.length)*100) : 100}%
//           </div>
//           <div className="text-sm text-muted-foreground">Security Score</div>
//         </Card>
//       </div>

//       {/* Vulnerabilities List */}
//       <Card className="neon-border bg-card/80 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Shield className="h-5 w-5 mr-2"/>
//             Detected Vulnerabilities
//             <Badge variant="outline" className="ml-2">{openVulns} Open</Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {vulnerabilities.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
//               <p>No vulnerabilities detected</p>
//               <p className="text-sm">
//                 {isAuthenticated 
//                   ? 'Run a scan to check for security issues' 
//                   : 'Login and run a scan to check for security issues'
//                 }
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {vulnerabilities.map((vulnerability) => (
//                 <div
//                   key={vulnerability.id}
//                   className={`p-4 rounded-lg border ${
//                     vulnerability.status === 'fixed' 
//                       ? 'bg-success/10 border-success/20' 
//                       : 'bg-card border-border'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-start space-x-3 flex-1">
//                       {getSeverityIcon(vulnerability.severity)}
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-2 mb-1">
//                           <h3 className="font-semibold">{vulnerability.title}</h3>
//                           <Badge variant={getSeverityBadge(vulnerability.severity)}>
//                             {vulnerability.severity}
//                           </Badge>
//                           {vulnerability.status === 'fixed' && (
//                             <Badge variant="success" className="bg-success/20 text-success">
//                               <CheckCircle className="h-3 w-3 mr-1"/>
//                               Fixed
//                             </Badge>
//                           )}
//                         </div>
//                         <p className="text-sm text-muted-foreground mb-2">
//                           {vulnerability.description}
//                         </p>
//                         {vulnerability.evidence && (
//                           <div className="mt-1 p-2 bg-yellow-50 rounded text-xs">
//                             <strong>Evidence:</strong> {vulnerability.evidence}
//                           </div>
//                         )}
//                         <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
//                           <span className="flex items-center">
//                             <Wifi className="h-3 w-3 mr-1"/>
//                             {vulnerability.category}
//                           </span>
//                           <span className="flex items-center">
//                             <Clock className="h-3 w-3 mr-1"/>
//                             Risk Level: {vulnerability.riskLevel}/10
//                           </span>
//                         </div>
//                         {vulnerability.recommendation && vulnerability.status === 'open' && (
//                           <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
//                             <strong>Recommendation:</strong> {vulnerability.recommendation}
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="flex space-x-2 ml-4">
//                       {vulnerability.status === 'open' && (
//                         <>
//                           {vulnerability.fixable ? (
//                             <Button
//                               size="sm"
//                               onClick={() => handleFix(vulnerability.id)}
//                               disabled={isFixing === vulnerability.id || isScanning || !isAuthenticated}
//                               variant="success"
//                             >
//                               {isFixing === vulnerability.id ? (
//                                 <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
//                               ) : (
//                                 <Zap className="h-3 w-3 mr-1" />
//                               )}
//                               Auto Fix
//                             </Button>
//                           ) : (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleManualFix(vulnerability)}
//                               disabled={isScanning}
//                             >
//                               <Settings className="h-3 w-3 mr-1" />
//                               Manual Fix
//                             </Button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }















// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { 
//   Router, 
//   AlertTriangle, 
//   CheckCircle, 
//   Settings,
//   Scan,
//   Download,
//   RefreshCw,
//   Zap,
//   X,
//   Shield,
//   Clock,
//   Wifi,
//   LogIn,
//   User,
//   Lock
// } from 'lucide-react';
// import { toast } from 'sonner';
// import axios from 'axios';

// interface RouterInfo {
//   name: string;
//   model: string;
//   ip: string;
//   mac: string;
//   firmware: string;
//   status: 'online' | 'offline';
//   lastScan: string;
//   uptime: string;
// }

// interface Vulnerability {
//   id: string;
//   title: string;
//   severity: 'critical' | 'high' | 'medium' | 'low';
//   description: string;
//   fixable: boolean;
//   status: 'open' | 'fixed';
//   category: string;
//   riskLevel: number;
//   recommendation: string;
//   evidence?: string;
//   impact?: string;
// }

// export default function RouterPanel() {
//   const [routerInfo, setRouterInfo] = useState<RouterInfo | null>(null);
//   const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
//   const [isScanning, setIsScanning] = useState(false);
//   const [isFixing, setIsFixing] = useState<string | null>(null);
//   const [scanProgress, setScanProgress] = useState(0);
//   const [scanController, setScanController] = useState<AbortController | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
//   const [loginData, setLoginData] = useState({
//     username: 'admin',
//     password: 'admin'
//   });
//   const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

//   const openVulns = vulnerabilities.filter(v => v.status === 'open').length;
//   const fixedVulns = vulnerabilities.filter(v => v.status === 'fixed').length;
//   const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'open').length;
// const [showPasswordModal, setShowPasswordModal] = useState(false);
// const [newRouterPassword, setNewRouterPassword] = useState('');
//   // Check authentication status on component mount
//   useEffect(() => {
//     checkAuthentication();
//   }, []);

//   const checkAuthentication = () => {
//     const token = 
//       localStorage.getItem('access_token') ||
//       localStorage.getItem('token') ||
//       sessionStorage.getItem('access_token') ||
//       sessionStorage.getItem('token');
    
//     const isAuth = !!token;
//     setIsAuthenticated(isAuth);
//     return isAuth;
//   };

//   const getAuthToken = () => {
//     const token = 
//       localStorage.getItem('access_token') ||
//       localStorage.getItem('token') ||
//       sessionStorage.getItem('access_token') ||
//       sessionStorage.getItem('token');
    
//     if (!token) {
//       toast.error('Authentication required', { 
//         description: 'Please log in to scan router security' 
//       });
//       setIsAuthenticated(false);
//       throw new Error('No authentication token found');
//     }
    
//     setIsAuthenticated(true);
//     return token;
//   };

//   // ---------------- Login Functions ----------------
//   const handleLogin = async () => {
//     if (!loginData.username || !loginData.password) {
//       toast.error('Please enter both username and password');
//       return;
//     }

//     setIsLoggingIn(true);
    
//     try {
//       const response = await axios.post('http://127.0.0.1:5000/api/login', {
//         username: loginData.username,
//         password: loginData.password
//       });

//       if (response.data.status === 'success') {
//         // Store the token
//         localStorage.setItem('access_token', response.data.access_token);
//         setIsAuthenticated(true);
//         setShowLoginModal(false);
        
//         toast.success('Login successful', {
//           description: `Welcome back, ${response.data.user}!`
//         });
        
//         // Clear password field
//         setLoginData(prev => ({ ...prev, password: '' }));
//       } else {
//         throw new Error(response.data.message || 'Login failed');
//       }
//     } catch (error: any) {
//       console.error('Login error:', error);
//       toast.error('Login failed', {
//         description: error.response?.data?.message || 'Invalid username or password'
//       });
//     } finally {
//       setIsLoggingIn(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('token');
//     sessionStorage.removeItem('access_token');
//     sessionStorage.removeItem('token');
//     setIsAuthenticated(false);
    
//     toast.info('Logged out', {
//       description: 'You have been successfully logged out'
//     });
//   };

//   const handleQuickLogin = () => {
//     // Auto-fill and submit with default credentials
//     setLoginData({
//       username: 'admin',
//       password: 'admin'
//     });
    
//     // Small delay to show the filled form
//     setTimeout(() => {
//       handleLogin();
//     }, 100);
//   };

//   const getSeverityBadge = (severity: string) => {
//     switch (severity) {
//       case 'critical': return 'destructive';
//       case 'high': return 'warning';
//       case 'medium': return 'secondary';
//       case 'low': return 'outline';
//       default: return 'outline';
//     }
//   };

//   const getSeverityIcon = (severity: string) => {
//     switch (severity) {
//       case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
//       case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
//       case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
//       case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
//       default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   // ---------------- Scan Router ----------------
//   const handleScan = async () => {
//     if (!checkAuthentication()) {
//       setShowLoginModal(true);
//       return;
//     }

//     setIsScanning(true);
//     setScanProgress(0);
    
//     const controller = new AbortController();
//     setScanController(controller);
    
//     toast.info('Router scan started', { description: 'Analyzing router configuration...' });

//     try {
//       const token = getAuthToken();
      
//       // Real scan progress simulation
//       const progressInterval = setInterval(() => {
//         setScanProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return prev;
//           }
//           return prev + 10;
//         });
//       }, 500);

//       console.log('Sending scan request with token...');
//       const res = await axios.post('http://127.0.0.1:5000/api/scan-router', {}, {
//         headers: { Authorization: `Bearer ${token}` },
//         signal: controller.signal,
//         timeout: 60000
//       });

//       console.log('Scan response:', res.data);
//       clearInterval(progressInterval);
//       setScanProgress(100);

//       if (res.data.status === 'success') {
//         setRouterInfo(res.data.routerInfo);
//         setVulnerabilities(res.data.vulnerabilities);

//         const openVulnsCount = res.data.vulnerabilities.filter((v: any) => v.status === 'open').length;
//         toast.success('Router scan completed', { 
//           description: `Found ${openVulnsCount} security issues`
//         });
//       } else {
//         throw new Error(res.data.message || 'Scan failed');
//       }
//     } catch (error: any) {
//       if (error.name === 'CanceledError') {
//         toast.info('Scan cancelled', { description: 'Router scan was stopped' });
//       } else if (error.response?.status === 401) {
//         toast.error('Authentication failed', { 
//           description: 'Please log in again' 
//         });
//         setIsAuthenticated(false);
//         setShowLoginModal(true);
//       } else {
//         console.error('Scan error:', error);
//         toast.error('Scan failed', { 
//           description: error.response?.data?.message || 'Unable to scan router. Please check if the backend is running.' 
//         });
//       }
//     } finally {
//       setIsScanning(false);
//       setScanProgress(0);
//       setScanController(null);
//     }
//   };

//   // ---------------- Stop Scan ----------------
//   const handleStopScan = () => {
//     if (scanController) {
//       scanController.abort();
//       setIsScanning(false);
//       setScanProgress(0);
//       setScanController(null);
//       toast.info('Scan stopped', { description: 'Router scan was cancelled' });
//     }
//   };












// // ---------------- Fix Single Vulnerability ----------------
// const handleFix = async (vulnId: string) => {
//   if (!checkAuthentication()) {
//     setShowLoginModal(true);
//     return;
//   }

//   setIsFixing(vulnId);
  
//   try {
//     const token = getAuthToken();
//     const res = await axios.post(`http://127.0.0.1:5000/api/fix-vulnerability/${vulnId}`, {}, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     if (res.data.status === 'success') {
//       // Update vulnerability status
//       setVulnerabilities(prev => 
//         prev.map(v => v.id === vulnId ? { ...v, status: 'fixed' } : v)
//       );

//       // Show specific success message based on what was fixed
//       if (vulnId.includes('default-creds')) {
//         const newPassword = res.data.details?.new_password;
//         setNewRouterPassword(newPassword);
//         setShowPasswordModal(true); // Show modal with new password
//       } 
//       else if (vulnId.includes('open-port-23')) {
//         toast.success('🔒 Telnet Service Secured!', { 
//           description: (
//             <div className="space-y-1">
//               <p><strong>Telnet service has been disabled</strong></p>
//               <div className="bg-green-50 p-2 rounded border border-green-200">
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>Before:</strong> Port 23 open (Unencrypted remote access)
//                 </p>
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>After:</strong> Port 23 closed
//                 </p>
//                 <p className="text-sm text-green-800 mt-1">
//                   🛡️ <strong>Security Impact:</strong> Eliminated unencrypted access point
//                 </p>
//               </div>
//             </div>
//           ),
//           duration: 8000
//         });
//       }
//       else if (vulnId.includes('open-port-7547')) {
//         toast.success('🔒 TR-069 Service Secured!', { 
//           description: (
//             <div className="space-y-1">
//               <p><strong>TR-069 remote management disabled</strong></p>
//               <div className="bg-green-50 p-2 rounded border border-green-200">
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>Before:</strong> Port 7547 open (Remote management backdoor)
//                 </p>
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>After:</strong> Port 7547 closed
//                 </p>
//                 <p className="text-sm text-green-800 mt-1">
//                   🛡️ <strong>Security Impact:</strong> Closed potential ISP backdoor access
//                 </p>
//               </div>
//             </div>
//           ),
//           duration: 8000
//         });
//       }
//       else if (vulnId.includes('weak-encryption')) {
//         toast.success('📡 Wireless Security Enhanced!', { 
//           description: (
//             <div className="space-y-1">
//               <p><strong>Wi-Fi encryption upgraded</strong></p>
//               <div className="bg-green-50 p-2 rounded border border-green-200">
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>Before:</strong> Weak encryption (WEP/WPA)
//                 </p>
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>After:</strong> Strong encryption (WPA2/WPA3)
//                 </p>
//                 <p className="text-sm text-green-800 mt-1">
//                   🛡️ <strong>Security Impact:</strong> Enhanced wireless network protection
//                 </p>
//               </div>
//             </div>
//           ),
//           duration: 8000
//         });
//       }
//       else if (vulnId.includes('remote-management')) {
//         toast.success('🌐 Remote Access Secured!', { 
//           description: (
//             <div className="space-y-1">
//               <p><strong>Remote management disabled</strong></p>
//               <div className="bg-green-50 p-2 rounded border border-green-200">
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>Before:</strong> Web interface accessible from internet
//                 </p>
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>After:</strong> Local access only
//                 </p>
//                 <p className="text-sm text-green-800 mt-1">
//                   🛡️ <strong>Security Impact:</strong> Eliminated external attack surface
//                 </p>
//               </div>
//             </div>
//           ),
//           duration: 8000
//         });
//       }
//       else if (vulnId.includes('upnp-enabled')) {
//         toast.success('🔧 UPnP Service Secured!', { 
//           description: (
//             <div className="space-y-1">
//               <p><strong>UPnP auto-port forwarding disabled</strong></p>
//               <div className="bg-green-50 p-2 rounded border border-green-200">
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>Before:</strong> UPnP enabled (Automatic port opening)
//                 </p>
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>After:</strong> UPnP disabled
//                 </p>
//                 <p className="text-sm text-green-800 mt-1">
//                   🛡️ <strong>Security Impact:</strong> Prevented automatic malware port access
//                 </p>
//               </div>
//             </div>
//           ),
//           duration: 8000
//         });
//       }
//       else if (vulnId.includes('wps-enabled')) {
//         toast.success('📶 WPS Vulnerability Fixed!', { 
//           description: (
//             <div className="space-y-1">
//               <p><strong>WPS PIN vulnerability resolved</strong></p>
//               <div className="bg-green-50 p-2 rounded border border-green-200">
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>Before:</strong> WPS enabled (Brute-force vulnerable)
//                 </p>
//                 <p className="text-sm text-green-800">
//                   ✅ <strong>After:</strong> WPS disabled
//                 </p>
//                 <p className="text-sm text-green-800 mt-1">
//                   🛡️ <strong>Security Impact:</strong> Eliminated Wi-Fi brute-force attack vector
//                 </p>
//               </div>
//             </div>
//           ),
//           duration: 8000
//         });
//       }
//       else {
//         // Generic success message for other vulnerabilities
//         toast.success('✅ Security Fix Applied', { 
//           description: res.data.message || 'Vulnerability has been successfully resolved' 
//         });
//       }

//       // Update statistics in real-time
//       const updatedOpenVulns = vulnerabilities.filter(v => v.status === 'open' && v.id !== vulnId).length;
//       const updatedFixedVulns = vulnerabilities.filter(v => v.status === 'fixed' || v.id === vulnId).length;
      
//       console.log(`Vulnerability ${vulnId} fixed. Open: ${updatedOpenVulns}, Fixed: ${updatedFixedVulns}`);

//     } else {
//       throw new Error(res.data.message || 'Fix failed');
//     }
//   } catch (error: any) {
//     console.error('Fix error:', error);
//     if (error.response?.status === 401) {
//       toast.error('🔐 Authentication Failed', { 
//         description: 'Your session has expired. Please log in again to continue.' 
//       });
//       setIsAuthenticated(false);
//       setShowLoginModal(true);
//     } else if (error.response?.status === 400) {
//       toast.error('⚠️ Fix Not Available', { 
//         description: error.response?.data?.message || 'This vulnerability cannot be fixed automatically. Please use manual fix instructions.' 
//       });
//     } else {
//       toast.error('❌ Fix Failed', { 
//         description: (
//           <div className="space-y-1">
//             <p><strong>Unable to apply security fix</strong></p>
//             <p className="text-sm">{error.response?.data?.message || 'Please check your router connection and try again.'}</p>
//             <p className="text-xs text-muted-foreground mt-1">
//               If this continues, use the manual fix instructions.
//             </p>
//           </div>
//         ),
//         duration: 8000
//       });
//     }
//   } finally {
//     setIsFixing(null);
//   }
// };
//   // ---------------- Manual Fix ----------------
//   const handleManualFix = (vuln: Vulnerability) => {
//     toast.info('Manual Fix Required', {
//       description: (
//         <div className="space-y-2">
//           <p className="font-semibold">{vuln.title}</p>
//           <p className="text-sm">{vuln.description}</p>
//           {vuln.recommendation && (
//             <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
//               <strong>Manual Steps:</strong> {vuln.recommendation}
//             </div>
//           )}
//           <Button 
//             size="sm" 
//             className="mt-2"
//             onClick={() => window.open(`/guides/router-security`, '_blank')}
//           >
//             <Settings className="h-3 w-3 mr-1" />
//             View Security Guide
//           </Button>
//         </div>
//       ),
//       duration: 15000
//     });
//   };

//   // ---------------- Fix All Vulnerabilities ----------------
//   const handleFixAll = async () => {
//     if (!checkAuthentication()) {
//       setShowLoginModal(true);
//       return;
//     }

//     const fixable = vulnerabilities.filter(v => v.fixable && v.status === 'open');
    
//     if (fixable.length === 0) {
//       toast.info('No fixable vulnerabilities', { 
//         description: 'All issues require manual intervention or are already fixed' 
//       });
//       return;
//     }

//     try {
//       const token = getAuthToken();
//       toast.info(`Fixing ${fixable.length} vulnerabilities...`);

//       const res = await axios.post('http://127.0.0.1:5000/api/fix-all-router-vulnerabilities', {
//         vulnerabilities: fixable
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.data.status === 'success') {
//         setVulnerabilities(prev => 
//           prev.map(v => 
//             fixable.some(f => f.id === v.id) ? { ...v, status: 'fixed' } : v
//           )
//         );
        
//         toast.success('Batch fix completed', { 
//           description: res.data.message || `Fixed ${res.data.results?.successful_fixes || 0} vulnerabilities` 
//         });
//       } else {
//         throw new Error(res.data.message || 'Batch fix failed');
//       }
//     } catch (error: any) {
//       console.error('Batch fix error:', error);
//       if (error.response?.status === 401) {
//         toast.error('Authentication failed', { 
//           description: 'Please log in again' 
//         });
//         setIsAuthenticated(false);
//         setShowLoginModal(true);
//       } else {
//         toast.error('Batch fix failed', { 
//           description: error.response?.data?.message || 'Unable to fix all vulnerabilities' 
//         });
//       }
//     }
//   };

//   // ---------------- Generate PDF Report ----------------
//   const generateReport = async () => {
//     if (!checkAuthentication()) {
//       setShowLoginModal(true);
//       return;
//     }

//     try {
//       const token = getAuthToken();
      
//       toast.info('Generating security report...');
      
//       const response = await axios.get('http://127.0.0.1:5000/api/router-security-report', {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: 'blob'
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `router-security-report-${new Date().toISOString().split('T')[0]}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
      
//       toast.success('Report downloaded', { 
//         description: 'PDF security report has been generated' 
//       });
//     } catch (error: any) {
//       console.error('Report generation error:', error);
//       if (error.response?.status === 401) {
//         toast.error('Authentication failed', { 
//           description: 'Please log in to generate report' 
//         });
//         setIsAuthenticated(false);
//         setShowLoginModal(true);
//       } else {
//         generateJSONReport();
//       }
//     }
//   };

//   // Fallback JSON report
//   const generateJSONReport = () => {
//     const reportData = {
//       routerInfo,
//       vulnerabilities,
//       scanDate: new Date().toISOString(),
//       summary: {
//         total: vulnerabilities.length,
//         open: openVulns,
//         fixed: fixedVulns,
//         critical: criticalVulns
//       }
//     };
    
//     const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `router-security-report-${new Date().toISOString().split('T')[0]}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
    
//     toast.success('Report downloaded', { 
//       description: 'JSON security report has been generated' 
//     });
//   };

//   // Load initial router info
//   useEffect(() => {
//     if (!routerInfo) {
//       setRouterInfo({
//         name: 'Home Router',
//         model: 'ASUS AX6000',
//         ip: '192.168.1.1',
//         mac: '88:D7:F6:XX:XX:XX',
//         firmware: '3.0.0.4.388.23285',
//         status: 'online',
//         lastScan: 'Never',
//         uptime: '15 days, 4 hours'
//       });
//     }
//   }, []);

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Login Modal */}
//       {showLoginModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex items-center space-x-2 mb-4">
//               <Shield className="h-6 w-6 text-primary" />
//               <h2 className="text-xl font-bold">Login Required</h2>
//             </div>
            
//             <p className="text-sm text-muted-foreground mb-4">
//               Please log in to access router security features
//             </p>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="username">Username</Label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="username"
//                     placeholder="Enter username"
//                     value={loginData.username}
//                     onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="password"
//                     type="password"
//                     placeholder="Enter password"
//                     value={loginData.password}
//                     onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>

//               <div className="flex space-x-2 pt-2">
//                 <Button
//                   onClick={handleLogin}
//                   disabled={isLoggingIn}
//                   className="flex-1"
//                 >
//                   {isLoggingIn ? (
//                     <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//                   ) : (
//                     <LogIn className="h-4 w-4 mr-2" />
//                   )}
//                   {isLoggingIn ? 'Logging in...' : 'Login'}
//                 </Button>
                
//                 <Button
//                   onClick={handleQuickLogin}
//                   disabled={isLoggingIn}
//                   variant="outline"
//                 >
//                   <Zap className="h-4 w-4 mr-2" />
//                   Quick Login
//                 </Button>
//               </div>

//               <div className="text-center">
//                 <p className="text-xs text-muted-foreground">
//                   Default credentials: <strong>admin</strong> / <strong>admin</strong>
//                 </p>
//               </div>

//               <Button
//                 variant="ghost"
//                 onClick={() => setShowLoginModal(false)}
//                 className="w-full"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header + Scan Button */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-primary">Router Security</h1>
//           <p className="text-muted-foreground text-sm">Gateway protection and vulnerability management</p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {!isAuthenticated ? (
//             <Button onClick={() => setShowLoginModal(true)} variant="cyber">
//               <LogIn className="h-4 w-4 mr-2"/>
//               Login to Scan
//             </Button>
//           ) : isScanning ? (
//             <Button onClick={handleStopScan} variant="destructive">
//               <X className="h-4 w-4 mr-2"/>
//               Stop Scan
//             </Button>
//           ) : (
//             <Button onClick={handleScan} variant="cyber">
//               <Scan className="h-4 w-4 mr-2"/>
//               Scan Router
//             </Button>
//           )}
          
//           <Button 
//             onClick={handleFixAll} 
//             variant="success" 
//             disabled={openVulns === 0 || isScanning || !isAuthenticated}
//           >
//             <Zap className="h-4 w-4 mr-1"/>
//             Fix All ({openVulns})
//           </Button>
          
//           <Button 
//             onClick={generateReport} 
//             variant="outline"
//             disabled={isScanning || !isAuthenticated}
//           >
//             <Download className="h-4 w-4 mr-1"/>
//             Report
//           </Button>

//           {isAuthenticated && (
//             <Button 
//               onClick={handleLogout} 
//               variant="ghost"
//               size="sm"
//             >
//               Logout
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Authentication Status */}
//       {isAuthenticated && (
//         <Card className="neon-border bg-green-50 border-green-200">
//           <CardContent className="pt-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//                 <div>
//                   <h3 className="font-semibold text-green-800">Authenticated</h3>
//                   <p className="text-sm text-green-700">
//                     You are logged in and can scan your router for security vulnerabilities.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Rest of your existing UI components remain the same */}
//       {/* Scan Progress */}
//       {isScanning && (
//         <Card className="neon-border bg-card/80 backdrop-blur-sm">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center space-x-2">
//                 <RefreshCw className="h-4 w-4 animate-spin text-primary" />
//                 <span className="text-sm font-medium">Scanning Router...</span>
//               </div>
//               <span className="text-sm text-muted-foreground">{scanProgress}%</span>
//             </div>
//             <div className="w-full bg-secondary rounded-full h-2">
//               <div 
//                 className="bg-primary h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${scanProgress}%` }}
//               />
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Router Info */}
//       <Card className="neon-border bg-card/80 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Router className="h-5 w-5 mr-2"/> 
//             Router Overview
//             {criticalVulns > 0 && (
//               <Badge variant="destructive" className="ml-2">
//                 <AlertTriangle className="h-3 w-3 mr-1"/>
//                 {criticalVulns} Critical
//               </Badge>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <div>
//               <div className="text-sm text-muted-foreground">Name & Model</div>
//               <div className="font-medium">{routerInfo?.name ?? 'Home Router'}</div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.model ?? 'ASUS AX6000'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">IP & MAC</div>
//               <div className="font-medium">{routerInfo?.ip ?? '192.168.1.1'}</div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.mac ?? '88:D7:F6:XX:XX:XX'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">Status & Uptime</div>
//               <div className="flex items-center space-x-2">
//                 <CheckCircle className="h-4 w-4 text-success"/>
//                 <span className="font-medium text-success">{routerInfo?.status ?? 'online'}</span>
//               </div>
//               <div className="text-sm text-muted-foreground">{routerInfo?.uptime ?? '15 days, 4 hours'}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground">Firmware & Last Scan</div>
//               <div className="font-medium">{routerInfo?.firmware ?? '3.0.0.4.388.23285'}</div>
//               <div className="text-sm text-muted-foreground">Last scan: {routerInfo?.lastScan ?? 'Never'}</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Vulnerability Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-destructive">{openVulns}</div>
//           <div className="text-sm text-muted-foreground">Open Vulnerabilities</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-success">{fixedVulns}</div>
//           <div className="text-sm text-muted-foreground">Fixed Issues</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-warning">{criticalVulns}</div>
//           <div className="text-sm text-muted-foreground">Critical Issues</div>
//         </Card>
//         <Card className="neon-border bg-card/80 text-center p-6">
//           <div className="text-3xl font-bold text-primary">
//             {vulnerabilities.length ? Math.round((fixedVulns/vulnerabilities.length)*100) : 100}%
//           </div>
//           <div className="text-sm text-muted-foreground">Security Score</div>
//         </Card>
//       </div>

//       {/* Vulnerabilities List */}
//       <Card className="neon-border bg-card/80 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Shield className="h-5 w-5 mr-2"/>
//             Detected Vulnerabilities
//             <Badge variant="outline" className="ml-2">{openVulns} Open</Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {vulnerabilities.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
//               <p>No vulnerabilities detected</p>
//               <p className="text-sm">
//                 {isAuthenticated 
//                   ? 'Run a scan to check for security issues' 
//                   : 'Login and run a scan to check for security issues'
//                 }
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {vulnerabilities.map((vulnerability) => (
//                 <div
//                   key={vulnerability.id}
//                   className={`p-4 rounded-lg border ${
//                     vulnerability.status === 'fixed' 
//                       ? 'bg-success/10 border-success/20' 
//                       : 'bg-card border-border'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-start space-x-3 flex-1">
//                       {getSeverityIcon(vulnerability.severity)}
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-2 mb-1">
//                           <h3 className="font-semibold">{vulnerability.title}</h3>
//                           <Badge variant={getSeverityBadge(vulnerability.severity)}>
//                             {vulnerability.severity}
//                           </Badge>
//                           {vulnerability.status === 'fixed' && (
//                             <Badge variant="success" className="bg-success/20 text-success">
//                               <CheckCircle className="h-3 w-3 mr-1"/>
//                               Fixed
//                             </Badge>
//                           )}
//                         </div>
//                         <p className="text-sm text-muted-foreground mb-2">
//                           {vulnerability.description}
//                         </p>
//                         {vulnerability.evidence && (
//                           <div className="mt-1 p-2 bg-yellow-50 rounded text-xs">
//                             <strong>Evidence:</strong> {vulnerability.evidence}
//                           </div>
//                         )}
//                         <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
//                           <span className="flex items-center">
//                             <Wifi className="h-3 w-3 mr-1"/>
//                             {vulnerability.category}
//                           </span>
//                           <span className="flex items-center">
//                             <Clock className="h-3 w-3 mr-1"/>
//                             Risk Level: {vulnerability.riskLevel}/10
//                           </span>
//                         </div>
//                         {vulnerability.recommendation && vulnerability.status === 'open' && (
//                           <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
//                             <strong>Recommendation:</strong> {vulnerability.recommendation}
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="flex space-x-2 ml-4">
//                       {vulnerability.status === 'open' && (
//                         <>
//                           {vulnerability.fixable ? (
//                             <Button
//                               size="sm"
//                               onClick={() => handleFix(vulnerability.id)}
//                               disabled={isFixing === vulnerability.id || isScanning || !isAuthenticated}
//                               variant="success"
//                             >
//                               {isFixing === vulnerability.id ? (
//                                 <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
//                               ) : (
//                                 <Zap className="h-3 w-3 mr-1" />
//                               )}
//                               Auto Fix
//                             </Button>
//                           ) : (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleManualFix(vulnerability)}
//                               disabled={isScanning}
//                             >
//                               <Settings className="h-3 w-3 mr-1" />
//                               Manual Fix
//                             </Button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }














import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Router, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Scan,
  Download,
  RefreshCw,
  Zap,
  X,
  Shield,
  Clock,
  Wifi,
  LogIn,
  User,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface RouterInfo {
  name: string;
  model: string;
  ip: string;
  mac: string;
  firmware: string;
  status: 'online' | 'offline';
  lastScan: string;
  uptime: string;
}

interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fixable: boolean;
  status: 'open' | 'fixed';
  category: string;
  riskLevel: number;
  recommendation: string;
  evidence?: string;
  impact?: string;
}

export default function RouterPanel() {
  const [routerInfo, setRouterInfo] = useState<RouterInfo | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanController, setScanController] = useState<AbortController | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginData, setLoginData] = useState({
    username: 'admin',
    password: 'admin'
  });
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newRouterPassword, setNewRouterPassword] = useState('');

  const openVulns = vulnerabilities.filter(v => v.status === 'open').length;
  const fixedVulns = vulnerabilities.filter(v => v.status === 'fixed').length;
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'open').length;

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const token = 
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token');
    
    const isAuth = !!token;
    setIsAuthenticated(isAuth);
    return isAuth;
  };

  const getAuthToken = () => {
    const token = 
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token');
    
    if (!token) {
      toast.error('Authentication required', { 
        description: 'Please log in to scan router security' 
      });
      setIsAuthenticated(false);
      throw new Error('No authentication token found');
    }
    
    setIsAuthenticated(true);
    return token;
  };

  // ---------------- Login Functions ----------------
  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/login', {
        username: loginData.username,
        password: loginData.password
      });

      if (response.data.status === 'success') {
        // Store the token
        localStorage.setItem('access_token', response.data.access_token);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        
        toast.success('Login successful', {
          description: `Welcome back, ${response.data.user}!`
        });
        
        // Clear password field
        setLoginData(prev => ({ ...prev, password: '' }));
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: error.response?.data?.message || 'Invalid username or password'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
    
    toast.info('Logged out', {
      description: 'You have been successfully logged out'
    });
  };

  const handleQuickLogin = () => {
    // Auto-fill and submit with default credentials
    setLoginData({
      username: 'admin',
      password: 'admin'
    });
    
    // Small delay to show the filled form
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  // ---------------- Scan Router ----------------
  const handleScan = async () => {
    if (!checkAuthentication()) {
      setShowLoginModal(true);
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    
    const controller = new AbortController();
    setScanController(controller);
    
    toast.info('Router scan started', { description: 'Analyzing router configuration...' });

    try {
      const token = getAuthToken();
      
      // Real scan progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const res = await axios.post('http://127.0.0.1:5000/api/scan-router', {}, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        timeout: 60000
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      if (res.data.status === 'success') {
        setRouterInfo(res.data.routerInfo);
        setVulnerabilities(res.data.vulnerabilities);

        const openVulnsCount = res.data.vulnerabilities.filter((v: any) => v.status === 'open').length;
        toast.success('Router scan completed', { 
          description: `Found ${openVulnsCount} security issues`
        });
      } else {
        throw new Error(res.data.message || 'Scan failed');
      }
    } catch (error: any) {
      if (error.name === 'CanceledError') {
        toast.info('Scan cancelled', { description: 'Router scan was stopped' });
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed', { 
          description: 'Please log in again' 
        });
        setIsAuthenticated(false);
        setShowLoginModal(true);
      } else {
        console.error('Scan error:', error);
        toast.error('Scan failed', { 
          description: error.response?.data?.message || 'Unable to scan router. Please check if the backend is running.' 
        });
      }
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanController(null);
    }
  };

  // ---------------- Stop Scan ----------------
  const handleStopScan = () => {
    if (scanController) {
      scanController.abort();
      setIsScanning(false);
      setScanProgress(0);
      setScanController(null);
      toast.info('Scan stopped', { description: 'Router scan was cancelled' });
    }
  };

  // ---------------- Fix Single Vulnerability ----------------
  const handleFix = async (vulnId: string) => {
    if (!checkAuthentication()) {
      setShowLoginModal(true);
      return;
    }

    setIsFixing(vulnId);
    
    try {
      const token = getAuthToken();
      const res = await axios.post(`http://127.0.0.1:5000/api/fix-vulnerability/${vulnId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 'success') {
        // Update vulnerability status
        setVulnerabilities(prev => 
          prev.map(v => v.id === vulnId ? { ...v, status: 'fixed' } : v)
        );

        // Show password modal for default credentials
        if (vulnId.includes('default-creds')) {
          const newPassword = res.data.new_password || res.data.details?.new_password;
          
          if (newPassword) {
            setNewRouterPassword(newPassword);
            setShowPasswordModal(true);
          } else {
            toast.success('Security Fix Applied', { 
              description: res.data.message 
            });
          }
        } else {
          toast.success('Security Fix Applied', { 
            description: res.data.message 
          });
        }
      } else {
        throw new Error(res.data.message || 'Fix failed');
      }
    } catch (error: any) {
      toast.error('Fix failed', { 
        description: error.response?.data?.message || 'Unable to apply security fix' 
      });
    } finally {
      setIsFixing(null);
    }
  };

  // ---------------- Manual Fix ----------------
  const handleManualFix = (vuln: Vulnerability) => {
    toast.info('Manual Fix Required', {
      description: (
        <div className="space-y-2">
          <p className="font-semibold">{vuln.title}</p>
          <p className="text-sm">{vuln.description}</p>
          {vuln.recommendation && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <strong>Manual Steps:</strong> {vuln.recommendation}
            </div>
          )}
          <Button 
            size="sm" 
            className="mt-2"
            onClick={() => window.open(`/guides/router-security`, '_blank')}
          >
            <Settings className="h-3 w-3 mr-1" />
            View Security Guide
          </Button>
        </div>
      ),
      duration: 15000
    });
  };

  // ---------------- Fix All Vulnerabilities ----------------
  const handleFixAll = async () => {
    if (!checkAuthentication()) {
      setShowLoginModal(true);
      return;
    }

    const fixable = vulnerabilities.filter(v => v.fixable && v.status === 'open');
    
    if (fixable.length === 0) {
      toast.info('No fixable vulnerabilities', { 
        description: 'All issues require manual intervention or are already fixed' 
      });
      return;
    }

    try {
      const token = getAuthToken();
      toast.info(`Fixing ${fixable.length} vulnerabilities...`);

      const res = await axios.post('http://127.0.0.1:5000/api/fix-all-router-vulnerabilities', {
        vulnerabilities: fixable
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 'success') {
        setVulnerabilities(prev => 
          prev.map(v => 
            fixable.some(f => f.id === v.id) ? { ...v, status: 'fixed' } : v
          )
        );
        
        toast.success('Batch fix completed', { 
          description: res.data.message || `Fixed ${res.data.results?.successful_fixes || 0} vulnerabilities` 
        });
      } else {
        throw new Error(res.data.message || 'Batch fix failed');
      }
    } catch (error: any) {
      console.error('Batch fix error:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed', { 
          description: 'Please log in again' 
        });
        setIsAuthenticated(false);
        setShowLoginModal(true);
      } else {
        toast.error('Batch fix failed', { 
          description: error.response?.data?.message || 'Unable to fix all vulnerabilities' 
        });
      }
    }
  };

  // ---------------- Generate PDF Report ----------------
  const generateReport = async () => {
    if (!checkAuthentication()) {
      setShowLoginModal(true);
      return;
    }

    try {
      const token = getAuthToken();
      
      toast.info('Generating security report...');
      
      const response = await axios.get('http://127.0.0.1:5000/api/router-security-report', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create blob URL for download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `router-security-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded', { 
        description: 'PDF security report has been generated' 
      });
    } catch (error: any) {
      console.error('Report generation error:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed', { 
          description: 'Please log in to generate report' 
        });
        setIsAuthenticated(false);
        setShowLoginModal(true);
      } else {
        // Fallback to JSON report if PDF fails
        generateJSONReport();
      }
    }
  };

  // Fallback JSON report
  const generateJSONReport = () => {
    const reportData = {
      routerInfo,
      vulnerabilities,
      scanDate: new Date().toISOString(),
      summary: {
        total: vulnerabilities.length,
        open: openVulns,
        fixed: fixedVulns,
        critical: criticalVulns
      }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `router-security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded', { 
      description: 'JSON security report has been generated (PDF generation failed)' 
    });
  };

  // Load initial router info
  useEffect(() => {
    if (!routerInfo) {
      setRouterInfo({
        name: 'Home Router',
        model: 'ASUS AX6000',
        ip: '192.168.1.1',
        mac: '88:D7:F6:XX:XX:XX',
        firmware: '3.0.0.4.388.23285',
        status: 'online',
        lastScan: 'Never',
        uptime: '15 days, 4 hours'
      });
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Login Required</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to access router security features
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex-1"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>
                
                <Button
                  onClick={handleQuickLogin}
                  disabled={isLoggingIn}
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Login
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Default credentials: <strong>admin</strong> / <strong>admin</strong>
                </p>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold">Router Password Updated</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your router admin password has been changed for security. Please save this new password:
              </p>
              
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-2">New Admin Password:</p>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <code className="text-lg font-mono font-bold text-green-700">
                    {newRouterPassword}
                  </code>
                  <Button 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(newRouterPassword);
                      toast.success('Password copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important:</strong> Save this password securely! You will need it to access your router settings.
                </p>
              </div>

              <Button 
                onClick={() => setShowPasswordModal(false)}
                className="w-full"
                variant="default"
              >
                I've Saved My Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header + Scan Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Router Security</h1>
          <p className="text-muted-foreground text-sm">Gateway protection and vulnerability management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isAuthenticated ? (
            <Button onClick={() => setShowLoginModal(true)} variant="cyber">
              <LogIn className="h-4 w-4 mr-2"/>
              Login to Scan
            </Button>
          ) : isScanning ? (
            <Button onClick={handleStopScan} variant="destructive">
              <X className="h-4 w-4 mr-2"/>
              Stop Scan
            </Button>
          ) : (
            <Button onClick={handleScan} variant="cyber">
              <Scan className="h-4 w-4 mr-2"/>
              Scan Router
            </Button>
          )}
          
          <Button 
            onClick={handleFixAll} 
            variant="success" 
            disabled={openVulns === 0 || isScanning || !isAuthenticated}
          >
            <Zap className="h-4 w-4 mr-1"/>
            Fix All ({openVulns})
          </Button>
          
          <Button 
            onClick={generateReport} 
            variant="outline"
            disabled={isScanning || !isAuthenticated}
          >
            <Download className="h-4 w-4 mr-1"/>
            Report
          </Button>

          {isAuthenticated && (
            <Button 
              onClick={handleLogout} 
              variant="ghost"
              size="sm"
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Authentication Status */}
      {isAuthenticated && (
        <Card className="neon-border bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Authenticated</h3>
                  <p className="text-sm text-green-700">
                    You are logged in and can scan your router for security vulnerabilities.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Progress */}
      {isScanning && (
        <Card className="neon-border bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Scanning Router...</span>
              </div>
              <span className="text-sm text-muted-foreground">{scanProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Router Info */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Router className="h-5 w-5 mr-2"/> 
            Router Overview
            {criticalVulns > 0 && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1"/>
                {criticalVulns} Critical
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">Name & Model</div>
              <div className="font-medium">{routerInfo?.name ?? 'Home Router'}</div>
              <div className="text-sm text-muted-foreground">{routerInfo?.model ?? 'ASUS AX6000'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">IP & MAC</div>
              <div className="font-medium">{routerInfo?.ip ?? '192.168.1.1'}</div>
              <div className="text-sm text-muted-foreground">{routerInfo?.mac ?? '88:D7:F6:XX:XX:XX'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status & Uptime</div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success"/>
                <span className="font-medium text-success">{routerInfo?.status ?? 'online'}</span>
              </div>
              <div className="text-sm text-muted-foreground">{routerInfo?.uptime ?? '15 days, 4 hours'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Firmware & Last Scan</div>
              <div className="font-medium">{routerInfo?.firmware ?? '3.0.0.4.388.23285'}</div>
              <div className="text-sm text-muted-foreground">Last scan: {routerInfo?.lastScan ?? 'Never'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neon-border bg-card/80 text-center p-6">
          <div className="text-3xl font-bold text-destructive">{openVulns}</div>
          <div className="text-sm text-muted-foreground">Open Vulnerabilities</div>
        </Card>
        <Card className="neon-border bg-card/80 text-center p-6">
          <div className="text-3xl font-bold text-success">{fixedVulns}</div>
          <div className="text-sm text-muted-foreground">Fixed Issues</div>
        </Card>
        <Card className="neon-border bg-card/80 text-center p-6">
          <div className="text-3xl font-bold text-warning">{criticalVulns}</div>
          <div className="text-sm text-muted-foreground">Critical Issues</div>
        </Card>
        <Card className="neon-border bg-card/80 text-center p-6">
          <div className="text-3xl font-bold text-primary">
            {vulnerabilities.length ? Math.round((fixedVulns/vulnerabilities.length)*100) : 100}%
          </div>
          <div className="text-sm text-muted-foreground">Security Score</div>
        </Card>
      </div>

      {/* Vulnerabilities List */}
      <Card className="neon-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2"/>
            Detected Vulnerabilities
            <Badge variant="outline" className="ml-2">{openVulns} Open</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vulnerabilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
              <p>No vulnerabilities detected</p>
              <p className="text-sm">
                {isAuthenticated 
                  ? 'Run a scan to check for security issues' 
                  : 'Login and run a scan to check for security issues'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vulnerabilities.map((vulnerability) => (
                <div
                  key={vulnerability.id}
                  className={`p-4 rounded-lg border ${
                    vulnerability.status === 'fixed' 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getSeverityIcon(vulnerability.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{vulnerability.title}</h3>
                          <Badge variant={getSeverityBadge(vulnerability.severity)}>
                            {vulnerability.severity}
                          </Badge>
                          {vulnerability.status === 'fixed' && (
                            <Badge variant="success" className="bg-success/20 text-success">
                              <CheckCircle className="h-3 w-3 mr-1"/>
                              Fixed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {vulnerability.description}
                        </p>
                        {vulnerability.evidence && (
                          <div className="mt-1 p-2 bg-yellow-50 rounded text-xs">
                            <strong>Evidence:</strong> {vulnerability.evidence}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center">
                            <Wifi className="h-3 w-3 mr-1"/>
                            {vulnerability.category}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1"/>
                            Risk Level: {vulnerability.riskLevel}/10
                          </span>
                        </div>
                        {vulnerability.recommendation && vulnerability.status === 'open' && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <strong>Recommendation:</strong> {vulnerability.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {vulnerability.status === 'open' && (
                        <>
                          {vulnerability.fixable ? (
                            <Button
                              size="sm"
                              onClick={() => handleFix(vulnerability.id)}
                              disabled={isFixing === vulnerability.id || isScanning || !isAuthenticated}
                              variant="success"
                            >
                              {isFixing === vulnerability.id ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Zap className="h-3 w-3 mr-1" />
                              )}
                              Auto Fix
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManualFix(vulnerability)}
                              disabled={isScanning}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Manual Fix
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}