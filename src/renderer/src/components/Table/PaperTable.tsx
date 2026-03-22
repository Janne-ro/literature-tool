import React from 'react'
import { usePapers } from '../../context/PaperContext'
import { formatAuthors } from '../../utils/csvUtils'
import { getNodeColor } from '../../utils/colorUtils'

export default function PaperTable(): JSX.Element {
  const { filteredPapers, selectPaper, selectedPaperId } = usePapers()

  if (filteredPapers.length === 0) {
    return (
      <div className="table-empty">
        <p>No papers match the current filters.</p>
      </div>
    )
  }

  return (
    <div className="paper-table-wrapper">
      <table className="paper-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Authors</th>
            <th>Year</th>
            <th>Type</th>
            <th>Venue</th>
            <th>Tags</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {filteredPapers.map((paper) => {
            const color = getNodeColor(paper.tags)
            return (
              <tr
                key={paper.id}
                className={`paper-table-row ${paper.id === selectedPaperId ? 'paper-table-row--selected' : ''}`}
                onClick={() => selectPaper(paper.id)}
              >
                <td className="table-id">{paper.id}</td>
                <td className="table-title">{paper.title}</td>
                <td className="table-authors">{formatAuthors(paper.authors)}</td>
                <td className="table-year">{paper.year}</td>
                <td>{paper.articleType}</td>
                <td>{paper.venue}</td>
                <td>
                  <div className="table-tags">
                    {paper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="table-tag"
                        style={{
                          background: color + '22',
                          color,
                          border: `1px solid ${color}55`
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {paper.link && (
                    <a
                      className="table-link"
                      href={paper.link}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        window.open(paper.link, '_blank')
                      }}
                    >
                      ↗
                    </a>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
