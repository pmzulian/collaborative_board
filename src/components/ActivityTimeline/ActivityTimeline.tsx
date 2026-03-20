import { memo, useMemo } from 'react';
import { useFilteredNotes } from '../../hooks/useFilteredNotes';
import { useBoardContext } from '../../context/BoardContext';
import { groupNotesByDay, formatTime } from '../../utils/dateHelpers';
import type { StickyNote } from '../../types';
import styles from './ActivityTimeline.module.css';

type NoteCardProps = Pick<StickyNote, 'id' | 'text' | 'author' | 'color' | 'createdAt'> & {
  isNew?: boolean;
};

function NoteCard({ text, author, createdAt, isNew }: NoteCardProps) {
  return (
    <article
      className={`${styles.noteCard}${isNew ? ` ${styles['noteCard--new']}` : ''}`}
      aria-label={`${isNew ? 'New note' : 'Note'} by ${author}: ${text}`}
    >
      <p className={styles.noteText}>{text}</p>
      <footer className={styles.noteMeta}>
        <span className={styles.noteAuthor}>{author}</span>
        <time dateTime={createdAt} className={styles.noteTime}>
          {formatTime(createdAt)}
        </time>
      </footer>
    </article>
  );
}

export const ActivityTimeline = memo(function ActivityTimeline() {
  const { notes, isLoading, isError, error } = useFilteredNotes();
  const { state } = useBoardContext();
  const recentIds = useMemo(() => new Set(state.recentlyAddedIds), [state.recentlyAddedIds]);

  const groups = useMemo(() => groupNotesByDay(notes), [notes]);

  if (isLoading) {
    return (
      <div className={styles.status} role="status" aria-live="polite">
        Loading activity…
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

  if (groups.length === 0) {
    return (
      <div className={styles.status} role="status" aria-live="polite">
        No activity matches the current filters.
      </div>
    );
  }

  return (
    <section
      className={styles.timeline}
      aria-label={`Activity timeline — ${notes.length} note${notes.length !== 1 ? 's' : ''}`}
    >
      <ol className={styles.dayList} aria-label="Activity grouped by day">
        {groups.map((group) => (
          <li key={group.isoDate} className={styles.dayGroup}>
            <div className={styles.dayHeader} aria-label={`${group.label}, ${group.notes.length} notes`}>
              <span className={styles.dayLabel}>{group.label}</span>
              <span className={styles.dayCount} aria-hidden="true">
                {group.notes.length}
              </span>
              <div className={styles.dayLine} aria-hidden="true" />
            </div>
            <ol className={styles.noteList} aria-label={`Notes from ${group.label}`}>
              {group.notes
                .slice()
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map((note) => (
                  <li key={note.id} className={styles.noteEntry}>
                    <div className={styles.noteTrack} aria-hidden="true">
                      <span
                        className={`${styles.colorDot} ${styles[`colorDot--${note.color}`]}`}
                      />
                      <span className={styles.connector} />
                    </div>
                    <NoteCard {...note} isNew={recentIds.has(note.id)} />
                  </li>
                ))}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  );
});
