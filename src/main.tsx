import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { env } from './env.ts'
import './index.css'

const root = document.getElementById('root')
if (root === null) {
  throw new Error('Root element #root is missing')
}

if (import.meta.env.DEV) {
  const target = env.apiBaseUrl.length > 0 ? env.apiBaseUrl : 'same origin'
  console.info(`API origin: ${target}`)
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
