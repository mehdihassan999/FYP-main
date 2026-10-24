


// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useState } from "react";
// import Index from "./pages/Index";
// import Dashboard from "./pages/Dashboard";
// import AuthPage from "./pages/AuthPage";
// import NotFound from "./pages/NotFound";
// import RouterPanel from "./pages/RouterPanel";
// import DevicesPanel from "./pages/DevicePanel";
// import MyDevicePanel from "./pages/MyDevicePanel";
// import MonitoringPanel from "./pages/MonitoringPanel";
// import ReportsPanel from "./pages/ReportsPanel";
// import SettingsPanel from "./pages/SettingsPanel";
// import { MainLayout } from "./components/layout/MainLayout";

// const queryClient = new QueryClient();

// interface User {
//   username: string;
//   email: string;
//   networkType: 'home' | 'company' | 'education';
// }

// const App = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const handleAuthSuccess = (userData: User) => {
//     setUser(userData);
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <BrowserRouter>
//           {!isAuthenticated || !user ? (
//             <AuthPage onAuthSuccess={handleAuthSuccess} />
//           ) : (
//             <MainLayout
//               username={user.username}
//               networkType={user.networkType}
//               onLogout={handleLogout}
//             >
//               <Routes>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/router" element={<RouterPanel />} />
//                 <Route path="/devices" element={<DevicesPanel />} />
//                 <Route path="/my-device" element={<MyDevicePanel />} />
//                 <Route path="/monitoring" element={<MonitoringPanel />} />
//                 <Route path="/reports" element={<ReportsPanel />} />
//                 <Route path="/settings" element={<SettingsPanel />} />
//                 <Route path="*" element={<NotFound />} />
//               </Routes>
//             </MainLayout>
//           )}
//         </BrowserRouter>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

// export default App;














// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useState } from "react";
// import Dashboard from "./pages/Dashboard";
// import AuthPage from "./pages/Authpage";
// import NotFound from "./pages/NotFound";
// import RouterPanel from "./pages/RouterPanel";
// import DevicesPanel from "./pages/DevicePanel";
// import MyDevicePanel from "./pages/MyDevicesPanel";
// import MonitoringPanel from "./pages/MonitoringPanel";
// import ReportsPanel from "./pages/ReportsPanel";
// import SettingsPanel from "./pages/SettingsPanel";
// import { MainLayout } from "./components/layout/MainLayout";

// const queryClient = new QueryClient();

// interface User {
//   username: string;
//   email: string;
//   networkType: 'home' | 'company' | 'education';
// }

// const App = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const handleAuthSuccess = (userData: User) => {
//     setUser(userData);
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <BrowserRouter>
//           {!isAuthenticated || !user ? (
//             <AuthPage onAuthSuccess={handleAuthSuccess} />
//           ) : (
//             <Routes>
//               {/* All routes under MainLayout */}
//               <Route
//                 path="/"
//                 element={
//                   <MainLayout
//                     username={user.username}
//                     networkType={user.networkType}
//                     onLogout={handleLogout}
//                   />
//                 }
//               >
//                 <Route index element={<Dashboard />} />
//                 <Route path="router" element={<RouterPanel />} />
//                 <Route path="devices" element={<DevicesPanel />} />
//                 <Route path="my-device" element={<MyDevicePanel />} />
//                 <Route path="monitoring" element={<MonitoringPanel />} />
//                 <Route path="reports" element={<ReportsPanel />} />
//                 <Route path="settings" element={<SettingsPanel />} />
//                 {/* <Route path="*" element={<NotFound />} /> */}
//               </Route>

//               {/* Redirect any unknown path to dashboard if logged in */}
//               <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//           )}
//         </BrowserRouter>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

// export default App;








import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import RouterPanel from "./pages/RouterPanel";
import DevicesPanel from "./pages/DevicePanel";
import MyDevicePanel from "./pages/MyDevicesPanel";
import MonitoringPanel from "./pages/MonitoringPanel";
import ReportsPanel from "./pages/ReportsPanel";
import SettingsPanel from "./pages/SettingsPanel";
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* All routes under MainLayout */}
            <Route
              path="/"
              element={
                <MainLayout
                  username="User" // You can set a default username or get it from elsewhere
                  networkType="home" // Set default network type
                  onLogout={() => {}} // Empty function since no logout needed
                />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="router" element={<RouterPanel />} />
              <Route path="devices" element={<DevicesPanel />} />
              <Route path="my-device" element={<MyDevicePanel />} />
              <Route path="monitoring" element={<MonitoringPanel />} />
              <Route path="reports" element={<ReportsPanel />} />
              <Route path="settings" element={<SettingsPanel />} />
            </Route>

            {/* Optional: Add a catch-all route for unknown paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

