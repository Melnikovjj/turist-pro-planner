# VPS Deployment - Самый простой способ! 🚀

## ✅ Где взять VPS бесплатно (для студентов)

1. **Oracle Cloud** - Always Free tier (2 VM бесплатно навсегда)
2. **Google Cloud** - $300 кредита на год
3. **AWS** - Free tier на год
4. **DigitalOcean** - $200 кредита через GitHub Student Pack
5. **Azure** - Уже есть, создайте VM вместо Static Web App

---

## 🚀 Автоматический деплой (1 команда!)

### На сервере выполните:

```bash
# Скопируйте скрипт на сервер
scp deploy-vps.sh user@YOUR_SERVER_IP:~/

# Подключитесь к серверу
ssh user@YOUR_SERVER_IP

# Запустите деплой
bash deploy-vps.sh
```

**Скрипт автоматически:**
- ✅ Установит Node.js, Nginx
- ✅ Склонирует репозиторий
- ✅ Настроит systemd service
- ✅ Настроит reverse proxy
- ✅ Подготовит SSL

---

## 🔧 Ручная установка (если нужен контроль)

### 1. Создать VPS

**Рекомендуемые параметры:**
- OS: Ubuntu 22.04 LTS
- RAM: 1GB (достаточно)
- Storage: 10GB

### 2. Подключиться

```bash
ssh root@YOUR_SERVER_IP
```

### 3. Установить зависимости

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs nginx

# Certbot для SSL
apt-get install -y certbot python3-certbot-nginx
```

### 4. Загрузить код

```bash
cd /var/www
git clone https://github.com/Melnikovjj/turist-pro-planner.git
cd turist-pro-planner
npm ci
```

### 5. Запустить приложение

```bash
# Простой способ (для теста)
npx serve . -l 3000

# Или через systemd (для production)
# Используйте скрипт deploy-vps.sh
```

### 6. Настроить Nginx

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7. Получить SSL сертификат

```bash
certbot --nginx -d YOUR_DOMAIN
```

---

## 🌐 Настройка домена

### Вариант 1: Использовать IP

Можно использовать напрямую: `http://YOUR_SERVER_IP`

### Вариант 2: Бесплатный домен

1. **FreeDNS** - бесплатные поддомены
2. **DuckDNS** - `yourapp.duckdns.org`
3. Или купить домен на **Namecheap** (~$1/год)

Добавьте A-запись:
```
@ или www -> YOUR_SERVER_IP
```

---

## 🔄 Обновление приложения

```bash
cd /var/www/turist-pro-planner
git pull
sudo systemctl restart turist-pro
```

Или создайте webhook для автодеплоя!

---

## 📊 Проверка работы

```bash
# Проверить статус
sudo systemctl status turist-pro

# Посмотреть логи
sudo journalctl -u turist-pro -f

# Проверить Nginx
sudo nginx -t
```

---

## 🤖 Telegram Mini App

После деплоя используйте URL:
```
https://YOUR_DOMAIN
или
http://YOUR_SERVER_IP
```

⚠️ **Telegram требует HTTPS!** Обязательно настройте SSL через Certbot.

---

## ✅ Готово!

**Плюсы VPS:**
- ✅ Полный контроль
- ✅ Никаких ограничений
- ✅ Бесплатно для студентов
- ✅ Можно делать что угодно

**URL будет:** `https://your-domain.com` или `http://your-server-ip`

Это самый надёжный способ! 🚀
