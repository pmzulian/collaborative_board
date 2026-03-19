import { useMemo } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { useBoardActions } from '../../context/useBoardActions';
import { selectAllAuthors } from '../../context/boardSelectors';
import { useNotes } from '../../hooks/useNotes';
import styles from './FilterPanel.module.css';

export function AuthorList() {
  const { state } = useBoardContext();
  const { toggleAuthor } = useBoardActions();
  const { data: notes = [] } = useNotes();
  const authors = useMemo(() => selectAllAuthors(notes), [notes]);

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLabel}>Author</legend>
      <ul className={styles.list} role="list">
        {authors.map((author) => {
          const checked = state.filters.authors.includes(author);
          return (
            <li key={author}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAuthor(author)}
                  aria-label={`Filter by ${author}`}
                />
                <span>{author}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
