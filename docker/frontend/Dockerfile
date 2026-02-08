# Этап 1: Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package файлы для кэширования
COPY frontend/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY frontend/ .

#  УДАЛЯЕМ .env если он есть (чтобы не перекрывал .env.production)
RUN rm -f .env 2>/dev/null || true

#  Устанавливаем production режим
ENV NODE_ENV=production

# Собираем проект
RUN npm run build

# Этап 2: Продакшен (только dist в volume)
FROM alpine:latest

WORKDIR /app

# Копируем только dist из сборки
COPY --from=builder /app/dist ./dist

# Создаем volume (как в задании)
VOLUME /app/dist

# Простая команда
CMD ["echo", "Frontend build complete"]