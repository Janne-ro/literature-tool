import React, { useState, useEffect, useRef } from 'react'
import { usePapers } from '../../context/PaperContext'
import { Paper, RelatedPaper } from '../../types/paper'
import RelatedPapersEditor from '../common/RelatedPapersEditor'

interface AddPaperDialogProps {
  onClose: () => void
}

const EMPTY_FORM = {
  title: '',
  authors: '',
  year: String(new Date().getFullYear()),
  link: '',
  articleType: '',
  venue: '',
  tags: '',
  directQuotes: '',
  otherInfo: '',
  bibtex: ''
}

type FormData = typeof EMPTY_FORM

export default function AddPaperDialog({ onClose }: AddPaperDialogProps): JSX.Element {
  const { addPaper, nextId, papers } = usePapers()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [relatedPapers, setRelatedPapers] = useState<RelatedPaper[]>([])
  const [error, setError] = useState<string>('')
  const newId = nextId()
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  function field(key: keyof FormData, value: string): void {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  function parseList(s: string): string[] {
    return s
      .split(';')
      .map((x) => x.trim())
      .filter(Boolean)
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    const paper: Paper = {
      id: newId,
      title: form.title.trim(),
      authors: parseList(form.authors),
      year: form.year.trim(),
      link: form.link.trim(),
      articleType: form.articleType.trim(),
      venue: form.venue.trim(),
      tags: parseList(form.tags),
      directQuotes: form.directQuotes,
      otherInfo: form.otherInfo,
      bibtex: form.bibtex.trim(),
      relatedPapers
    }

    addPaper(paper)
    onClose()
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="dialog" aria-modal="true">
        <div className="dialog-header">
          <div>
            <h2 className="dialog-title">Add Paper</h2>
            <span className="dialog-new-id">{newId}</span>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <div className="dialog-grid">
            <div className="dialog-field dialog-field--full">
              <label className="dialog-label">
                Title <span className="dialog-required">*</span>
              </label>
              <input
                ref={firstInputRef}
                className="dialog-input"
                value={form.title}
                onChange={(e) => field('title', e.target.value)}
                placeholder="Full paper title"
              />
            </div>

            <div className="dialog-field">
              <label className="dialog-label">Authors</label>
              <input
                className="dialog-input"
                value={form.authors}
                onChange={(e) => field('authors', e.target.value)}
                placeholder="Author1; Author2; …"
              />
            </div>

            <div className="dialog-field">
              <label className="dialog-label">Year</label>
              <input
                className="dialog-input"
                value={form.year}
                onChange={(e) => field('year', e.target.value)}
                placeholder="2024"
                type="number"
              />
            </div>

            <div className="dialog-field dialog-field--full">
              <label className="dialog-label">Link</label>
              <input
                className="dialog-input"
                value={form.link}
                onChange={(e) => field('link', e.target.value)}
                placeholder="https://…"
                type="url"
              />
            </div>

            <div className="dialog-field">
              <label className="dialog-label">Article Type</label>
              <input
                className="dialog-input"
                value={form.articleType}
                onChange={(e) => field('articleType', e.target.value)}
                placeholder="Article, Conference, Thesis…"
              />
            </div>

            <div className="dialog-field">
              <label className="dialog-label">Venue</label>
              <input
                className="dialog-input"
                value={form.venue}
                onChange={(e) => field('venue', e.target.value)}
                placeholder="Journal or conference"
              />
            </div>

            <div className="dialog-field dialog-field--full">
              <label className="dialog-label">Tags</label>
              <input
                className="dialog-input"
                value={form.tags}
                onChange={(e) => field('tags', e.target.value)}
                placeholder="Tag1; Tag2; … (first tag sets node color)"
              />
            </div>

            <div className="dialog-field dialog-field--full">
              <label className="dialog-label">Related Papers</label>
              <RelatedPapersEditor
                value={relatedPapers}
                onChange={setRelatedPapers}
                allPapers={papers}
                excludeId={newId}
              />
            </div>

            <div className="dialog-field dialog-field--full">
              <label className="dialog-label">Direct Quotes</label>
              <textarea
                className="dialog-textarea"
                value={form.directQuotes}
                onChange={(e) => field('directQuotes', e.target.value)}
                placeholder="Quote1; Quote2; …"
                rows={3}
              />
            </div>

            <div className="dialog-field dialog-field--full">
              <label className="dialog-label">Other Info</label>
              <textarea
                className="dialog-textarea"
                value={form.otherInfo}
                onChange={(e) => field('otherInfo', e.target.value)}
                placeholder="Additional notes…"
                rows={3}
              />
            </div>

            <div className="dialog-field dialog-field--full">
              <label className="dialog-label">Bibtex</label>
              <textarea
                className="dialog-textarea dialog-textarea--code"
                value={form.bibtex}
                onChange={(e) => field('bibtex', e.target.value)}
                placeholder="@article{…}"
                rows={4}
              />
            </div>
          </div>

          {error && <div className="dialog-error">{error}</div>}

          <div className="dialog-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Add Paper
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
