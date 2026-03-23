import React, { useState, useEffect, useRef } from 'react'
import { RelatedPaper, Paper } from '../../types/paper'

interface Props {
  value: RelatedPaper[]
  onChange: (related: RelatedPaper[]) => void
  allPapers: Paper[]
  excludeId?: string
  onNavigate?: (id: string) => void
}

export default function RelatedPapersEditor({
  value,
  onChange,
  allPapers,
  excludeId,
  onNavigate
}: Props): JSX.Element {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const candidates = search.trim()
    ? allPapers
        .filter((p) => {
          if (p.id === excludeId) return false
          if (value.some((r) => r.targetId === p.id)) return false
          const q = search.toLowerCase()
          return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
        })
        .slice(0, 8)
    : []

  useEffect(() => {
    setOpen(candidates.length > 0)
  }, [candidates.length])

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function addPaper(paper: Paper): void {
    onChange([...value, { targetId: paper.id, label: '' }])
    setSearch('')
    setOpen(false)
    searchRef.current?.focus()
  }

  function removeAt(idx: number): void {
    onChange(value.filter((_, i) => i !== idx))
  }

  function updateLabel(idx: number, label: string): void {
    onChange(value.map((r, i) => (i === idx ? { ...r, label } : r)))
  }

  return (
    <div className="rpe" ref={containerRef}>
      {value.length > 0 && (
        <div className="rpe-list">
          {value.map((r, i) => {
            const paper = allPapers.find((p) => p.id === r.targetId)
            const title = paper?.title ?? r.targetId
            return (
              <div key={`${r.targetId}-${i}`} className="rpe-item">
                <span
                  className={`rpe-title ${onNavigate ? 'rpe-title--link' : ''}`}
                  onClick={() => onNavigate?.(r.targetId)}
                  title={onNavigate ? `Click to open "${title}"` : title}
                >
                  {title}
                </span>
                <input
                  className="rpe-label-input"
                  value={r.label}
                  onChange={(e) => updateLabel(i, e.target.value)}
                  placeholder="relationship…"
                />
                <button
                  className="rpe-remove"
                  onClick={() => removeAt(i)}
                  title="Remove"
                  type="button"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="rpe-search-wrap">
        <input
          ref={searchRef}
          className="rpe-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => { if (candidates.length > 0) setOpen(true) }}
          placeholder="Add paper by title or ID…"
          type="text"
        />
        {open && (
          <div className="rpe-dropdown">
            {candidates.map((p) => (
              <button
                key={p.id}
                className="rpe-option"
                onClick={() => addPaper(p)}
                type="button"
              >
                <span className="rpe-option-title">{p.title}</span>
                <span className="rpe-option-id">{p.id} · {p.year}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
