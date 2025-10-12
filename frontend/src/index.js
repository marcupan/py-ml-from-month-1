import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

// Create a root for the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component into the root
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

// This file is the entry point for our React application.
// It imports the main App component and renders it into the DOM.
