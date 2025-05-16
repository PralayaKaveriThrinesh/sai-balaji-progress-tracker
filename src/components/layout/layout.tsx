
import React, { useState, useEffect } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
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

  // Fix for page content being hidden under sidebar
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      if (sidebarOpen && window.innerWidth < 1024) {
        // Add margin on mobile when sidebar is open
        main.classList.add('ml-0');
      } else if (window.innerWidth >= 1024) {
        // On desktop, always have margin
        main.classList.add('lg:ml-64');
      }
    }
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          className="sidebar z-50"
        />
        <main 
          className={cn(
            "flex-1 p-4 transition-all duration-200 ease-in-out",
            sidebarOpen ? "lg:ml-64" : ""
          )}
          style={{
            marginLeft: sidebarOpen && window.innerWidth >= 1024 ? '16rem' : '0'
          }}
        >
          <div className="pt-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
