import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Aqui dizemos ao React para encontrar a "div" com id "root" no HTML 
// e renderizar o nosso componente principal <App /> lá dentro.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)