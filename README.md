# ZIEMER USER MEETING

Самостоятельное приложение: React PWA, Node.js API, PostgreSQL и pgAdmin. Supabase не используется.

## Запуск

1. Запустите Docker Desktop.
2. Файл `.env` уже создан с локальными паролями, JWT secret и VAPID-ключами. Не публикуйте его.
3. Для разработки с автоперезагрузкой фронтенда и API:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Портал: `http://localhost:5173`. pgAdmin: `http://localhost:5050`.

Чтобы добавить сервер PostgreSQL в pgAdmin, используйте:

- Host: `postgres`
- Port: `5432`
- Database: значение `POSTGRES_DB` из `.env`
- Username: значение `POSTGRES_USER` из `.env`
- Password: значение `POSTGRES_PASSWORD` из `.env`

Для production-режима (nginx + API + PostgreSQL + pgAdmin):

```bash
docker compose up --build -d
```

Портал будет на `http://localhost:8080`.

## Данные и сброс

PostgreSQL и pgAdmin используют именованные Docker volumes. Обычный `docker compose down`, перезапуск или падение контейнера не удаляют данные.

Полное удаление данных — только явная команда:

```bash
docker compose down -v
```

Администраторы назначаются при регистрации email из `ADMIN_EMAIL` в `.env`. Укажите адреса через запятую, например `ADMIN_EMAIL=admin@bk.ru,second-admin@example.com`, до создания пользователей.
