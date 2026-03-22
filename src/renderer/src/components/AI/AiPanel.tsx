import React, { useState, useRef, useEffect } from 'react'
import { usePapers } from '../../context/PaperContext'
import { Paper } from '../../types/paper'

interface AiResult {
  id: string
  reason: string
  title: string
}

interface ChatEntry {
  id: string
  timestamp: number
  question: string
  paperCount: number
  results: AiResult[]
}

// ── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'literature-tool-ai-history'
const MAX_HISTORY = 50

function loadHistory(): ChatEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ChatEntry[]
  } catch {
    return []
  }
}

function saveHistory(history: ChatEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// ── Prompt builder ──────────────────────────────────────────────────────────

const QUOTE_MAX = 450
const NOTE_MAX = 300

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max) + '…'
}

function buildPaperBlock(paper: Paper): string {
  const quotes = paper.directQuotes
    .filter(Boolean)
    .map((q) => truncate(q, QUOTE_MAX))
    .join(' | ')
  const notes = paper.otherInfo
    .filter(Boolean)
    .map((n) => truncate(n, NOTE_MAX))
    .join(' | ')

  let block = `[${paper.id}] "${paper.title}"`
  if (quotes) block += `\n  Quotes: ${quotes}`
  if (notes) block += `\n  Notes: ${notes}`
  return block
}

const SYSTEM_PROMPT = `You are a research assistant helping to analyze a collection of academic papers.
You will receive a list of papers (each with an ID, title, direct quotes, and notes) and a question.

Respond ONLY with a valid JSON object — no markdown fences, no explanation, just JSON:
{"relevant": [{"id": "ID_001", "reason": "one concise sentence"}, ...]}\n
Include only papers genuinely relevant to the question. Return an empty array if none apply.`

// ── OpenRouter API call ─────────────────────────────────────────────────────

interface ApiResult {
  id: string
  reason: string
}

async function queryAI(papers: Paper[], question: string): Promise<ApiResult[]> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string
  const model = (import.meta.env.VITE_AI_MODEL as string) || 'anthropic/claude-3-5-haiku'

  if (!apiKey) {
    throw new Error(
      'No API key found. Please set VITE_OPENROUTER_API_KEY in the .env file and restart the app.'
    )
  }

  const paperList = papers.map(buildPaperBlock).join('\n\n')
  const userMessage = `Papers:\n\n${paperList}\n\nQuestion: ${question}`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'literature-tool',
      'X-Title': 'Literature Tool'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ''

  // Strip optional markdown code fences the model may add
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let parsed: { relevant?: ApiResult[] }
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Could not parse model response as JSON.\n\nRaw response:\n${raw}`)
  }

  return Array.isArray(parsed.relevant) ? parsed.relevant : []
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AiPanel(): JSX.Element {
  const { filteredPapers, papers, selectPaper, setAiHighlightIds } = usePapers()

  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AiResult[]>([])
  const [error, setError] = useState('')
  const [lastQuestion, setLastQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>(() => loadHistory())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [question])

  async function handleSubmit(e?: React.FormEvent): Promise<void> {
    e?.preventDefault()
    const q = question.trim()
    if (!q || loading) return

    setLoading(true)
    setError('')
    setResults([])
    setAiHighlightIds(new Set()) // clear previous highlights immediately

    try {
      const raw = await queryAI(filteredPapers, q)

      // Enrich with titles from the papers list
      const enriched: AiResult[] = raw
        .map((r) => {
          const paper = papers.find((p) => p.id === r.id)
          return paper ? { id: r.id, reason: r.reason, title: paper.title } : null
        })
        .filter((r): r is AiResult => r !== null)

      setResults(enriched)
      setLastQuestion(q)
      setAiHighlightIds(new Set(enriched.map((r) => r.id)))

      // Persist to history
      const entry: ChatEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        question: q,
        paperCount: filteredPapers.length,
        results: enriched
      }
      setChatHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistory(updated)
        return updated
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleClearHistory(): void {
    setChatHistory([])
    saveHistory([])
  }

  const paperCount = filteredPapers.length

  return (
    <div className="ai-panel">
      <div className="ai-panel-meta">
        Querying <strong>{paperCount}</strong> visible paper{paperCount !== 1 ? 's' : ''}
      </div>

      <form className="ai-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="ai-textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your literature… (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={loading}
        />
        <button className="ai-submit" type="submit" disabled={!question.trim() || loading}>
          {loading ? <span className="ai-spinner" /> : 'Ask'}
        </button>
      </form>

      {error && (
        <div className="ai-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="ai-results">
          <div className="ai-results-header">
            <span className="ai-results-count">
              {results.length} relevant paper{results.length !== 1 ? 's' : ''}
            </span>
            <span className="ai-results-q">for &ldquo;{lastQuestion}&rdquo;</span>
          </div>

          <div className="ai-result-list">
            {results.map((r) => (
              <div key={r.id} className="ai-result-item">
                <button
                  className="ai-result-id"
                  onClick={() => selectPaper(r.id)}
                  title="Click to select this paper"
                >
                  {r.id}
                </button>
                <div className="ai-result-title">{r.title}</div>
                <div className="ai-result-reason">{r.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && lastQuestion && !error && (
        <div className="ai-no-results">No relevant papers found for this question.</div>
      )}

      {chatHistory.length > 0 && (
        <div className="ai-history">
          <div className="ai-history-header">
            <span>Chat history</span>
            <button className="ai-history-clear" onClick={handleClearHistory} title="Clear all history">
              Clear
            </button>
          </div>
          <div className="ai-history-list">
            {chatHistory.map((entry) => (
              <div key={entry.id} className="ai-history-entry">
                <div className="ai-history-entry-meta">
                  <span className="ai-history-ts">{formatTimestamp(entry.timestamp)}</span>
                  <span className="ai-history-count">
                    {entry.results.length} result{entry.results.length !== 1 ? 's' : ''} / {entry.paperCount} papers
                  </span>
                </div>
                <div className="ai-history-question">&ldquo;{entry.question}&rdquo;</div>
                {entry.results.length > 0 && (
                  <div className="ai-history-chips">
                    {entry.results.map((r) => (
                      <button
                        key={r.id}
                        className="ai-result-id ai-history-chip"
                        onClick={() => selectPaper(r.id)}
                        title={r.title}
                      >
                        {r.id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
