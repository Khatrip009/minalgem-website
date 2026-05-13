import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// GitHub Pages BrowserRouter refresh fix
const redirect = sessionStorage.redirect;

delete sessionStorage.redirect;

if (redirect && redirect !== location.href) {
  history.replaceState(null, null, redirect);
}

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => console.log('✅ Service Worker registered', reg))
    .catch((err) =>
      console.warn('❌ Service Worker registration failed', err)
    );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)