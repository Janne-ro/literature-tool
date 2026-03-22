import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'

const isDev = process.env['NODE_ENV'] === 'development'

// Defer dataDir resolution so app.getPath() is only called after app is ready
let dataDir: string
let csvPath: string
let layoutPath: string

const CSV_HEADER =
  'ID,Link,Authors,Year,Title,Article type,Venue,Direct quotes,Other info,Bibtex citation,Related papers,Tags'

function initPaths(): void {
  dataDir = isDev ? join(process.cwd(), 'data') : join(app.getPath('userData'), 'data')
  csvPath = join(dataDir, 'papers.csv')
  layoutPath = join(dataDir, 'layout.json')
}

function ensureDataDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, CSV_HEADER + '\n', 'utf-8')
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    backgroundColor: '#0f0f13',
    titleBarStyle: 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  initPaths()
  ensureDataDir()

  ipcMain.handle('read-csv', () => {
    try {
      return fs.readFileSync(csvPath, 'utf-8')
    } catch {
      return CSV_HEADER + '\n'
    }
  })

  ipcMain.handle('write-csv', (_event, content: string) => {
    try {
      fs.writeFileSync(csvPath, content, 'utf-8')
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('read-layout', () => {
    try {
      const raw = fs.readFileSync(layoutPath, 'utf-8')
      return JSON.parse(raw)
    } catch {
      return {}
    }
  })

  ipcMain.handle('write-layout', (_event, layout: Record<string, { x: number; y: number }>) => {
    try {
      fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), 'utf-8')
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
