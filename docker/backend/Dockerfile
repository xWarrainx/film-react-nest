# 1. Сборка
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Копируем package файлы
COPY backend/package*.json ./

# Устанавливаем зависимости (все для сборки)
RUN npm ci

# Копируем исходный код
COPY backend/ .

# Собираем проект
RUN npm run build

# 2. Продакшен
FROM node:20-alpine

WORKDIR /usr/src/app

# Копируем package файлы
COPY backend/package*.json ./

# Устанавливаем только продакшен зависимости
RUN npm ci --only=production

# Копируем собранный код из builder
COPY --from=builder /usr/src/app/dist ./dist

# Копируем public папку с картинками
COPY backend/public ./public

# Копируем .env
COPY backend/.env.docker ./.env

EXPOSE 3000

CMD ["node", "dist/main.js"]