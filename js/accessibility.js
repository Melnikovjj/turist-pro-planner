/**
 * Accessibility Module
 * Keyboard navigation and screen reader support
 */

/**
 * Initialize keyboard navigation
 */
export function initKeyboardNavigation() {
    // Escape key to close modals/dialogs
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('[role="dialog"]:not([hidden])');
            if (activeModal) {
                activeModal.setAttribute('hidden', '');
                // Return focus to trigger element
                const trigger = activeModal.dataset.trigger;
                if (trigger) {
                    document.getElementById(trigger)?.focus();
                }
            }
        }
    });

    // Tab trap for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const activeModal = document.querySelector('[role="dialog"]:not([hidden])');
            if (activeModal) {
                trapFocus(e, activeModal);
            }
        }
    });

    // Enter key for buttons
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.matches('button:not([type="submit"])')) {
            e.target.click();
        }
    });
}

/**
 * Trap focus within an element
 */
function trapFocus(event, element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

/**
 * Announce to screen readers
 */
export function announce(message, priority = 'polite') {
    const announcer = getOrCreateAnnouncer(priority);
    announcer.textContent = '';
    setTimeout(() => {
        announcer.textContent = message;
    }, 100);
}

/**
 * Get or create screen reader announcer
 */
function getOrCreateAnnouncer(priority) {
    const id = `sr-announcer-${priority}`;
    let announcer = document.getElementById(id);

    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = id;
        announcer.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
    }

    return announcer;
}

/**
 * Set focus to element with announcement
 */
export function focusWithAnnouncement(element, message) {
    if (message) {
        announce(message);
    }
    setTimeout(() => {
        element.focus();
    }, 100);
}

/**
 * Add skip link for keyboard users
 */
export function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Перейти к основному содержимому';

    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const main = document.getElementById('main-content') || document.querySelector('main');
        if (main) {
            main.setAttribute('tabindex', '-1');
            main.focus();
        }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Manage focus for dynamic content
 */
export function manageDynamicFocus(container) {
    // Save current focus
    const previousFocus = document.activeElement;

    // After content update
    requestAnimationFrame(() => {
        const firstFocusable = container.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (firstFocusable) {
            firstFocusable.focus();
        } else if (previousFocus) {
            previousFocus.focus();
        }
    });
}

/**
 * Add ARIA labels to unlabeled controls
 */
export function ensureARIALabels() {
    // Check buttons without labels
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(button => {
        if (!button.textContent.trim()) {
            console.warn('Button without label:', button);
        }
    });

    // Check inputs without labels
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label && input.type !== 'hidden') {
            console.warn('Input without label:', input);
        }
    });
}
