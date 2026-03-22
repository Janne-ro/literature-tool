import React from 'react'
import { usePapers } from '../../context/PaperContext'
import PaperDetails from './PaperDetails'
import Legend from './Legend'
import FilterPanel from './FilterPanel'

export default function Sidebar(): JSX.Element {
  const { sidebarOpen, setSidebarOpen, selectedPaperId, labelMode, setLabelMode } = usePapers()

  return (
    <>
      {/* Toggle tab on the edge of the map */}
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
            {/* Top controls row */}
            <div className="sidebar-topbar">
              <button
                className="sidebar-label-toggle"
                onClick={() => setLabelMode(labelMode === 'title' ? 'authors' : 'title')}
                title="Toggle node labels"
              >
                Show: {labelMode === 'title' ? 'Title' : 'Authors'}
              </button>
              <button
                className="icon-btn"
                onClick={() => setSidebarOpen(false)}
                title="Collapse sidebar"
              >
                ▶
              </button>
            </div>

            <div className="sidebar-scroll">
              {selectedPaperId ? (
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
