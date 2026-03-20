import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import { BoardProvider } from './context/BoardProvider'
import { BoardCanvas } from './components/BoardCanvas/BoardCanvas'
import { FilterPanel } from './components/FilterPanel/FilterPanel'
import { CreateNoteForm } from './components/CreateNoteForm/CreateNoteForm'
import { ActivityTimeline } from './components/ActivityTimeline/ActivityTimeline'
import logo from './assets/logo.svg'
import styles from './App.module.css'

type ViewMode = 'board' | 'timeline';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('board')

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
              <div className={styles.viewToggle} role="group" aria-label="View mode">
                <button
                  className={`${styles.viewBtn} ${viewMode === 'board' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('board')}
                  aria-pressed={viewMode === 'board'}
                >
                  Board
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'timeline' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('timeline')}
                  aria-pressed={viewMode === 'timeline'}
                >
                  Timeline
                </button>
              </div>
              <button
                className={styles.addNoteBtn}
                onClick={() => setIsFormOpen(true)}
              >
                + New note
              </button>
            </div>
          </header>
          <div className={styles.body}>
            <FilterPanel />
            <main className={styles.main}>
              {viewMode === 'board' ? <BoardCanvas /> : <ActivityTimeline />}
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
