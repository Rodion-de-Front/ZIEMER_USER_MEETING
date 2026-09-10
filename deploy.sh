#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Начало деплоя приложения..."

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT_DIR/.env"
  set +a
fi

echo "📥 Получение изменений с git..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  git pull || echo "⚠️  Предупреждение: не удалось выполнить git pull (возможно, нет подключения к репозиторию)"
else
  echo "⚠️  Предупреждение: это не git репозиторий, пропускаем git pull"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker не установлен."
  exit 1
fi

echo "🔨 Пересборка и запуск Docker..."
docker compose up --build -d

echo ""
echo "📊 Статус контейнеров:"
docker compose ps

echo ""
echo "✅ Деплой завершен успешно!"
echo "🌐 Портал: http://127.0.0.1:${PORT:-6262} (ziemergroup.ru → этот порт)"
echo "📝 Логи: docker compose logs -f"
