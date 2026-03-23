import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { fetchNotes } from './services/api.service'
import { NOTES_QUERY_KEY } from './hooks/useNotes'

queryClient.prefetchQuery({ queryKey: NOTES_QUERY_KEY, queryFn: fetchNotes })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
