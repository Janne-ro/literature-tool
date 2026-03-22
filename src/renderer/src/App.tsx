import React, { useState } from 'react'
import { PaperProvider, usePapers } from './context/PaperContext'
import LiteratureMap from './components/Map/LiteratureMap'
import PaperTable from './components/Table/PaperTable'
import Sidebar from './components/Sidebar/Sidebar'
import AddPaperDialog from './components/AddPaper/AddPaperDialog'

function AppShell(): JSX.Element {
  const { activeView, setView } = usePapers()
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <div className="app">
      {/* Tab bar */}
      <header className="tab-bar">
        <div className="tab-bar-logo">Literature Tool</div>
        <div className="tab-bar-tabs">
          <button
            className={`tab ${activeView === 'map' ? 'tab--active' : ''}`}
            onClick={() => setView('map')}
          >
            Map
          </button>
          <button
            className={`tab ${activeView === 'table' ? 'tab--active' : ''}`}
            onClick={() => setView('table')}
          >
            Table
          </button>
        </div>
      </header>

      {/* Main content + sidebar */}
      <div className="content-area">
        <main className="main-view">
          {activeView === 'map' ? <LiteratureMap /> : <PaperTable />}
        </main>
        <Sidebar />
      </div>

      {/* Add paper FAB */}
      <button
        className="fab"
        onClick={() => setShowAddDialog(true)}
        title="Add paper"
        aria-label="Add paper"
      >
        +
      </button>

      {showAddDialog && <AddPaperDialog onClose={() => setShowAddDialog(false)} />}
    </div>
  )
}

export default function App(): JSX.Element {
  return (
    <PaperProvider>
      <AppShell />
    </PaperProvider>
  )
}
