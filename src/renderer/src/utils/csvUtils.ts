import Papa from 'papaparse'
import { Paper, RelatedPaper } from '../types/paper'

const CSV_COLUMNS = [
  'ID',
  'Link',
  'Authors',
  'Year',
  'Title',
  'Article type',
  'Venue',
  'Direct quotes',
  'Other info',
  'Bibtex citation',
  'Related papers',
  'Tags'
]

function parseList(value: string | undefined): string[] {
  if (!value || value.trim() === '') return []
  return value
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseRelatedPapers(value: string | undefined): RelatedPaper[] {
  if (!value || value.trim() === '') return []
  return value
    .split(';')
    .map((s) => {
      const parts = s.split('|')
      return {
        targetId: parts[0]?.trim() ?? '',
        label: parts[1]?.trim() ?? ''
      }
    })
    .filter((r) => r.targetId !== '')
}

function serializeList(arr: string[]): string {
  return arr.join(';')
}

function serializeRelatedPapers(related: RelatedPaper[]): string {
  return related.map((r) => `${r.targetId} | ${r.label}`).join(';')
}

export function parseCsv(csvContent: string): Paper[] {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    delimiter: '\t'
  })

  return result.data
    .map((row) => ({
      id: row['ID']?.trim() ?? '',
      link: row['Link']?.trim() ?? '',
      authors: parseList(row['Authors']),
      year: row['Year']?.trim() ?? '',
      title: row['Title']?.trim() ?? '',
      articleType: row['Article type']?.trim() ?? '',
      venue: row['Venue']?.trim() ?? '',
      directQuotes: parseList(row['Direct quotes']),
      otherInfo: parseList(row['Other info']),
      bibtex: row['Bibtex citation']?.trim() ?? '',
      relatedPapers: parseRelatedPapers(row['Related papers']),
      tags: parseList(row['Tags'])
    }))
    .filter((p) => p.id !== '')
}

export function serializeCsv(papers: Paper[]): string {
  const rows = papers.map((p) => ({
    ID: p.id,
    Link: p.link,
    Authors: serializeList(p.authors),
    Year: p.year,
    Title: p.title,
    'Article type': p.articleType,
    Venue: p.venue,
    'Direct quotes': serializeList(p.directQuotes),
    'Other info': serializeList(p.otherInfo),
    'Bibtex citation': p.bibtex,
    'Related papers': serializeRelatedPapers(p.relatedPapers),
    Tags: serializeList(p.tags)
  }))
  return Papa.unparse(rows, { columns: CSV_COLUMNS, delimiter: '\t' })
}

export function generateId(papers: Paper[]): string {
  const maxNum = papers.reduce((max, p) => {
    const match = p.id.match(/ID_(\d+)/)
    const num = match ? parseInt(match[1], 10) : 0
    return Math.max(max, num)
  }, 0)
  return `ID_${String(maxNum + 1).padStart(3, '0')}`
}

export function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return ''
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`
  return `${authors[0]} et al.`
}
