import { useState, useRef } from 'react';
import type { StickyNote as StickyNoteType } from '../../types';
import { useDeleteNote } from '../../hooks/useDeleteNote';
import { useUpdateNote } from '../../hooks/useUpdateNote';
import styles from './StickyNote.module.css';

type Props = Pick<StickyNoteType, 'id' | 'text' | 'author' | 'color' | 'createdAt'> & {
  isNew?: boolean;
};

export function StickyNote({ id, text, author, color, createdAt, isNew }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote();
  const { mutate: updateNote, isPending: isSaving } = useUpdateNote();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const time = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  function startEdit() {
    setDraft(text);
    setIsEditing(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === text) {
      setIsEditing(false);
      return;
    }
    updateNote({ id, text: trimmed }, { onSuccess: () => setIsEditing(false) });
  }

  function cancelEdit() {
    setDraft(text);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  return (
    <div className={`${styles.noteWrapper}${isNew ? ` ${styles['noteWrapper--new']}` : ''}`}>
      <article
        className={`${styles.note} ${styles[`note--${color}`]}`}
        aria-label={`${isNew ? 'New note' : 'Note'} by ${author}: ${text}`}
      >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className={styles.editTextarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Edit note text — Enter to save, Escape to cancel"
          rows={3}
          disabled={isSaving}
        />
      ) : (
        <p className={styles.text}>{text}</p>
      )}
      <footer className={styles.meta}>
        <span className={styles.author}>{author}</span>
        <time dateTime={createdAt} className={styles.date}>
          {time}
        </time>
        {isEditing ? (
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={commitEdit}
              disabled={isSaving}
              aria-label="Save changes"
            >
              {isSaving ? '...' : '✅'}
            </button>
            <button
              className={styles.actionBtn}
              onClick={cancelEdit}
              disabled={isSaving}
              aria-label="Cancel edit"
            >
              ❌
            </button>
          </div>
        ) : (
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={startEdit}
              aria-label="Edit note"
            >
              ✏️
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => deleteNote(id)}
              disabled={isDeleting}
              aria-label={`Delete note by ${author}`}
            >
              {isDeleting ? '...' : '🗑️'}
            </button>
          </div>
        )}
      </footer>
      </article>
    </div>
  );
}
