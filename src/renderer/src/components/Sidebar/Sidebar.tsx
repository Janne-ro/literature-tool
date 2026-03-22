import React, { useState } from 'react'
import { usePapers } from '../../context/PaperContext'
import PaperDetails from './PaperDetails'
import Legend from './Legend'
import FilterPanel from './FilterPanel'
import AiPanel from '../AI/AiPanel'

type SidebarMode = 'paper' | 'ai'

export default function Sidebar(): JSX.Element {
  const { sidebarOpen, setSidebarOpen, selectedPaperId, labelMode, setLabelMode } = usePapers()
  const [mode, setMode] = useState<SidebarMode>('paper')

  return (
    <>
      {/* Re-open tab when collapsed */}
      {!sidebarOpen && (
        <button
          className="sidebar-open-btn"
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
        >
          ◀
        </button>
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        {sidebarOpen && (
          <>
            {/* ── Top bar ─────────────────────────────────────── */}
            <div className="sidebar-topbar">
              {/* Paper / AI mode toggle */}
              <div className="sidebar-mode-tabs">
                <button
                  className={`sidebar-mode-tab ${mode === 'paper' ? 'sidebar-mode-tab--active' : ''}`}
                  onClick={() => setMode('paper')}
                >
                  Paper
                </button>
                <button
                  className={`sidebar-mode-tab ${mode === 'ai' ? 'sidebar-mode-tab--active' : ''}`}
                  onClick={() => setMode('ai')}
                >
                  ✦ Ask AI
                </button>
              </div>

              <div className="sidebar-topbar-right">
                {mode === 'paper' && (
                  <button
                    className="sidebar-label-toggle"
                    onClick={() => setLabelMode(labelMode === 'title' ? 'authors' : 'title')}
                    title="Toggle node labels"
                  >
                    {labelMode === 'title' ? 'Title' : 'Authors'}
                  </button>
                )}
                <button
                  className="icon-btn"
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse sidebar"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* ── Scrollable body ──────────────────────────────── */}
            <div className="sidebar-scroll">
              {/* Upper section — switches between paper details and AI panel */}
              {mode === 'ai' ? (
                <AiPanel />
              ) : selectedPaperId ? (
                <PaperDetails />
              ) : (
                <div className="sidebar-no-selection">
                  <p className="sidebar-hint">Click a node to view paper details</p>
                </div>
              )}

              <div className="sidebar-divider" />
              <FilterPanel />

              <div className="sidebar-divider" />
              <Legend />
            </div>
          </>
        )}
      </aside>
    </>
  )
}
