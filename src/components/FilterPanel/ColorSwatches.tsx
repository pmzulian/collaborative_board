import { useBoardContext } from '../../context/BoardContext';
import { useBoardActions } from '../../context/useBoardActions';
import { NOTE_COLORS } from '../../lib/tokens';
import styles from './FilterPanel.module.css';

export function ColorSwatches() {
  const { state } = useBoardContext();
  const { toggleColor } = useBoardActions();

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLabel}>Color</legend>
      <div className={styles.swatches} role="list">
        {NOTE_COLORS.map((color) => {
          const active = state.filters.colors.includes(color);
          return (
            <button
              key={color}
              role="listitem"
              className={`${styles.swatch} ${styles[`swatch--${color}`]} ${active ? styles['swatch--active'] : ''}`}
              onClick={() => toggleColor(color)}
              aria-pressed={active}
              aria-label={`Filter by ${color} notes`}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
