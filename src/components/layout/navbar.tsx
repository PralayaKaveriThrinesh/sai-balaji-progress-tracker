
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-provider";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon } from "lucide-react";

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-card shadow-sm z-40">
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
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
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
