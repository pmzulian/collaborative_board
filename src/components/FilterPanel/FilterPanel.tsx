import { useState, useMemo } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { useBoardActions } from '../../context/useBoardActions';
import { selectHasActiveFilters } from '../../context/boardSelectors';
import type { SortOption } from '../../types';
import { AuthorList } from './AuthorList';
import { ColorSwatches } from './ColorSwatches';
import iconPerson from '../../assets/person.svg';
import iconPalette from '../../assets/palette.svg';
import iconSort from '../../assets/sort-by.svg';
import iconChevronLeft from '../../assets/chevron-left.svg';
import iconChevronRight from '../../assets/chevron-right.svg';
import styles from './FilterPanel.module.css';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'oldest',     label: 'Oldest first' },
  { value: 'position-x', label: 'Position (left → right)' },
  { value: 'position-y', label: 'Position (top → bottom)' },
];

export function FilterPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({ author: true, color: true, sort: true });
  const { state } = useBoardContext();
  const { clearFilters, setSort } = useBoardActions();
  const hasFilters = useMemo(() => selectHasActiveFilters(state), [state]);

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  return (
    <aside
      className={`${styles.panel}${isCollapsed ? ` ${styles.panelCollapsed}` : ''}`}
      aria-label="Filter controls"
    >
      <button
        className={styles.collapseBtn}
        onClick={() => setIsCollapsed((v) => !v)}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand filters sidebar' : 'Collapse filters sidebar'}
        title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
      >
        <img
          src={isCollapsed ? iconChevronRight : iconChevronLeft}
          alt=""
          className={styles.icon}
          width={16}
          height={16}
        />
      </button>

      {isCollapsed ? (
        <nav className={styles.iconStrip} aria-label="Filter shortcuts — expand to use">
          <button
            className={styles.iconBtn}
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand to filter by author"
            title="Author"
          >
            <img src={iconPerson} alt="" className={styles.icon} width={18} height={18} />
            {state.filters.authors.length > 0 && (
              <span className={styles.iconBadge} aria-hidden="true" />
            )}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand to filter by color"
            title="Color"
          >
            <img src={iconPalette} alt="" className={styles.icon} width={18} height={18} />
            {state.filters.colors.length > 0 && (
              <span className={styles.iconBadge} aria-hidden="true" />
            )}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand to change sort order"
            title="Sort"
          >
            <img src={iconSort} alt="" className={styles.icon} width={18} height={18} />
          </button>
        </nav>
      ) : (
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>Filters</h2>
            {hasFilters && (
              <button
                className={styles.clearBtn}
                onClick={clearFilters}
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            )}
          </div>

          <div className={styles.section}>
            <button
              className={styles.sectionSummary}
              onClick={() => toggleSection('author')}
              aria-expanded={openSections.author}
              aria-controls="filter-section-author"
            >
              <img src={iconPerson} alt="" className={styles.icon} width={18} height={18} />
              <span>Author</span>
              <span className={`${styles.chevron}${openSections.author ? ` ${styles.chevronOpen}` : ''}`} />
            </button>
            {openSections.author && (
              <div id="filter-section-author" className={styles.sectionContent}>
                <AuthorList />
              </div>
            )}
          </div>

          <div className={styles.section}>
            <button
              className={styles.sectionSummary}
              onClick={() => toggleSection('color')}
              aria-expanded={openSections.color}
              aria-controls="filter-section-color"
            >
              <img src={iconPalette} alt="" className={styles.icon} width={18} height={18} />
              <span>Color</span>
              <span className={`${styles.chevron}${openSections.color ? ` ${styles.chevronOpen}` : ''}`} />
            </button>
            {openSections.color && (
              <div id="filter-section-color" className={styles.sectionContent}>
                <ColorSwatches />
              </div>
            )}
          </div>

          <div className={styles.section}>
            <button
              className={styles.sectionSummary}
              onClick={() => toggleSection('sort')}
              aria-expanded={openSections.sort}
              aria-controls="filter-section-sort"
            >
              <img src={iconSort} alt="" className={styles.icon} width={18} height={18} />
              <span>Sort by</span>
              <span className={`${styles.chevron}${openSections.sort ? ` ${styles.chevronOpen}` : ''}`} />
            </button>
            {openSections.sort && (
              <div id="filter-section-sort" className={styles.sectionContent}>
                <label className={styles.srOnly} htmlFor="sort-select">Sort notes by</label>
                <select
                  id="sort-select"
                  className={styles.sortSelect}
                  value={state.sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

// Compound component namespacing (kept for external consumers)
FilterPanel.AuthorList = AuthorList;
FilterPanel.ColorSwatches = ColorSwatches;
