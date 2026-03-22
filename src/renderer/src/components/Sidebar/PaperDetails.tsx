import React from 'react'
import { Paper } from '../../types/paper'
import { usePapers } from '../../context/PaperContext'
import MarkdownField from '../common/MarkdownField'
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

interface RelatedEntry {
  targetId: string
  label: string
}

function relatedToStr(related: RelatedEntry[]): string {
  return related.map((r) => `${r.targetId} | ${r.label}`).join('; ')
}

function strToRelated(s: string): RelatedEntry[] {
  return s
    .split(';')
    .map((x) => {
      const [id, ...rest] = x.split('|')
      return { targetId: id?.trim() ?? '', label: rest.join('|').trim() }
    })
    .filter((r) => r.targetId !== '')
}

export default function PaperDetails(): JSX.Element {
  const { papers, selectedPaperId, updatePaper, selectPaper } = usePapers()
  const paper = papers.find((p) => p.id === selectedPaperId)

  if (!paper) return <></>

  function update(partial: Partial<Paper>): void {
    updatePaper({ ...paper!, ...partial })
  }

  const authorDisplay = formatAuthors(paper.authors)

  return (
    <div className="paper-details">
      <div className="paper-details-header">
        <div className="paper-details-id">{paper.id}</div>
        <button className="icon-btn" onClick={() => selectPaper(null)} title="Close">
          ✕
        </button>
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
        value={listToStr(paper.directQuotes)}
        onChange={(v) => update({ directQuotes: strToList(v) })}
        multiline
        placeholder="Quote1; Quote2; …"
      />

      <MarkdownField
        label="Other Info"
        value={listToStr(paper.otherInfo)}
        onChange={(v) => update({ otherInfo: strToList(v) })}
        multiline
        placeholder="Additional notes…"
      />

      <MarkdownField
        label="Bibtex"
        value={paper.bibtex}
        onChange={(v) => update({ bibtex: v })}
        multiline
        isCode
        placeholder="@article{…}"
      />

      <MarkdownField
        label="Related Papers"
        value={relatedToStr(paper.relatedPapers)}
        onChange={(v) => update({ relatedPapers: strToRelated(v) })}
        multiline
        placeholder="ID_002 | Same methodology; …"
      />

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
