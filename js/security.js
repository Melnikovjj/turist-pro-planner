/**
 * Security Module
 * Provides XSS protection and input sanitization
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(html) {
    const text = String(html || '');
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Create safe DOM element with text content
 */
export function createSafeElement(tag, text, className) {
    const element = document.createElement(tag);
    if (text) {
        element.textContent = text; // Safe - no HTML parsing
    }
    if (className) {
        element.className = className;
    }
    return element;
}

/**
 * Safely set inner HTML with whitelist approach
 */
export function setSafeHTML(element, html) {
    // Create temporary div
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Whitelist of allowed tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'span', 'div'];

    // Remove script tags and event handlers
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Remove on* event handlers
    temp.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });

        // Remove if not in whitelist
        if (!allowedTags.includes(el.tagName.toLowerCase())) {
            el.replaceWith(...el.childNodes);
        }
    });

    element.innerHTML = temp.innerHTML;
}

/**
 * Sanitize URL to prevent javascript: protocol
 */
export function sanitizeURL(url) {
    const urlString = String(url || '');

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
    const lower = urlString.toLowerCase().trim();

    for (const protocol of dangerousProtocols) {
        if (lower.startsWith(protocol)) {
            return '#';
        }
    }

    return urlString;
}

/**
 * Generate Content Security Policy
 */
export function getCSPDirectives() {
    return {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'blob:'],
        'connect-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
    };
}

/**
 * Validate data integrity
 */
export function validateDataIntegrity(data) {
    try {
        // Check if data is valid JSON structure
        if (typeof data !== 'object' || data === null) {
            return false;
        }

        // Check required fields
        if (!Array.isArray(data.projects)) {
            return false;
        }

        // Basic sanitization check
        const jsonString = JSON.stringify(data);
        if (jsonString.includes('<script>') || jsonString.includes('javascript:')) {
            console.warn('Potentially malicious data detected');
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Secure random ID generator
 */
export function generateSecureId(prefix = 'id') {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${hex}`;
}
