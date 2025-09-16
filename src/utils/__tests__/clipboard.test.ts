import { copyToClipboard, isClipboardSupported } from '../clipboard'
import { vi, describe, beforeEach, it, expect } from 'vitest'

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
}

// Mock document.execCommand
const mockExecCommand = vi.fn()

// Mock document.createElement and related methods
const mockTextArea = {
  value: '',
  style: {},
  focus: vi.fn(),
  select: vi.fn(),
}

const mockCreateElement = vi.fn(() => mockTextArea)
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()

Object.assign(navigator, {
  clipboard: mockClipboard,
})

Object.assign(document, {
  execCommand: mockExecCommand,
  createElement: mockCreateElement,
  body: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
})

// Mock window.isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  value: true,
  writable: true,
})

describe('clipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTextArea.value = ''
  })

  describe('copyToClipboard', () => {
    it('should copy text using clipboard API when available', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)

      await copyToClipboard('test text')

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text')
    })

    it('should fallback to execCommand when clipboard API fails', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API failed'))
      mockExecCommand.mockReturnValue(true)

      await copyToClipboard('test text')

      expect(mockCreateElement).toHaveBeenCalledWith('textarea')
      expect(mockTextArea.value).toBe('test text')
      expect(mockAppendChild).toHaveBeenCalledWith(mockTextArea)
      expect(mockTextArea.focus).toHaveBeenCalled()
      expect(mockTextArea.select).toHaveBeenCalled()
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
      expect(mockRemoveChild).toHaveBeenCalledWith(mockTextArea)
    })

    it('should throw error when execCommand fails', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API failed'))
      mockExecCommand.mockReturnValue(false)

      await expect(copyToClipboard('test text')).rejects.toThrow('Failed to copy to clipboard')
    })

    it('should throw error when clipboard API is not available and execCommand fails', async () => {
      // Mock non-secure context
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true,
      })

      mockExecCommand.mockReturnValue(false)

      await expect(copyToClipboard('test text')).rejects.toThrow('Failed to copy to clipboard')
    })
  })

  describe('isClipboardSupported', () => {
    it('should return true when clipboard API is available and context is secure', () => {
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      })

      expect(isClipboardSupported()).toBe(true)
    })

    it('should return false when context is not secure', () => {
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true,
      })

      expect(isClipboardSupported()).toBe(false)
    })

    it('should return false when clipboard API is not available', () => {
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      })

      // Remove clipboard API
      delete (navigator as any).clipboard

      expect(isClipboardSupported()).toBe(false)
    })
  })
})
