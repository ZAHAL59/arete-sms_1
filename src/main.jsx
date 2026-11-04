import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/dm-sans/latin-400.css'      // the font is served from this site (no Google Fonts request)
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-sans/latin-700.css'
import '@fontsource/dm-sans/latin-800.css'
import './index.css'
import './dark.css'
import { initTheme } from './theme'
import { installStorageGuard } from './lib/storageGuard'
import { installGlobalErrorHandlers } from './lib/report'
import { installAutoLabels } from './lib/autoLabel'

installStorageGuard()          // before anything reads saved data
installGlobalErrorHandlers()
initTheme()
installAutoLabels()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
