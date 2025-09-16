import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Chrome extension APIs
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
}

// @ts-ignore
global.chrome = mockChrome

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock FileReader
global.FileReader = class {
  result: string | null = null
  onload: ((event: any) => void) | null = null

  readAsText() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 0)
  }
} as any
