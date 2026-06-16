/**
 * SafeStorage Utility
 * 
 * DESIGN RATIONALE & SECURITY WARNING:
 * Sensitive user information (such as email addresses, phone numbers, full names, 
 * student profile details, order history, and payment IDs) should NEVER be stored 
 * in localStorage or sessionStorage. 
 * 
 * Why?
 * 1. Vulnerability to XSS: Any JavaScript running on the page (including third-party scripts,
 *    libraries, or injected scripts) can read localStorage/sessionStorage via window.localStorage.
 * 2. No Expiration: localStorage persists indefinitely, meaning sensitive data remains on the 
 *    device disk long after the user session ends.
 * 3. Lacks Encryption: Browsers store this data in plaintext on the local file system, 
 *    making it accessible to other users or malware on the same machine.
 * 
 * This utility enforces a strict whitelist of allowed keys and automatically rejects 
 * any attempt to store unwhitelisted keys or sensitive patterns.
 */

const WHITELISTED_KEYS = [
  'canteen_user_id',
  'sphn_logged_in',
  'sphn_announcements',
  'sphn_products',
  'google_auth_popup_active',
  'canteen_admin_unlocked',
  'rzp_device_id',
  'theme'
];

function isKeyAllowed(key: string): boolean {
  if (WHITELISTED_KEYS.includes(key)) return true;
  if (key.startsWith('cart_cache_')) return true;
  return false;
}

// Function to validate if value contains sensitive patterns
function containsSensitiveData(value: string): boolean {
  try {
    const lower = value.toLowerCase();
    // Look for common sensitive keys in JSON structures or raw strings
    const sensitivePatterns = [
      '"email":',
      '"phone":',
      '"contactno":',
      '"fullname":',
      '"rollno":',
      '"payment_id":',
      '"paymentid":',
      '"rzp_stored_checkout_id"',
      '"rzp_checkout_anon_id"',
      '"order_history"',
      '"orders":',
      'student_profile',
      '@gmail.com',
      '@yahoo.com',
      '@outlook.com',
      '9180' // Account number prefix or similar
    ];
    
    return sensitivePatterns.some(pattern => lower.includes(pattern));
  } catch {
    return false;
  }
}

export const SafeStorage = {
  getItem(key: string): string | null {
    if (!isKeyAllowed(key)) {
      console.warn(`[SafeStorage] Blocked read of unwhitelisted key: "${key}"`);
      return null;
    }
    return localStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    if (!isKeyAllowed(key)) {
      console.error(`[SafeStorage] Blocked write of unwhitelisted key: "${key}"`);
      return;
    }
    if (containsSensitiveData(value)) {
      console.error(`[SafeStorage] Blocked write of key "${key}" because value contains sensitive patterns.`);
      return;
    }
    localStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  // SessionStorage operations (specifically whitelisted)
  getSessionItem(key: string): string | null {
    if (key !== 'canteen_admin_unlocked') {
      console.warn(`[SafeStorage] Blocked read of unwhitelisted sessionStorage key: "${key}"`);
      return null;
    }
    return sessionStorage.getItem(key);
  },

  setSessionItem(key: string, value: string): void {
    if (key !== 'canteen_admin_unlocked') {
      console.error(`[SafeStorage] Blocked write of unwhitelisted sessionStorage key: "${key}"`);
      return;
    }
    sessionStorage.setItem(key, value);
  },

  removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  },

  /**
   * Run migration function on application startup to clear all existing legacy 
   * and insecure localStorage/sessionStorage items from the user's browser.
   */
  clearInsecureKeys(): void {
    console.log('[SafeStorage] Running browser cleanup for legacy insecure storage keys...');
    const keysToRemove: string[] = [];
    
    // Scan all keys currently in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (!isKeyAllowed(key) || key.includes('student_profile') || key === 'canteen_user' || key.includes('oauth_') || key.includes('sphn_student') || key.includes('sphn_orders') || key.includes('rzp_') || key.includes('upi')) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`[SafeStorage] Removed legacy insecure key: "${key}"`);
    });

    // Clean session storage as well
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key !== 'canteen_admin_unlocked') {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`[SafeStorage] Removed legacy insecure sessionStorage key: "${key}"`);
    });
  }
};
