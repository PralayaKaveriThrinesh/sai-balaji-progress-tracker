
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
            data-sidebar-toggle
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-primary">Sai Balaji</span>
            <span className="hidden md:block text-muted-foreground">Progress Tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </Button>

          {/* User Menu (Mobile) */}
          <div className="relative md:hidden">
            <Button 
              variant="outline" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {user?.name?.split(' ')[0] || 'User'}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Signed in as <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={logout}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || 'User'} ({user?.role})
            </span>
            <Button variant="outline" onClick={logout} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
