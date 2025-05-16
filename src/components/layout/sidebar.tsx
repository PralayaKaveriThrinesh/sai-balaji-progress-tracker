
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  className?: string;
}

export function Sidebar({ isOpen, toggleSidebar, className }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Check if the current route matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderLeaderMenu = () => (
    <div className="flex flex-col space-y-1">
      <Link to="/leader" onClick={toggleSidebar}>
        <Button
          variant={isActive('/leader') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/leader/create-project" onClick={toggleSidebar}>
        <Button
          variant={isActive('/leader/create-project') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Create Project
        </Button>
      </Link>
      
      <Link to="/leader/add-progress" onClick={toggleSidebar}>
        <Button
          variant={isActive('/leader/add-progress') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Add Progress
        </Button>
      </Link>
      
      <Link to="/leader/view-progress" onClick={toggleSidebar}>
        <Button
          variant={isActive('/leader/view-progress') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          View Progress
        </Button>
      </Link>
      
      <Link to="/leader/request-payment" onClick={toggleSidebar}>
        <Button
          variant={isActive('/leader/request-payment') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Request Payment
        </Button>
      </Link>
      
      <Link to="/leader/view-payment" onClick={toggleSidebar}>
        <Button
          variant={isActive('/leader/view-payment') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          View Payments
        </Button>
      </Link>
    </div>
  );

  const renderCheckerMenu = () => (
    <div className="flex flex-col space-y-1">
      <Link to="/checker" onClick={toggleSidebar}>
        <Button
          variant={isActive('/checker') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/checker/review-submissions" onClick={toggleSidebar}>
        <Button
          variant={isActive('/checker/review-submissions') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Review Submissions
        </Button>
      </Link>
      
      <Link to="/checker/review-history" onClick={toggleSidebar}>
        <Button
          variant={isActive('/checker/review-history') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Review History
        </Button>
      </Link>
      
      <Link to="/checker/projects" onClick={toggleSidebar}>
        <Button
          variant={isActive('/checker/projects') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          View Projects
        </Button>
      </Link>
    </div>
  );

  const renderOwnerMenu = () => (
    <div className="flex flex-col space-y-1">
      <Link to="/owner" onClick={toggleSidebar}>
        <Button
          variant={isActive('/owner') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/owner/payment-queue" onClick={toggleSidebar}>
        <Button
          variant={isActive('/owner/payment-queue') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Payment Queue
        </Button>
      </Link>
      
      <Link to="/owner/projects" onClick={toggleSidebar}>
        <Button
          variant={isActive('/owner/projects') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          View Projects
        </Button>
      </Link>
      
      <Link to="/owner/statistics" onClick={toggleSidebar}>
        <Button
          variant={isActive('/owner/statistics') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Statistics
        </Button>
      </Link>
    </div>
  );

  const renderAdminMenu = () => (
    <div className="flex flex-col space-y-1">
      <Link to="/admin" onClick={toggleSidebar}>
        <Button
          variant={isActive('/admin') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/admin/credentials" onClick={toggleSidebar}>
        <Button
          variant={isActive('/admin/credentials') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Manage Credentials
        </Button>
      </Link>
      
      <Link to="/admin/vehicles" onClick={toggleSidebar}>
        <Button
          variant={isActive('/admin/vehicles') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Manage Vehicles
        </Button>
      </Link>
      
      <Link to="/admin/drivers" onClick={toggleSidebar}>
        <Button
          variant={isActive('/admin/drivers') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Manage Drivers
        </Button>
      </Link>
      
      <Link to="/admin/statistics" onClick={toggleSidebar}>
        <Button
          variant={isActive('/admin/statistics') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Statistics
        </Button>
      </Link>
    </div>
  );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-border pt-16 z-20 transition-transform duration-200 ease-in-out transform lg:transform-none lg:relative",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        <div className="mb-4 border-b pb-4 border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-xl">Navigation</span>
            {/* Close button for mobile */}
            <Button
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Menu based on user role */}
        {user?.role === 'leader' && renderLeaderMenu()}
        {user?.role === 'checker' && renderCheckerMenu()}
        {user?.role === 'owner' && renderOwnerMenu()}
        {user?.role === 'admin' && renderAdminMenu()}
      </div>
    </aside>
  );
}
