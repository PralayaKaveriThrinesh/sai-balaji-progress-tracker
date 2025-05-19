
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
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
  };

  // Don't show sidebar and navbar if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background bg-hero-pattern">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          className={`sidebar fixed lg:sticky z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        />
        <main 
          className={cn(
            "flex-1 p-4 transition-all duration-200 ease-in-out w-full pt-16",
            "animate-fade-in",
            sidebarOpen && window.innerWidth < 1024 ? "pointer-events-none" : "pointer-events-auto"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
