import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatWidget from './ChatWidget.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatWidget />
  </StrictMode>,
)
