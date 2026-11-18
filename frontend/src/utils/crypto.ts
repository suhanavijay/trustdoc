/**
 * Computes client-side SHA-256 hash using the browser's native SubtleCrypto API.
 * The file is hashed entirely in browser memory; the file content never leaves the device
 * during this calculation.
 */
export async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Decodes base64-encoded PDF data, creates a Blob, and triggers browser download.
 */
export function downloadBase64Pdf(base64Data: string, filename = 'trustdoc-stamped.pdf'): void {
  try {
    // Remove data URI prefix if present
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '').trim();
    
    // Decode base64 to binary string
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const blob = new Blob([byteNumbers], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (err) {
    console.error('Failed to download base64 PDF:', err);
    throw new Error('Unable to decode and download stamped PDF');
  }
}

/**
 * Formats byte size into human readable string (KB, MB, etc.)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Truncates long hex or base64 strings with an ellipsis in the middle.
 */
export function truncateMiddle(text: string, frontChars = 10, backChars = 8): string {
  if (!text || text.length <= frontChars + backChars + 3) {
    return text;
  }
  return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
}

/**
 * Helper to copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback for non-secure contexts or older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch {
    successful = false;
  }
  document.body.removeChild(textArea);
  return successful;
}
