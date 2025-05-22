
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/theme-provider';
import { LanguageProvider } from './context/language-context';
import { AuthProvider } from './context/auth-context';
import { Toaster } from './components/ui/sonner';
import { initToastSwipeSupport } from './utils/toast-swipe';

// Initialize toast swipe support
initToastSwipeSupport();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
