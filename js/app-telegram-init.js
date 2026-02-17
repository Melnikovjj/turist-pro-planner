/**
 * Telegram-aware app initialization
 * This replaces the initApp() function in app.js
 */

// Initialize application with Telegram support
async function initAppWithTelegram() {
    const loadingScreen = document.getElementById('telegram-loading');
    const loadingText = loadingScreen?.querySelector('.loading-text');
    const loadingHint = loadingScreen?.querySelector('.loading-hint');

    try {
        // Step 1: Initialize Telegram
        if (loadingText) loadingText.textContent = 'Подключение к Telegram...';

        const telegramUser = initTelegramApp();
        const isTelegram = isTelegramEnvironment();

        // Step 2: Initialize Supabase
        if (loadingText) loadingText.textContent = 'Подключение к серверу...';
        const hasBackend = initSupabase();

        if (!isTelegram) {
            console.warn('Not running in Telegram. Using local mode.');
            if (loadingHint) loadingHint.textContent = 'Локальный режим';
        }

        // Step 3: Authenticate user
        if (isTelegram && telegramUser) {
            if (loadingText) loadingText.textContent = 'Авторизация...';

            try {
                const user = await authenticateUser(telegramUser);
                console.log('Authenticated:', user);
                announce(`Добро пожаловать, ${user.first_name || telegramUser.firstName}!`);
            } catch (error) {
                console.error('Auth error:', error);
                showAlert('Ошибка авторизации. Работаем в автономном режиме.');
            }
        }

        // Step 4: Load projects
        if (loadingText) loadingText.textContent = 'Загрузка данных...';

        let projects = [];

        if (hasBackend && isOnlineMode()) {
            try {
                projects = await fetchProjects();
                console.log(`Loaded ${projects.length} projects`);
            } catch (error) {
                console.error('Load error:', error);
                const localState = loadState();
                projects = localState.projects || [];
            }
        } else {
            const localState = loadState();
            projects = localState.projects || [];
        }

        // Create demo if empty
        if (!projects.length) {
            const demo = createDemoProject();
            projects = [demo];

            if (isOnlineMode()) {
                try {
                    await apiCreateProject(demo);
                } catch (e) {
                    console.error('Save demo failed:', e);
                }
            }
        }

        // Initialize state
        state = {
            activeModule: 'projects',
            currentProjectId: projects[0]?.id || null,
            projects: projects,
            userTemplates: [],
            tools: { waterCalc: null }
        };

        // Accessibility 
        try {
            initKeyboardNavigation();
        } catch (e) {
            console.error('A11y error:', e);
        }

        // Show app
        if (loadingText) loadingText.textContent = 'Готово!';

        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 300);
            }
        }, 200);

        render();

        setTimeout(() => {
            announce('Приложение готово');
        }, 500);

    } catch (error) {
        console.error('Init failed:', error);

        if (loadingText) loadingText.textContent = 'Ошибка';
        if (loadingHint) loadingHint.textContent = error.message;

        setTimeout(() => {
            showAlert(`Ошибка: ${error.message}`);
            state = initialState();

            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 300);
            }

            render();
        }, 1000);
    }
}

// Export for use in app.js
export { initAppWithTelegram };
