import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('CRITICAL: Main.jsx starting execution');

try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error("Elemento 'root' não encontrado no HTML");
    }

    console.log('CRITICAL: Root element found, mounting React');
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
    console.log('CRITICAL: React render command sent');
} catch (error) {
    console.error('CRITICAL: Fatal error in main.jsx', error);
    document.body.innerHTML = `<div style="color: red; padding: 20px;">
        <h1>Erro Fatal na Inicialização</h1>
        <pre>${error.message}\n${error.stack}</pre>
    </div>`;
}
