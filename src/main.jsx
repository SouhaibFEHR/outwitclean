import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Ensure your index.html has a div with id 'root'.");
  // Optionally, render an error message to the body if root is not found
  document.body.innerHTML = '<div style="color: red; text-align: center; padding-top: 50px;">Error: Root element not found. Application cannot start.</div>';
}