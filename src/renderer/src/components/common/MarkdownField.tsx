import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  placeholder?: string
  isCode?: boolean
}

export default function MarkdownField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = '',
  isCode = false
}: MarkdownFieldProps): JSX.Element {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync draft when external value changes (e.g. loading a different paper)
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  function startEdit(): void {
    setDraft(value)
    setEditing(true)
  }

  function commit(): void {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Escape') {
      setEditing(false)
      setDraft(value)
    }
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      commit()
    }
  }

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus()
      inputRef.current?.focus()
    }
  }, [editing])

  return (
    <div className="md-field">
      <span className="md-field-label">{label}</span>

      {editing ? (
        multiline ? (
          <textarea
            ref={textareaRef}
            className="md-field-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={4}
          />
        ) : (
          <input
            ref={inputRef}
            className="md-field-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        )
      ) : (
        <div
          className={`md-field-display ${value ? '' : 'md-field-empty'}`}
          onClick={startEdit}
          title="Click to edit"
        >
          {value ? (
            isCode ? (
              <pre className="md-field-code">{value}</pre>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            )
          ) : (
            <span className="md-field-placeholder">{placeholder || 'Click to edit…'}</span>
          )}
        </div>
      )}
    </div>
  )
}
