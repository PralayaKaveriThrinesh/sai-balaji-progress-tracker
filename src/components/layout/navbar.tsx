
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { 
  Menu, Sun, Moon, ChevronDown, Languages, 
  User as UserIcon, 
  LogOut, Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-card shadow-md z-40 backdrop-blur-sm border-b border-border/30">
      <div className="container mx-auto flex justify-between items-center py-2 px-4">
        {/* Left section - Logo and menu toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 text-foreground"
            onClick={toggleSidebar}
            data-sidebar-toggle
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl gradient-text-animated">Sai Balaji</span>
            <span className="hidden md:block text-muted-foreground">Progress Tracker</span>
          </div>
        </div>

        {/* Center section - Navigation items */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto pb-1">
          {user?.role === 'leader' && (
            <>
              <Link to="/leader">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('dashboard')}</Button>
              </Link>
              <Link to="/leader/create-project">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('createProject')}</Button>
              </Link>
              <Link to="/leader/add-progress">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('addProgress')}</Button>
              </Link>
              <Link to="/leader/view-progress">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('viewProgress')}</Button>
              </Link>
            </>
          )}
          
          {user?.role === 'checker' && (
            <>
              <Link to="/checker">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('dashboard')}</Button>
              </Link>
              <Link to="/checker/review-submissions">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('reviewSubmissions')}</Button>
              </Link>
              <Link to="/checker/review-history">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('reviewHistory')}</Button>
              </Link>
              <Link to="/checker/projects">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('projects')}</Button>
              </Link>
            </>
          )}
          
          {user?.role === 'owner' && (
            <>
              <Link to="/owner">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('dashboard')}</Button>
              </Link>
              <Link to="/owner/payment-queue">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('paymentQueue')}</Button>
              </Link>
              <Link to="/owner/projects">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('projects')}</Button>
              </Link>
              <Link to="/owner/statistics">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('statistics')}</Button>
              </Link>
              <Link to="/owner/backup">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('backup')}</Button>
              </Link>
            </>
          )}
          
          {user?.role === 'admin' && (
            <>
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('dashboard')}</Button>
              </Link>
              <Link to="/admin/credentials">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('manageCredentials')}</Button>
              </Link>
              <Link to="/admin/vehicles">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('manageVehicles')}</Button>
              </Link>
              <Link to="/admin/drivers">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">{t('manageDrivers')}</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Right section - User controls */}
        <div className="flex items-center gap-2">
          {/* Language Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full"
              >
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLanguages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "cursor-pointer",
                    language === lang.code && "bg-primary/10 font-medium"
                  )}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "rounded-full",
              theme === 'dark' 
                ? "bg-accent text-accent-foreground hover:bg-accent/80" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-full pl-2 pr-3 border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {user.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm hidden sm:inline-block">
                    {user.name?.split(' ')[0] || t('user')}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {t('role')}: {t(user.role)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
