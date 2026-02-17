/**
 * Telegram Mini App Integration Module
 * Handles WebApp SDK initialization and user authentication
 */

let WebApp = null;

/**
 * Initialize Telegram WebApp SDK
 * @returns {Object|null} User data from Telegram or null if error
 */
export function initTelegramApp() {
    try {
        // Dynamically import WebApp from window (loaded via CDN)
        WebApp = window.Telegram?.WebApp;

        if (!WebApp) {
            console.warn('Telegram WebApp not available. Running in standalone mode.');
            return null;
        }

        // Initialize WebApp
        WebApp.ready();
        WebApp.expand();

        // Get user data
        const user = WebApp.initDataUnsafe?.user;

        if (!user) {
            console.warn('No Telegram user data available');
            return null;
        }

        console.log('Telegram user authenticated:', user);

        // Apply Telegram theme
        applyTelegramTheme();

        // Setup back button
        WebApp.BackButton.onClick(() => {
            if (window.confirm('Выйти из приложения?')) {
                WebApp.close();
            }
        });

        return {
            telegramId: user.id,
            username: user.username || '',
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            languageCode: user.language_code || 'ru',
            isPremium: user.is_premium || false,
            initData: WebApp.initData, // For backend validation
            photoUrl: user.photo_url || ''
        };
    } catch (error) {
        console.error('Telegram initialization error:', error);
        return null;
    }
}

/**
 * Apply Telegram color scheme to app
 */
function applyTelegramTheme() {
    if (!WebApp) return;

    const params = WebApp.themeParams;
    const root = document.documentElement;

    // Map Telegram theme to CSS variables
    if (params.bg_color) {
        root.style.setProperty('--tg-bg', params.bg_color);
    }
    if (params.text_color) {
        root.style.setProperty('--tg-text', params.text_color);
    }
    if (params.hint_color) {
        root.style.setProperty('--tg-hint', params.hint_color);
    }
    if (params.link_color) {
        root.style.setProperty('--tg-link', params.link_color);
    }
    if (params.button_color) {
        root.style.setProperty('--tg-button', params.button_color);
    }
    if (params.button_text_color) {
        root.style.setProperty('--tg-button-text', params.button_text_color);
    }

    console.log('Applied Telegram theme:', params);
}

/**
 * Show main button at bottom of screen
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 */
export function showMainButton(text, onClick) {
    if (!WebApp) return;

    WebApp.MainButton.setText(text);
    WebApp.MainButton.onClick(onClick);
    WebApp.MainButton.show();
}

/**
 * Hide main button
 */
export function hideMainButton() {
    if (!WebApp) return;
    WebApp.MainButton.hide();
}

/**
 * Update main button text
 * @param {string} text - New button text
 */
export function setMainButtonText(text) {
    if (!WebApp) return;
    WebApp.MainButton.setText(text);
}

/**
 * Show/hide main button loading state
 * @param {boolean} loading - Loading state
 */
export function setMainButtonLoading(loading) {
    if (!WebApp) return;

    if (loading) {
        WebApp.MainButton.showProgress();
    } else {
        WebApp.MainButton.hideProgress();
    }
}

/**
 * Show back button
 */
export function showBackButton() {
    if (!WebApp) return;
    WebApp.BackButton.show();
}

/**
 * Hide back button
 */
export function hideBackButton() {
    if (!WebApp) return;
    WebApp.BackButton.hide();
}

/**
 * Trigger haptic feedback
 * @param {string} type - Type of feedback: 'light', 'medium', 'heavy', 'rigid', 'soft'
 */
export function hapticFeedback(type = 'medium') {
    if (!WebApp?.HapticFeedback) return;

    const typeMap = {
        light: 'impact',
        medium: 'impact',
        heavy: 'impact',
        rigid: 'impact',
        soft: 'impact',
        success: 'notification',
        warning: 'notification',
        error: 'notification'
    };

    const style = typeMap[type] || 'impact';

    if (style === 'impact') {
        WebApp.HapticFeedback.impactOccurred(type);
    } else {
        WebApp.HapticFeedback.notificationOccurred(type);
    }
}

/**
 * Show native alert
 * @param {string} message - Alert message
 */
export function showAlert(message) {
    if (!WebApp) {
        alert(message);
        return;
    }
    WebApp.showAlert(message);
}

/**
 * Show native confirm dialog
 * @param {string} message - Confirm message
 * @param {Function} callback - Callback with boolean result
 */
export function showConfirm(message, callback) {
    if (!WebApp) {
        callback(confirm(message));
        return;
    }
    WebApp.showConfirm(message, callback);
}

/**
 * Close Mini App
 */
export function closeMiniApp() {
    if (!WebApp) {
        window.close();
        return;
    }
    WebApp.close();
}

/**
 * Check if running in Telegram
 * @returns {boolean}
 */
export function isTelegramEnvironment() {
    return !!window.Telegram?.WebApp;
}

/**
 * Get viewport height (accounting for Telegram UI)
 * @returns {number}
 */
export function getViewportHeight() {
    if (!WebApp) return window.innerHeight;
    return WebApp.viewportHeight;
}

/**
 * Open Telegram link
 * @param {string} url - Telegram link (t.me/...)
 */
export function openTelegramLink(url) {
    if (!WebApp) {
        window.open(url, '_blank');
        return;
    }
    WebApp.openTelegramLink(url);
}

/**
 * Open external link
 * @param {string} url - External URL
 */
export function openLink(url) {
    if (!WebApp) {
        window.open(url, '_blank');
        return;
    }
    WebApp.openLink(url);
}
