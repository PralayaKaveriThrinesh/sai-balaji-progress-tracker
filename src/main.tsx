
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initializeStorage } from '@/lib/storage';
import { ThemeProvider } from '@/context/theme-provider';
import { LanguageProvider } from '@/context/language-context';

// Initialize storage on first load
initializeStorage();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);
