
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { Home, Truck, User, BarChart, Key, Database, FolderKanban, CreditCard } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
}

export const Sidebar = ({ open, setOpen, className }: SidebarProps) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobile();

  // Add isActive function to check if a route is active
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminItems = [
    { name: "Dashboard", path: "/admin", icon: <Home className="h-4 w-4" /> },
    { name: "Vehicles", path: "/admin/vehicles", icon: <Truck className="h-4 w-4" /> },
    { name: "Drivers", path: "/admin/drivers", icon: <User className="h-4 w-4" /> },
    { name: "Statistics", path: "/admin/statistics", icon: <BarChart className="h-4 w-4" /> },
    { name: "Credentials", path: "/admin/credentials", icon: <Key className="h-4 w-4" /> },
    { name: "Backup", path: "/admin/backup", icon: <Database className="h-4 w-4" /> }
  ];

  const ownerItems = [
    { name: "Dashboard", path: "/owner", icon: <Home className="h-4 w-4" /> },
    { name: "Projects", path: "/owner/projects", icon: <FolderKanban className="h-4 w-4" /> },
    { name: "Statistics", path: "/owner/statistics", icon: <BarChart className="h-4 w-4" /> },
    { name: "Payment Queue", path: "/owner/payment-queue", icon: <CreditCard className="h-4 w-4" /> },
    { name: "Backup", path: "/owner/backup", icon: <Database className="h-4 w-4" /> }
  ];

  const renderLeaderMenu = () => (
    <div className="flex flex-col space-y-2">
      <Link to="/leader" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/leader') ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start rounded-lg text-sm font-medium transition-all",
            isActive('/leader') 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
              : "hover:bg-white/20 hover:text-white"
          )}
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/leader/create-project" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/leader/create-project') ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start rounded-lg text-sm font-medium transition-all",
            isActive('/leader/create-project') 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
              : "hover:bg-white/20 hover:text-white"
          )}
        >
          Create Project
        </Button>
      </Link>
      
      <Link to="/leader/add-progress" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/leader/add-progress') ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start rounded-lg text-sm font-medium transition-all",
            isActive('/leader/add-progress') 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
              : "hover:bg-white/20 hover:text-white"
          )}
        >
          Add Progress
        </Button>
      </Link>
      
      <Link to="/leader/view-progress" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/leader/view-progress') ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start rounded-lg text-sm font-medium transition-all",
            isActive('/leader/view-progress') 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
              : "hover:bg-white/20 hover:text-white"
          )}
        >
          View Progress
        </Button>
      </Link>
      
      <Link to="/leader/request-payment" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/leader/request-payment') ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start rounded-lg text-sm font-medium transition-all",
            isActive('/leader/request-payment') 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
              : "hover:bg-white/20 hover:text-white"
          )}
        >
          Request Payment
        </Button>
      </Link>
      
      <Link to="/leader/view-payment" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/leader/view-payment') ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start rounded-lg text-sm font-medium transition-all",
            isActive('/leader/view-payment') 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
              : "hover:bg-white/20 hover:text-white"
          )}
        >
          View Payments
        </Button>
      </Link>
    </div>
  );

  const renderCheckerMenu = () => (
    <div className="flex flex-col space-y-1">
      <Link to="/checker" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/checker') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/checker/review-submissions" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/checker/review-submissions') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Review Submissions
        </Button>
      </Link>
      
      <Link to="/checker/review-history" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/checker/review-history') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Review History
        </Button>
      </Link>
      
      <Link to="/checker/projects" onClick={() => setOpen(false)}>
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
      <Link to="/owner" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/owner') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/owner/payment-queue" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/owner/payment-queue') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Payment Queue
        </Button>
      </Link>
      
      <Link to="/owner/projects" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/owner/projects') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          View Projects
        </Button>
      </Link>
      
      <Link to="/owner/statistics" onClick={() => setOpen(false)}>
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
      <Link to="/admin" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/admin') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Dashboard
        </Button>
      </Link>
      
      <Link to="/admin/credentials" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/admin/credentials') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Manage Credentials
        </Button>
      </Link>
      
      <Link to="/admin/vehicles" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/admin/vehicles') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Manage Vehicles
        </Button>
      </Link>
      
      <Link to="/admin/drivers" onClick={() => setOpen(false)}>
        <Button
          variant={isActive('/admin/drivers') ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          Manage Drivers
        </Button>
      </Link>
      
      <Link to="/admin/statistics" onClick={() => setOpen(false)}>
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
        "backdrop-blur-sm shadow-lg shadow-sidebar/10",
        open ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        <div className="mb-4 border-b pb-4 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-xl text-white">Navigation</span>
            {/* Close button for mobile */}
            <Button
              variant="ghost" 
              size="icon"
              className="lg:hidden text-white hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Menu based on user role */}
        {role === 'leader' && renderLeaderMenu()}
        {role === 'checker' && renderCheckerMenu()}
        {role === 'owner' && renderOwnerMenu()}
        {role === 'admin' && renderAdminMenu()}
      </div>
    </aside>
  );
};
