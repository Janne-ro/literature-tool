import React from 'react'
import { usePapers } from '../../context/PaperContext'

export default function Legend(): JSX.Element {
  const { tagColorMap } = usePapers()

  const entries = Array.from(tagColorMap.entries())

  if (entries.length === 0) return <></>

  return (
    <div className="legend">
      <div className="legend-title">Node Colors</div>
      <div className="legend-list">
        {entries.map(([tag, color]) => (
          <div key={tag} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span className="legend-tag">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
