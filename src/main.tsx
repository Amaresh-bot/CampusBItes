import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { UserProvider } from './context/UserContext.tsx';
import './index.css';

console.log("VITE_SUPABASE_URL:", !!(import.meta as any).env?.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
);



