import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; background: red; color: white;">Root element not found!</div>';
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  )
}
