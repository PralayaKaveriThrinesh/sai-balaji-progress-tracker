
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeStorage } from '@/lib/storage';

// Initialize storage on first load
initializeStorage();

createRoot(document.getElementById("root")!).render(<App />);
