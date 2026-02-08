# FILM!

## Установка

### MongoDB

Установите MongoDB скачав дистрибутив с официального сайта или с помощью пакетного менеджера вашей ОС. Также можно воспользоваться Docker (см. ветку `feat/docker`.

Выполните скрипт `test/mongodb_initial_stub.js` в консоли `mongo`.

### Бэкенд

Перейдите в папку с исходным кодом бэкенда

`cd backend`

Установите зависимости (точно такие же, как в package-lock.json) помощью команд

`npm ci` или `yarn install --frozen-lockfile`

Создайте `.env` файл из примера `.env.example`, в нём укажите:

* `DATABASE_DRIVER` - тип драйвера СУБД - в нашем случае это `mongodb`
* `DATABASE_URL` - адрес СУБД MongoDB, например `mongodb://127.0.0.1:27017/practicum`.

MongoDB должна быть установлена и запущена.

Запустите бэкенд:

`npm start:debug`

Для проверки отправьте тестовый запрос с помощью Postman или `curl`.

## Docker

Проект также может быть развернут с использованием Docker:


Локальный запуск:

docker-compose up -d

Доступно по адресу:

http://localhost - фронтенд
http://localhost:8080 - pgAdmin

Деплой проекта:

Проект развернут на Yandex Cloud и доступен по адресу:
- Веб-сайт: http://89.169.185.116
- API: http://89.169.185.116/api/afisha
- Админка БД (PgAdmin): http://89.169.185.116:8080
  - Логин: `admin@admin.com`
  - Пароль: `admin`
