# ZIEMER USER MEETING

Самостоятельное приложение: React PWA, Node.js API, PostgreSQL и Adminer. Supabase не используется.

## Запуск

1. Запустите Docker Desktop.
2. Файл `.env` уже создан с локальными паролями, JWT secret и VAPID-ключами. Не публикуйте его.
3. Для разработки с автоперезагрузкой фронтенда и API:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Портал: `http://localhost:5173`. Adminer: `http://localhost:5050`.

Для входа в Adminer используйте:

- System: `PostgreSQL`
- Server: `postgres`
- Username: значение `POSTGRES_USER` из `.env`
- Password: значение `POSTGRES_PASSWORD` из `.env`
- Database: значение `POSTGRES_DB` из `.env`

Для production-режима (Docker: nginx + API + PostgreSQL + Adminer):

```bash
./deploy.sh
```

Скрипт делает `git pull` и пересобирает контейнеры. Портал слушает порт **6262**. На сервере рядом с Nidek / Femtomed / Sunkingdom домен `ziemergroup.ru` проксируется на `127.0.0.1:6262`.

В `.env` задайте `PORT=6262` и `CORS_ORIGIN=https://ziemergroup.ru,https://www.ziemergroup.ru`.

## Данные и сброс

PostgreSQL использует именованный Docker volume. Обычный `docker compose down`, перезапуск или падение контейнера не удаляют данные.

Полное удаление данных — только явная команда:

```bash
docker compose down -v
```

Администраторы назначаются при регистрации email из `ADMIN_EMAIL` в `.env`. Укажите адреса через запятую, например `ADMIN_EMAIL=admin@bk.ru,second-admin@example.com`, до создания пользователей.
