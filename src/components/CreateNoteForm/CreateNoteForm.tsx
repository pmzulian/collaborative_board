import { useState, useEffect, useRef, useCallback } from 'react';
import { useCreateNote } from '../../hooks/useCreateNote';
import { useBoardActions } from '../../context/useBoardActions';
import type { NoteColor } from '../../types';
import styles from './CreateNoteForm.module.css';

const COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

interface Props {
  onClose: () => void;
}

export function CreateNoteForm({ onClose }: Props) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [isClosing, setIsClosing] = useState(false);
  const { mutate, isPending } = useCreateNote();
  const { markNoteAsRecent } = useBoardActions();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const requestClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  function handleAnimationEnd() {
    if (isClosing) onClose();
  }

  function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    requestClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) requestClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim() || !author.trim()) return;
    mutate(
      { text: text.trim(), author: author.trim(), color, x: 0, y: 0 },
      {
        onSuccess: (createdNote) => {
          markNoteAsRecent(createdNote.id);
          setText('');
          setAuthor('');
          requestClose();
        },
      },
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${isClosing ? styles['dialog--closing'] : ''}`}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onAnimationEnd={handleAnimationEnd}
      aria-labelledby="dialog-title"
      aria-modal="true"
    >
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title} id="dialog-title">New note</h2>

      <label className={styles.label} htmlFor="note-text">
        Text
      </label>
      <textarea
        id="note-text"
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        required
        placeholder="What's on your mind?"
      />

      <label className={styles.label} htmlFor="note-author">
        Author
      </label>
      <input
        id="note-author"
        className={styles.input}
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
        placeholder="user_1"
      />

      <fieldset className={styles.colorGroup}>
        <legend className={styles.label}>Color</legend>
        <div className={styles.colorOptions}>
          {COLORS.map((c) => (
            <label key={c} className={styles.colorOption}>
              <input
                type="radio"
                name="note-color"
                value={c}
                checked={color === c}
                onChange={() => setColor(c)}
                className={styles.colorRadio}
              />
              <span
                className={`${styles.colorSwatch} ${styles[`swatch--${c}`]}`}
                aria-label={c}
                title={c}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={requestClose}>
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isPending || !text.trim() || !author.trim()}
        >
          {isPending ? 'Adding...' : 'Add note'}
        </button>
      </div>
    </form>
    </dialog>
  );
}
