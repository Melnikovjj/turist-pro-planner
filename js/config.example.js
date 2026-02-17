/**
 * Configuration for Telegram Mini App
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key from Settings > API
 * 3. Create the database schema from telegram_integration_plan.md section 1.2
 * 4. Update the values below with your actual credentials
 * 5. Remove .example from filename (rename to config.js)
 */

export const config = {
    // Supabase credentials (replace with your actual values)
    supabaseUrl: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxx.supabase.co'
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY', // Your public anon key

    // App settings
    appName: 'Turist Pro Planner',
    appVersion: '2.0.0',

    // Features
    features: {
        cloudSync: true,      // Enable cloud data synchronization
        offlineMode: true,    // Allow offline usage with localStorage fallback
        telegramAuth: true,   // Require Telegram authentication
        demoMode: false,      // Allow demo mode without Telegram (for testing)
    },

    // Debug
    debug: true, // Set to false in production
};

// For local development without Supabase
export const localConfig = {
    supabaseUrl: null,
    supabaseAnonKey: null,
    appName: 'Turist Pro Planner (Local)',
    appVersion: '2.0.0-local',
    features: {
        cloudSync: false,
        offlineMode: true,
        telegramAuth: false,
        demoMode: true,
    },
    debug: true,
};
