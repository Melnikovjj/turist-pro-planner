# Turist Pro Planner

Полнофункциональное веб-приложение для планирования походов с интеллектуальным сборщиком снаряжения.

## Telegram Mini App

Это приложение можно запустить как Telegram Mini App для мультиюзерного использования.

### Локальная разработка

```bash
npm install
npx serve .
```

Откройте http://localhost:3000

### Настройка Supabase (для production)

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL из `brain/telegram_integration_plan.md` раздел 1.2
3. Скопируйте `js/config.example.js` в `js/config.js`
4. Заполните credentials из Settings > API
5. Деплой на Vercel/Netlify

### Создание Telegram бота

1. Напишите @BotFather
2. `/newbot` → создать бота
3. `/newapp` → привязать Mini App
4. Укажите URL вашего деплоя

## Функциональность

- ✅ Умный сборщик снаряжения с учетом типа похода и сезона
- ✅ Планирование питания с расчетом КБЖУ
- ✅ Multiuser поддержка через Telegram
- ✅ Offline mode с синхронизацией
- ✅ WCAG 2.1 AA accessibility
- ✅ XSS защита и CSP headers

## Структура

```
turist/
├── index.html              # Main HTML
├── styles.css              # Styles
├── telegram-styles.css     # Telegram-specific styles
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker
└── js/
    ├── app.js              # Main app logic
    ├── telegram.js         # Telegram WebApp SDK
    ├── api.js              # Supabase client
    ├── validation.js       # Form validation
    ├── security.js         # XSS protection
    ├── accessibility.js    # A11y features
    └── config.js          # Configuration
```

## License

MIT
