# Azure Static Web App - Быстрая настройка деплоя

## ✅ Вы создали Azure Static Web App!

Теперь нужно подключить его к GitHub репозиторию.

---

## 🔑 Шаг 1: Получить Deployment Token

1. Откройте [Azure Portal](https://portal.azure.com)
2. Найдите ваш Static Web App
3. В меню слева: **Settings** → **Overview**
4. Нажмите **Manage deployment token** (справа вверху)
5. **Скопируйте токен** (длинная строка)

---

## 🔐 Шаг 2: Добавить токен в GitHub

1. Откройте: https://github.com/Melnikovjj/turist-pro-planner/settings/secrets/actions

2. Нажмите **New repository secret**

3. Заполните:
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value:** вставьте скопированный токен
   
4. Нажмите **Add secret**

---

## 🚀 Шаг 3: Запустить деплой

Workflow файл уже готов! Теперь просто:

```bash
cd /Users/elzeavve/Documents/turist
git commit --allow-empty -m "🚀 Trigger Azure deployment"
git push
```

Или можно вручную запустить:
1. https://github.com/Melnikovjj/turist-pro-planner/actions
2. Выберите **Azure Static Web Apps CI/CD**
3. Нажмите **Run workflow**

---

## 📊 Проверить статус

**GitHub Actions:**  
https://github.com/Melnikovjj/turist-pro-planner/actions

**Azure Portal:**  
Portal → Static Web App → Overview → URL

---

## 🌐 Получить URL

После успешного деплоя:
1. Azure Portal → ваш Static Web App
2. **Overview** → **URL**
3. Скопируйте (например: `https://nice-tree-123.azurestaticapps.net`)

Этот URL используйте для Telegram Mini App!

---

## ⚡ Быстрый старт

Выполните эти команды:

```bash
# 1. Получите токен из Azure Portal
# 2. Добавьте в GitHub Secrets
# 3. Запустите деплой:
git commit --allow-empty -m "🚀 Deploy to Azure"
git push
```

**Готово через 2-3 минуты!**
