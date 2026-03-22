import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Paper, Layout, Filter, NodePosition } from '../types/paper'
import { parseCsv, serializeCsv, generateId } from '../utils/csvUtils'
import { buildColorMap, getAllTagColors } from '../utils/colorUtils'

interface PaperContextType {
  papers: Paper[]
  filteredPapers: Paper[]
  layout: Layout
  selectedPaperId: string | null
  activeView: 'map' | 'table'
  labelMode: 'title' | 'authors'
  filter: Filter
  tagColorMap: Map<string, string>
  allTags: string[]
  yearBounds: { min: number; max: number }
  sidebarOpen: boolean

  selectPaper: (id: string | null) => void
  updatePaper: (paper: Paper) => void
  addPaper: (paper: Paper) => void
  setView: (view: 'map' | 'table') => void
  setLabelMode: (mode: 'title' | 'authors') => void
  setFilter: (filter: Partial<Filter>) => void
  updateNodePosition: (id: string, position: NodePosition) => void
  setSidebarOpen: (open: boolean) => void
  nextId: () => string
}

const PaperContext = createContext<PaperContextType | null>(null)

function getDefaultPosition(index: number, cols: number): NodePosition {
  const col = index % cols
  const row = Math.floor(index / cols)
  return {
    x: col * 340 + 80,
    y: row * 220 + 80
  }
}

export function PaperProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [papers, setPapers] = useState<Paper[]>([])
  const [layout, setLayout] = useState<Layout>({})
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'map' | 'table'>('map')
  const [labelMode, setLabelModeState] = useState<'title' | 'authors'>('title')
  const [filter, setFilterState] = useState<Filter>({
    yearMin: null,
    yearMax: null,
    activeTags: null
  })
  const [sidebarOpen, setSidebarOpenState] = useState(true)
  const [tagColorMap, setTagColorMap] = useState<Map<string, string>>(new Map())

  // Debounce layout saves
  const layoutSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load papers and layout on mount
  useEffect(() => {
    async function load(): Promise<void> {
      const [csvContent, savedLayout] = await Promise.all([
        window.api.readCsv(),
        window.api.readLayout()
      ])

      const loaded = parseCsv(csvContent)
      buildColorMap(loaded)
      setTagColorMap(getAllTagColors())
      setPapers(loaded)

      // Fill in missing positions with a grid layout
      const cols = Math.max(1, Math.ceil(Math.sqrt(loaded.length)))
      const merged: Layout = {}
      loaded.forEach((p, i) => {
        merged[p.id] = savedLayout[p.id] ?? getDefaultPosition(i, cols)
      })
      setLayout(merged)
    }
    load()
  }, [])

  // Save to CSV whenever papers change (skip initial empty state)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (papers.length === 0) return
    const csv = serializeCsv(papers)
    window.api.writeCsv(csv)
  }, [papers])

  // Debounced layout save
  const saveLayout = useCallback((newLayout: Layout) => {
    if (layoutSaveTimer.current) clearTimeout(layoutSaveTimer.current)
    layoutSaveTimer.current = setTimeout(() => {
      window.api.writeLayout(newLayout)
    }, 500)
  }, [])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    papers.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [papers])

  const yearBounds = useMemo(() => {
    const years = papers.map((p) => parseInt(p.year, 10)).filter((y) => !isNaN(y))
    return {
      min: years.length > 0 ? Math.min(...years) : 2000,
      max: years.length > 0 ? Math.max(...years) : new Date().getFullYear()
    }
  }, [papers])

  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const year = parseInt(p.year, 10)
      if (filter.yearMin !== null && !isNaN(year) && year < filter.yearMin) return false
      if (filter.yearMax !== null && !isNaN(year) && year > filter.yearMax) return false
      if (filter.activeTags !== null && filter.activeTags.length > 0) {
        const hasTag = p.tags.some((t) => filter.activeTags!.includes(t))
        if (!hasTag) return false
      }
      return true
    })
  }, [papers, filter])

  const selectPaper = useCallback((id: string | null) => {
    setSelectedPaperId(id)
    if (id !== null) setSidebarOpenState(true)
  }, [])

  const updatePaper = useCallback((updated: Paper) => {
    setPapers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    // Rebuild colors in case tags changed
    setPapers((prev) => {
      buildColorMap(prev)
      setTagColorMap(getAllTagColors())
      return prev
    })
  }, [])

  const addPaper = useCallback(
    (paper: Paper) => {
      setPapers((prev) => {
        const next = [...prev, paper]
        buildColorMap(next)
        setTagColorMap(getAllTagColors())
        return next
      })
      // Give it a default position
      const cols = Math.max(1, Math.ceil(Math.sqrt(papers.length + 1)))
      const newPos = getDefaultPosition(papers.length, cols)
      setLayout((prev) => {
        const next = { ...prev, [paper.id]: newPos }
        saveLayout(next)
        return next
      })
    },
    [papers.length, saveLayout]
  )

  const setView = useCallback((view: 'map' | 'table') => setActiveView(view), [])
  const setLabelMode = useCallback((mode: 'title' | 'authors') => setLabelModeState(mode), [])
  const setSidebarOpen = useCallback((open: boolean) => setSidebarOpenState(open), [])

  const setFilter = useCallback((partial: Partial<Filter>) => {
    setFilterState((prev) => ({ ...prev, ...partial }))
  }, [])

  const updateNodePosition = useCallback(
    (id: string, position: NodePosition) => {
      setLayout((prev) => {
        const next = { ...prev, [id]: position }
        saveLayout(next)
        return next
      })
    },
    [saveLayout]
  )

  const nextId = useCallback(() => generateId(papers), [papers])

  const value = useMemo<PaperContextType>(
    () => ({
      papers,
      filteredPapers,
      layout,
      selectedPaperId,
      activeView,
      labelMode,
      filter,
      tagColorMap,
      allTags,
      yearBounds,
      sidebarOpen,
      selectPaper,
      updatePaper,
      addPaper,
      setView,
      setLabelMode,
      setFilter,
      updateNodePosition,
      setSidebarOpen,
      nextId
    }),
    [
      papers,
      filteredPapers,
      layout,
      selectedPaperId,
      activeView,
      labelMode,
      filter,
      tagColorMap,
      allTags,
      yearBounds,
      sidebarOpen,
      selectPaper,
      updatePaper,
      addPaper,
      setView,
      setLabelMode,
      setFilter,
      updateNodePosition,
      setSidebarOpen,
      nextId
    ]
  )

  return <PaperContext.Provider value={value}>{children}</PaperContext.Provider>
}

export function usePapers(): PaperContextType {
  const ctx = useContext(PaperContext)
  if (!ctx) throw new Error('usePapers must be used inside PaperProvider')
  return ctx
}
