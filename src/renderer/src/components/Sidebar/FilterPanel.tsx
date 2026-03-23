import React, { useId } from 'react'
import { usePapers } from '../../context/PaperContext'

export default function FilterPanel(): JSX.Element {
  const { filter, setFilter, allTags, yearBounds, filteredPapers, papers } = usePapers()
  const uid = useId()

  const yearMin = filter.yearMin ?? yearBounds.min
  const yearMax = filter.yearMax ?? yearBounds.max
  const activeTags = filter.activeTags ?? allTags

  function toggleTag(tag: string): void {
    const current = filter.activeTags ?? allTags
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    // If all tags are selected, set to null (= show all)
    setFilter({ activeTags: next.length === allTags.length ? null : next })
  }

  function selectAllTags(): void {
    setFilter({ activeTags: null })
  }

  function clearAllTags(): void {
    setFilter({ activeTags: [] })
  }

  function resetYears(): void {
    setFilter({ yearMin: null, yearMax: null })
  }

  return (
    <div className="filter-panel">
      <div className="filter-title">Filters</div>

      <div className="filter-count">
        {filteredPapers.length} / {papers.length} papers shown
      </div>

      {/* Year range */}
      <div className="filter-section">
        <div className="filter-section-label">
          Year range
          <button className="filter-reset-btn" onClick={resetYears}>
            reset
          </button>
        </div>
        <div className="filter-year-inputs">
          <input
            className="filter-year-input"
            type="number"
            value={yearMin}
            min={yearBounds.min}
            max={yearMax}
            onChange={(e) => setFilter({ yearMin: parseInt(e.target.value, 10) || null })}
          />
          <span className="filter-year-sep">–</span>
          <input
            className="filter-year-input"
            type="number"
            value={yearMax}
            min={yearMin}
            max={yearBounds.max}
            onChange={(e) => setFilter({ yearMax: parseInt(e.target.value, 10) || null })}
          />
        </div>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="filter-section">
          <div className="filter-section-label">
            Tags
            <span className="filter-tag-actions">
              <span className="filter-mode-toggle">
                <button
                  className={`filter-mode-btn ${filter.tagFilterMode === 'or' ? 'filter-mode-btn--active' : ''}`}
                  onClick={() => setFilter({ tagFilterMode: 'or' })}
                  title="Show papers that have ANY of the selected tags"
                >
                  OR
                </button>
                <button
                  className={`filter-mode-btn ${filter.tagFilterMode === 'and' ? 'filter-mode-btn--active' : ''}`}
                  onClick={() => setFilter({ tagFilterMode: 'and' })}
                  title="Show papers that have ALL of the selected tags"
                >
                  AND
                </button>
              </span>
              <button className="filter-reset-btn" onClick={selectAllTags}>
                all
              </button>
              <button className="filter-reset-btn" onClick={clearAllTags}>
                none
              </button>
            </span>
          </div>
          <div className="filter-tags">
            {allTags.map((tag) => (
              <label key={tag} className="filter-tag-item">
                <input
                  type="checkbox"
                  id={`${uid}-${tag}`}
                  checked={activeTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                <span className="filter-tag-label">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
