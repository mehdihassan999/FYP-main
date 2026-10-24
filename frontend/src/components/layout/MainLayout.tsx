





import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CyberSidebar } from './CyberSidebar';
import { TopBar } from './TopBar';
import { Outlet } from 'react-router-dom';

interface MainLayoutProps {
  username: string;
  networkType: 'home' | 'company' | 'education';
  onLogout: () => void;
}

export function MainLayout({ username, networkType, onLogout }: MainLayoutProps) {
  const [currentMode, setCurrentMode] = useState<'normal' | 'root'>('normal');
  const [isMonitoring, setIsMonitoring] = useState(false);

  const handleModeChange = (mode: 'normal' | 'root') => setCurrentMode(mode);
  const handleToggleMonitoring = () => setIsMonitoring(!isMonitoring);
  const handleStartScan = () => console.log('Starting security scan');
  const handleStopScan = () => console.log('Stopping security scan');

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        {/* Sidebar */}
        <CyberSidebar currentMode={currentMode} onLogout={onLogout} />

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar
            currentMode={currentMode}
            networkType={networkType}
            onModeChange={handleModeChange}
            username={username}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="h-full p-3 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 h-full">
                
                {/* Main Content Area - now full width */}
                <div className="col-span-full w-full space-y-4 sm:space-y-6 p-6">
                  <Outlet />
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}




















