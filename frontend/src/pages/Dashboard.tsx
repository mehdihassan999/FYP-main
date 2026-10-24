import { useNavigate } from 'react-router-dom';
import { SecuritySummary } from '@/components/dashboard/SecuritySummary';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleQuickScan = () => {
    toast.success('Security scan initiated', {
      description: 'Full network scan started - check terminal for progress',
    });
    console.log('Starting quick security scan');
  };

  const handleViewDetails = (section: string) => {
    console.log(`Navigating to ${section} details`);
    
    switch (section) {
      case 'network':
        toast.info('Network overview', {
          description: 'Opening network status dashboard',
        });
        break;
      case 'devices':
        navigate('/devices');
        break;
      case 'vulnerabilities':
        toast.info('Vulnerability analysis', {
          description: 'Loading detailed vulnerability report',
        });
        break;
      case 'router':
        navigate('/router');
        break;
      default:
        console.log('Unknown section:', section);
    }
  };

  return (
    <div className="space-y-6">
      <SecuritySummary
        onQuickScan={handleQuickScan}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}