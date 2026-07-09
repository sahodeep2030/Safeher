import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { EmergencyProvider } from './context/EmergencyContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmergencyProvider>
      <App />
    </EmergencyProvider>
  </StrictMode>,
);
