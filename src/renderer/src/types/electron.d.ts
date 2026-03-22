export interface ElectronAPI {
  readCsv: () => Promise<string>
  writeCsv: (content: string) => Promise<{ ok: boolean; error?: string }>
  readLayout: () => Promise<Record<string, { x: number; y: number }>>
  writeLayout: (
    layout: Record<string, { x: number; y: number }>
  ) => Promise<{ ok: boolean; error?: string }>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
