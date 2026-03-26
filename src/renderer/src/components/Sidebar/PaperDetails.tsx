import React from 'react'
import { Paper } from '../../types/paper'
import { usePapers } from '../../context/PaperContext'
import MarkdownField from '../common/MarkdownField'
import RelatedPapersEditor from '../common/RelatedPapersEditor'
import { formatAuthors } from '../../utils/csvUtils'

function listToStr(arr: string[]): string {
  return arr.join('; ')
}

function strToList(s: string): string[] {
  return s
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean)
}


export default function PaperDetails(): JSX.Element {
  const { papers, selectedPaperId, updatePaper, selectPaper, deletePaper } = usePapers()
  const paper = papers.find((p) => p.id === selectedPaperId)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  if (!paper) return <></>

  function update(partial: Partial<Paper>): void {
    updatePaper({ ...paper!, ...partial })
  }

  function handleDelete(): void {
    deletePaper(paper!.id)
    setConfirmDelete(false)
  }

  const authorDisplay = formatAuthors(paper.authors)

  return (
    <div className="paper-details">
      <div className="paper-details-header">
        <div className="paper-details-id">{paper.id}</div>
        <div className="paper-details-header-actions">
          {confirmDelete ? (
            <>
              <span className="delete-confirm-label">Delete?</span>
              <button className="icon-btn icon-btn--danger" onClick={handleDelete} title="Confirm delete">
                ✓
              </button>
              <button className="icon-btn" onClick={() => setConfirmDelete(false)} title="Cancel">
                ✕
              </button>
            </>
          ) : (
            <>
              <button
                className="icon-btn icon-btn--danger-soft"
                onClick={() => setConfirmDelete(true)}
                title="Delete paper"
              >
                🗑
              </button>
              <button className="icon-btn" onClick={() => selectPaper(null)} title="Close">
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      <MarkdownField
        label="Title"
        value={paper.title}
        onChange={(v) => update({ title: v })}
        placeholder="Paper title"
      />

      <div className="md-field">
        <span className="md-field-label">Authors</span>
        <div className="md-field-display" onClick={() => {}}>
          <ReactMarkdownAuthors
            display={authorDisplay}
            raw={listToStr(paper.authors)}
            onChange={(v) => update({ authors: strToList(v) })}
          />
        </div>
      </div>

      <MarkdownField
        label="Year"
        value={paper.year}
        onChange={(v) => update({ year: v })}
        placeholder="e.g. 2024"
      />

      <MarkdownField
        label="Link"
        value={paper.link}
        onChange={(v) => update({ link: v })}
        placeholder="https://…"
      />

      <MarkdownField
        label="Article Type"
        value={paper.articleType}
        onChange={(v) => update({ articleType: v })}
        placeholder="e.g. Article, Conference Paper, Thesis"
      />

      <MarkdownField
        label="Venue"
        value={paper.venue}
        onChange={(v) => update({ venue: v })}
        placeholder="Journal or conference name"
      />

      <MarkdownField
        label="Tags"
        value={listToStr(paper.tags)}
        onChange={(v) => update({ tags: strToList(v) })}
        placeholder="Tag1; Tag2; …"
      />

      <MarkdownField
        label="Direct Quotes"
        value={paper.directQuotes}
        onChange={(v) => update({ directQuotes: v })}
        multiline
        placeholder="Write markdown here — bullet points, bold, etc."
      />

      <MarkdownField
        label="Other Info"
        value={paper.otherInfo}
        onChange={(v) => update({ otherInfo: v })}
        multiline
        placeholder="Additional notes in markdown…"
      />

      <MarkdownField
        label="Bibtex"
        value={paper.bibtex}
        onChange={(v) => update({ bibtex: v })}
        multiline
        isCode
        placeholder="@article{…}"
      />

      <div className="md-field">
        <span className="md-field-label">Related Papers</span>
        <RelatedPapersEditor
          value={paper.relatedPapers}
          onChange={(related) => update({ relatedPapers: related })}
          allPapers={papers}
          excludeId={paper.id}
          onNavigate={selectPaper}
        />
      </div>

      {paper.link && (
        <a
          className="open-link-btn"
          href={paper.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            e.preventDefault()
            window.open(paper.link, '_blank')
          }}
        >
          Open Link ↗
        </a>
      )}
    </div>
  )
}

// Inline editable author field: shows formatted in display, raw list in edit
function ReactMarkdownAuthors({
  display,
  raw,
  onChange
}: {
  display: string
  raw: string
  onChange: (v: string) => void
}): JSX.Element {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(raw)

  React.useEffect(() => {
    if (!editing) setDraft(raw)
  }, [raw, editing])

  function commit(): void {
    setEditing(false)
    onChange(draft)
  }

  if (editing) {
    return (
      <input
        className="md-field-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        placeholder="Author1; Author2; …"
        autoFocus
      />
    )
  }

  return (
    <div
      className={`md-field-display ${display ? '' : 'md-field-empty'}`}
      onClick={() => setEditing(true)}
      title={`Click to edit (raw: ${raw})`}
    >
      {display || <span className="md-field-placeholder">Click to edit…</span>}
    </div>
  )
}
