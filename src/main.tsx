import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from '@/components/ThemeProvider'
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from './context/SocketContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import AppContextProvider from './context/AppContext.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <AuthProvider>
            <AppContextProvider>
              <App />
            </AppContextProvider>
          </AuthProvider>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);
