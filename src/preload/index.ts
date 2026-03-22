import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  readCsv: (): Promise<string> => ipcRenderer.invoke('read-csv'),
  writeCsv: (content: string): Promise<{ ok: boolean; error?: string }> =>
    ipcRenderer.invoke('write-csv', content),
  readLayout: (): Promise<Record<string, { x: number; y: number }>> =>
    ipcRenderer.invoke('read-layout'),
  writeLayout: (
    layout: Record<string, { x: number; y: number }>
  ): Promise<{ ok: boolean; error?: string }> => ipcRenderer.invoke('write-layout', layout)
})
