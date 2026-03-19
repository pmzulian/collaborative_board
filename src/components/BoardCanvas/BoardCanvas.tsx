import { memo } from 'react';
import { useFilteredNotes } from '../../hooks/useFilteredNotes';
import { StickyNote } from '../StickyNote/StickyNote';
import styles from './BoardCanvas.module.css';

export const BoardCanvas = memo(function BoardCanvas() {
  const { notes, isLoading, isError, error } = useFilteredNotes();

  if (isLoading) {
    return (
      <div className={styles.status} role="status" aria-live="polite">
        Loading notes…
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.status} role="alert">
        Failed to load notes: {error?.message ?? 'Unknown error'}.
        Make sure json-server is running on port 3001.
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className={styles.status} role="status" aria-live="polite">
        No notes match the current filters.
      </div>
    );
  }

  return (
    <section
      className={styles.canvas}
      aria-label={`Board — ${notes.length} note${notes.length !== 1 ? 's' : ''}`}
    >
      {notes.map((note) => (
        <StickyNote key={note.id} {...note} />
      ))}
    </section>
  );
});
