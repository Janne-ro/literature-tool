const PALETTE = [
  '#4f7cff', // blue
  '#ff8c42', // orange
  '#2ec986', // green
  '#b97bff', // purple
  '#ff5858', // red
  '#f5c542', // yellow
  '#00c2d9', // cyan
  '#ff69b4', // pink
  '#20c9a6', // teal
  '#ff9f43', // golden
  '#a29bfe', // lavender
  '#fd79a8'  // rose
]

// Stable mapping from tag → color, built once from the full paper set
const colorMap = new Map<string, string>()

/**
 * Rebuilds the tag→color map from the first-tag of every paper.
 * Call this once after loading papers so that colors are stable.
 */
export function buildColorMap(papers: { tags: string[] }[]): void {
  colorMap.clear()
  const seen = new Set<string>()
  for (const p of papers) {
    const tag = p.tags[0]
    if (tag && !seen.has(tag)) {
      seen.add(tag)
      colorMap.set(tag, PALETTE[colorMap.size % PALETTE.length])
    }
  }
}

export function getTagColor(tag: string): string {
  if (!tag) return '#6b7280'
  if (!colorMap.has(tag)) {
    colorMap.set(tag, PALETTE[colorMap.size % PALETTE.length])
  }
  return colorMap.get(tag)!
}

export function getNodeColor(tags: string[]): string {
  if (!tags || tags.length === 0) return '#6b7280'
  return getTagColor(tags[0])
}

export function getAllTagColors(): Map<string, string> {
  return new Map(colorMap)
}
