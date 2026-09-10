#!/usr/bin/env bash
# На сервере (root): bash deploy/setup-nginx.sh
# DNS ziemergroup.ru → этот хост должен уже быть.
# Приложение слушает 127.0.0.1:6262 (docker compose).

set -euo pipefail

DOMAIN="${DOMAIN:-ziemergroup.ru}"
PORT="${PORT:-6262}"

tee "/etc/nginx/sites-available/${DOMAIN}" > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t
systemctl reload nginx

if command -v certbot &>/dev/null; then
  certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "${CERTBOT_EMAIL:-admin@${DOMAIN}}" || \
    echo "⚠️  Certbot не прошёл — проверьте DNS A-запись и запустите certbot вручную"
else
  echo "⚠️  certbot не установлен. В ISPmanager выпустите SSL для ${DOMAIN} в панели сайта."
fi

echo "✅ nginx: https://${DOMAIN} → 127.0.0.1:${PORT}"
