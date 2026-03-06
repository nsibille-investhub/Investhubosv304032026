/**
 * Hash Preserver - Ensures the hash is not lost during initial page load
 * This is particularly important on some hosting platforms that might clear the hash
 */

// Store the initial hash as soon as the script loads
const INITIAL_HASH = window.location.hash;

console.log('[HashPreserver] Script loaded with hash:', INITIAL_HASH);

// If we have a hash, make sure it stays
if (INITIAL_HASH && INITIAL_HASH !== '#') {
  console.log('[HashPreserver] Preserving initial hash:', INITIAL_HASH);
  
  // Re-apply the hash immediately in case it gets cleared
  const checkAndRestore = () => {
    if (window.location.hash !== INITIAL_HASH) {
      console.log('[HashPreserver] Hash was changed/cleared, restoring:', INITIAL_HASH);
      window.location.hash = INITIAL_HASH;
    }
  };
  
  // Check multiple times during initial load
  setTimeout(checkAndRestore, 0);
  setTimeout(checkAndRestore, 10);
  setTimeout(checkAndRestore, 50);
  setTimeout(checkAndRestore, 100);
}

export function getPreservedHash(): string {
  return INITIAL_HASH;
}

export function wasHashPresent(): boolean {
  return Boolean(INITIAL_HASH && INITIAL_HASH !== '#');
}
