import { useBoardContext } from '../../context/BoardContext';
import { useBoardActions } from '../../context/useBoardActions';
import type { NoteColor } from '../../types';
import styles from './FilterPanel.module.css';

const ALL_COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

const COLOR_HEX: Record<NoteColor, string> = {
  yellow: '#FFD600',
  pink:   '#EC407A',
  blue:   '#26C6DA',
  green:  '#9CCC65',
  purple: '#AB47BC',
  orange: '#FFA726',
};

export function ColorSwatches() {
  const { state } = useBoardContext();
  const { toggleColor } = useBoardActions();

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLabel}>Color</legend>
      <div className={styles.swatches} role="list">
        {ALL_COLORS.map((color) => {
          const active = state.filters.colors.includes(color);
          return (
            <button
              key={color}
              role="listitem"
              className={`${styles.swatch} ${active ? styles['swatch--active'] : ''}`}
              style={{ backgroundColor: COLOR_HEX[color] }} // Reemplazar con clases CSS para mejor rendimiento
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
