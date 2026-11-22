# Выкладка на хостинг (Россия, без VPN)

Цель: сайт по HTTPS открывается из РФ до **28.11.2026**. Стек: Next.js + PostgreSQL в Docker.

**Выбранный вариант:** VPS у [Timeweb Cloud](https://timeweb.cloud/) (или аналог Selectel / Yandex) + `docker compose`. Зарубежные Vercel/Netlify не используем как основной хостинг (решение №4).

## Что нужно от человека

1. Аккаунт Timeweb Cloud (или другой РФ-VPS).
2. VPS: Ubuntu 22.04/24.04, от **1 vCPU / 2 GB RAM**, диск от 20 GB, регион РФ (Москва/СПб).
3. Домен или бесплатный поддомен панели (для HTTPS).
4. Два секрета: пароль Postgres и `SEED_DEMO_PASSWORD` (полный список логинов — в README: 8 студентов + 4 сотрудника по институтам).

ИИ не логинится в облако и не кладёт секреты в git.

## На сервере один раз

```bash
# Docker + Compose plugin
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# перелогиньтесь в SSH, затем:
docker --version && docker compose version
```

Клонируйте репозиторий (или загрузите архив):

```bash
git clone https://github.com/<org>/svfu-cabinet.git
cd svfu-cabinet
cp .env.deploy.example .env.deploy
nano .env.deploy   # POSTGRES_PASSWORD и SEED_DEMO_PASSWORD
```

Сборка и запуск:

```bash
docker compose --env-file .env.deploy up -d --build
docker compose --env-file .env.deploy logs -f web
```

Проверка: `http://IP_СЕРВЕРА:3000/ru/login` — форма входа, демо-аккаунты.

Повторный деплой после `git pull`:

```bash
git pull
docker compose --env-file .env.deploy up -d --build
```

`db:setup` при старте контейнера безопасен: пустые секции сидятся, заполненные пропускаются.

## HTTPS (обязательно для cookie Secure)

В production cookie сессии только по HTTPS (`secure: true`). Без сертификата вход «не сохранится».

Простой вариант — Caddy на хосте (прокси на контейнер `:3000`):

```bash
sudo apt install -y caddy
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
your.domain.ru {
    reverse_proxy 127.0.0.1:3000
}
EOF
sudo systemctl reload caddy
```

В `docker-compose.yml` порт приложения слушает только `127.0.0.1` (не весь интернет): иначе Docker обходит ufw и `http://IP:3000` открыт снаружи. Снаружи должны быть только 80/443 у Caddy.

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Порт 3000 снаружи не открывать, если стоит Caddy.

## Что проверить руками после выкладки

| Проверка | Ожидание |
|---|---|
| Открыть с телефона (мобильный интернет РФ) | логин без VPN |
| Войти `s.nikolaeva` | Сегодня / расписание / заявки |
| Войти `dekanat.imi` | очередь, объявления, изменения |
| Чужой `/ru/requests/99999` | 404 |
| `document.cookie` в консоли | сессионной cookie не видно (httpOnly) |

## Откат / логи

```bash
docker compose --env-file .env.deploy logs --tail=100 web
docker compose --env-file .env.deploy ps
```

Данные Postgres в volume `pgdata`. Сносить volume только осознанно (`docker compose down -v` удалит базу).

## Локальная проверка образа (по желанию)

На своём ПК с Docker:

```bash
cp .env.deploy.example .env.deploy
# заполнить пароли; для http://localhost добавьте:
# COOKIE_SECURE=0
docker compose --env-file .env.deploy up -d --build
```

В `docker-compose.yml` пробросьте переменную, если тестируете без HTTPS:

```yaml
# в environment у web:
COOKIE_SECURE: ${COOKIE_SECURE:-}
```

На боевом сервере `COOKIE_SECURE` не задавайте (по умолчанию cookie только по HTTPS).
