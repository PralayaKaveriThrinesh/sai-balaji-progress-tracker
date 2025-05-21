
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, Truck, User, BarChart, Key, Database, 
  FolderKanban, CreditCard, CheckSquare, History,
  FilePlus, FileCheck, DollarSign, FileText
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
}

export const Sidebar = ({ open, setOpen, className }: SidebarProps) => {
  const { role } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Add isActive function to check if a route is active
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Define menu items based on role
  const menuItems = {
    leader: [
      { name: t('dashboard'), path: "/leader", icon: <Home className="h-4 w-4" /> },
      { name: t('createProject'), path: "/leader/create-project", icon: <FilePlus className="h-4 w-4" /> },
      { name: t('addProgress'), path: "/leader/add-progress", icon: <FileText className="h-4 w-4" /> },
      { name: t('viewProgress'), path: "/leader/view-progress", icon: <FileCheck className="h-4 w-4" /> },
      { name: t('requestPayment'), path: "/leader/request-payment", icon: <DollarSign className="h-4 w-4" /> },
      { name: t('viewPayment'), path: "/leader/view-payment", icon: <CreditCard className="h-4 w-4" /> }
    ],
    checker: [
      { name: t('dashboard'), path: "/checker", icon: <Home className="h-4 w-4" /> },
      { name: t('reviewSubmissions'), path: "/checker/review-submissions", icon: <CheckSquare className="h-4 w-4" /> },
      { name: t('reviewHistory'), path: "/checker/review-history", icon: <History className="h-4 w-4" /> },
      { name: t('projects'), path: "/checker/projects", icon: <FolderKanban className="h-4 w-4" /> }
    ],
    owner: [
      { name: t('dashboard'), path: "/owner", icon: <Home className="h-4 w-4" /> },
      { name: t('paymentQueue'), path: "/owner/payment-queue", icon: <CreditCard className="h-4 w-4" /> },
      { name: t('projects'), path: "/owner/projects", icon: <FolderKanban className="h-4 w-4" /> },
      { name: t('statistics'), path: "/owner/statistics", icon: <BarChart className="h-4 w-4" /> },
      { name: t('backup'), path: "/owner/backup", icon: <Database className="h-4 w-4" /> }
    ],
    admin: [
      { name: t('dashboard'), path: "/admin", icon: <Home className="h-4 w-4" /> },
      { name: t('manageCredentials'), path: "/admin/credentials", icon: <Key className="h-4 w-4" /> },
      { name: t('manageVehicles'), path: "/admin/vehicles", icon: <Truck className="h-4 w-4" /> },
      { name: t('manageDrivers'), path: "/admin/drivers", icon: <User className="h-4 w-4" /> },
      { name: t('statistics'), path: "/admin/statistics", icon: <BarChart className="h-4 w-4" /> }
    ]
  };

  // Get current role's menu items
  const currentMenuItems = role ? menuItems[role as keyof typeof menuItems] : [];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 w-64 bg-sidebar border-r border-border pt-14 z-30 h-full transition-transform duration-200 ease-in-out transform",
        "backdrop-blur-sm shadow-lg shadow-sidebar/10",
        className
      )}
    >
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        <div className="mb-4 border-b pb-4 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-xl text-white">{t('navigation')}</span>
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

        {/* Menu items for the current role */}
        <div className="flex flex-col space-y-1">
          {currentMenuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => isMobile && setOpen(false)}
            >
              <Button
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all gap-3",
                  isActive(item.path) 
                    ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
                    : "hover:bg-white/20 hover:text-white"
                )}
              >
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
