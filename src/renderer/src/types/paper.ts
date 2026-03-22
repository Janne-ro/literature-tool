export interface Paper {
  id: string
  link: string
  authors: string[]
  year: string
  title: string
  articleType: string
  venue: string
  directQuotes: string[]
  otherInfo: string[]
  bibtex: string
  relatedPapers: RelatedPaper[]
  tags: string[]
}

export interface RelatedPaper {
  targetId: string
  label: string
}

export interface NodePosition {
  x: number
  y: number
}

export interface Layout {
  [id: string]: NodePosition
}

export interface Filter {
  yearMin: number | null
  yearMax: number | null
  activeTags: string[] | null // null = all tags shown
}
