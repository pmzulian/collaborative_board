import { useState } from 'react';
import { useCreateNote } from '../../hooks/useCreateNote';
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
  const { mutate, isPending } = useCreateNote();

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!text.trim() || !author.trim()) return;
    mutate(
      { text: text.trim(), author: author.trim(), color, x: 0, y: 0 },
      {
        onSuccess: () => {
          setText('');
          setAuthor('');
          onClose();
        },
      },
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Add a new note">
      <h2 className={styles.title}>New note</h2>

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
        <button type="button" className={styles.cancelBtn} onClick={onClose}>
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
  );
}
