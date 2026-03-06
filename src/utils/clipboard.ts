/**
 * Utility to copy text to clipboard with fallback for environments
 * where the Clipboard API is blocked or unavailable
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, using fallback:', err);
      // Fall through to fallback method
    }
  }

  // Fallback method using execCommand
  return fallbackCopyToClipboard(text);
}

/**
 * Fallback method for copying text when Clipboard API is not available
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make it invisible and non-interactive
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    
    const success = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    
    return success;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}
