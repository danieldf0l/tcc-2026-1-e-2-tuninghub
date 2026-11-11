import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { ConfirmProvider } from './contexts/ConfirmContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/base.css';
import './styles/theme.css';
import './styles/crud.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);