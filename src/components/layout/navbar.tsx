import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { useLanguage } from '@/context/language-context';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Languages, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '../shared/language-switcher';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    document.body.classList.toggle('sidebar-open');
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    document.body.classList.remove('sidebar-open');
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const isRouteActive = (route: string): boolean => {
    return location.pathname.startsWith(route);
  };

  return (
    <>
      <nav className="bg-background border-b sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between">
          {/* Mobile menu button */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate through the application.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                {isAuthenticated && user ? (
                  <>
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/admin') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('adminDashboard')}</span>
                        </Link>
                        <Link to="/admin/credentials" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/admin/credentials') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('manageCredentials')}</span>
                        </Link>
                        <Link to="/admin/statistics" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/admin/statistics') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('viewStatistics')}</span>
                        </Link>
                      </>
                    )}
                    {user.role === 'leader' && (
                      <>
                        <Link to="/leader" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/leader') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('leaderDashboard')}</span>
                        </Link>
                        <Link to="/leader/create-project" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/leader/create-project') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('createProject')}</span>
                        </Link>
                        <Link to="/leader/request-payment" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/leader/request-payment') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('requestPayment')}</span>
                        </Link>
                        <Link to="/leader/view-payment" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/leader/view-payment') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('viewPayments')}</span>
                        </Link>
                        <Link to="/leader/progress" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/leader/progress') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('progressUpdates')}</span>
                        </Link>
                      </>
                    )}
                    {user.role === 'checker' && (
                      <>
                        <Link to="/checker" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/checker') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('checkerDashboard')}</span>
                        </Link>
                        <Link to="/checker/corrections" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/checker/corrections') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                          <span>{t('viewCorrections')}</span>
                        </Link>
                      </>
                    )}
                    {user.role === 'owner' && (
                      <Link to="/owner" className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary ${isRouteActive('/owner') ? 'bg-secondary' : ''}`} onClick={closeSidebar}>
                        <span>{t('ownerDashboard')}</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={closeSidebar}>{t('login')}</Link>
                    <Link to="/register" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={closeSidebar}>{t('register')}</Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo or Brand */}
          <Link to="/" className="ml-4 md:ml-8 text-xl font-bold">
            {t('appName')}
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4 mr-4 md:mr-8">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Authentication Links */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>{t('profile')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:underline">{t('login')}</Link>
                <Link to="/register" className="text-sm hover:underline">{t('register')}</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
