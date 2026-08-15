import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// ATSense CSS (order matters)
import './styles/variables.css';
import './styles/globals.css';
import './styles/animations.css';
import './styles/responsive.css';

// Bootstrap JS (for accordion, tabs, modals, navbar collapse)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
