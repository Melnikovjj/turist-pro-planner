# Azure App Service - Альтернативный деплой

## ✅ Работает со студенческой подпиской!

Static Web Apps заблокирован? Используем **Azure App Service** (обычный Web App).

---

## 🚀 Создание через Azure Portal

### 1. Создать Web App

1. Azure Portal → **Create a resource**
2. Найти **Web App** (НЕ Static Web App!)
3. **Create**

### 2. Заполнить форму

**Basics:**
- Resource Group: `turist-pro-rg`
- Name: `turist-pro-planner` (будет URL)
- Publish: **Code**
- Runtime stack: **Node 18 LTS**
- Operating System: **Linux**
- Region: **West Europe**
- Pricing Plan: **Free F1** ✅ (студенческий доступен)

**Deployment:**
- Пропустить пока

**Нажать Create**

---

## 📦 Добавить конфиг для Azure App Service

Создайте файл в корне проекта.

---

## 🔧 Деплой через GitHub Actions

Используем готовый workflow:

```yaml
# .github/workflows/azure-webapps-node.yml
name: Deploy to Azure Web App

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: turist-pro-planner
  NODE_VERSION: '18.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
    
    - name: Install dependencies
      run: npm ci
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

---

## 🔑 Получить Publish Profile

1. Azure Portal → Web App → Overview
2. Кнопка **Get publish profile** (скачать файл)
3. Открыть файл, скопировать ВСЁ содержимое

4. GitHub → Settings → Secrets → New secret
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: вставить содержимое файла

---

## ⚙️ Настроить Web App

В Azure Portal → ваш Web App:

1. **Configuration** → **General settings**
   - Stack: Node 18
   - Startup command: `npx serve .`

2. Save

---

## 🚀 Деплой

Готово! Теперь:

```bash
git push
```

Приложение задеплоится на:
```
https://turist-pro-planner.azurewebsites.net
```

---

## ✅ Плюсы этого способа

- ✅ Работает со студенческой подпиской
- ✅ Бесплатный tier F1
- ✅ Автодеплой из GitHub
- ✅ HTTPS из коробки

---

**Это обходит ограничение Static Web Apps!** 🎉
