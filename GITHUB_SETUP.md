# Создание GitHub репозитория - Инструкция

## ✅ Git уже настроен!

Проект закоммичен:
- 22 файла добавлены
- Commit: "🏕️ Telegram Mini App: Initial commit with Supabase integration"

---

## 📝 Создать репозиторий на GitHub

### Вариант 1: Через веб-интерфейс (быстрее)

1. Откройте: https://github.com/new

2. Заполните форму:
   - **Repository name:** `turist-pro-planner`
   - **Description:** `🏕️ Telegram Mini App для планирования походов с умным сборщиком снаряжения`
   - **Public** ✅
   - **НЕ добавляйте** README, .gitignore, license (у нас уже есть)

3. Нажмите **Create repository**

4. Скопируйте URL репозитория (например: `https://github.com/USERNAME/turist-pro-planner.git`)

5. Выполните в терминале:

```bash
cd /Users/elzeavve/Documents/turist
git remote add origin https://github.com/USERNAME/turist-pro-planner.git
git branch -M main
git push -u origin main
```

Замените `USERNAME` на ваше имя пользователя GitHub!

---

### Вариант 2: Через GitHub CLI (если установлен)

```bash
brew install gh
gh auth login
gh repo create turist-pro-planner --public --source=. --remote=origin --push
```

---

## 🚀 После создания репозитория

Репозиторий будет доступен по адресу:
```
https://github.com/ВАШ_USERNAME/turist-pro-planner
```

### Готово к деплою на Vercel!

После push на GitHub можно сразу деплоить:

1. Откройте: https://vercel.com/new
2. Import Git Repository
3. Выберите `turist-pro-planner`
4. Deploy

Vercel автоматически создаст URL типа:
```
https://turist-pro-planner.vercel.app
```

Этот URL можно использовать для Telegram Mini App!

---

## 📋 Checklist

- [x] Git initialized
- [x] Files committed
- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Deployed on Vercel
- [ ] Telegram bot created
- [ ] Mini App connected

См. подробную инструкцию: [deployment_guide.md](file:///Users/elzeavve/.gemini/antigravity/brain/4a620654-f315-4bd0-9818-1095ae864e50/deployment_guide.md)
