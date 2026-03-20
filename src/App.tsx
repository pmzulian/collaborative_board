import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import { BoardProvider } from './context/BoardProvider'
import { BoardCanvas } from './components/BoardCanvas/BoardCanvas'
import { FilterPanel } from './components/FilterPanel/FilterPanel'
import { SortControl } from './components/SortControl/SortControl'
import { CreateNoteForm } from './components/CreateNoteForm/CreateNoteForm'
import logo from './assets/logo.svg'
import styles from './App.module.css'

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BoardProvider>
        <div className={styles.layout}>
          <header className={styles.header}>
            <img
              src={logo}
              alt="App logo"
              className={styles.logo}
            />
            <h1 className={styles.appTitle}>Collaborative Board Explorer</h1>
            <div className={styles.headerActions}>
              <button
                className={styles.addNoteBtn}
                onClick={() => setIsFormOpen(true)}
              >
                + New note
              </button>
              <SortControl />
            </div>
          </header>
          <div className={styles.body}>
            <FilterPanel />
            <main className={styles.main}>
              <BoardCanvas />
            </main>
          </div>
        </div>
        {isFormOpen && (
          <CreateNoteForm onClose={() => setIsFormOpen(false)} />
        )}
      </BoardProvider>
    </QueryClientProvider>
  );
}

export default App
