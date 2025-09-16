/**
 * Copy text to clipboard using Chrome extension API
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Use the Clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        throw new Error('Failed to copy to clipboard');
      }
      
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Check if clipboard API is available
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && window.isSecureContext);
}
