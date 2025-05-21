
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { toast } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fix for mobile view
  useEffect(() => {
    // Close sidebar when clicking outside of it on mobile
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar');
      const toggleButton = document.querySelector('[data-sidebar-toggle]');
      
      if (
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        toggleButton && 
        !toggleButton.contains(e.target as Node) &&
        window.innerWidth < 1024 // Only on mobile
      ) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add a class to body when sidebar is open on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      if (sidebarOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    toast.dismiss(); // Dismiss any open toasts to prevent UI clutter
  };

  // Don't show sidebar and navbar if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          className={`sidebar fixed lg:hidden z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        />
        <main 
          className={cn(
            "flex-1 pt-14 transition-all duration-200 ease-in-out w-full", // Reduced padding to remove space
            "animate-fade-in",
            sidebarOpen && window.innerWidth < 1024 ? "opacity-50 pointer-events-none" : "opacity-100 pointer-events-auto"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
