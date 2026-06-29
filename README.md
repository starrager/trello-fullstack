# 📋 Task Manager (Trello Clone)

Fullstack-приложение для управления досками и задачами (аналог Trello).

---

## 🛠️ Технологии

### Backend

* Node.js
* Express
* SQLite
* JWT (JSON Web Tokens)
* bcrypt
* TypeScript

### Frontend

* Vue 3
* Vue Router
* Pinia
* Axios
* Bootstrap 5

---

## ✨ Функционал

### Авторизация

* Регистрация пользователя
* Вход в аккаунт через JWT
* Хранение токена в `localStorage`
* Выход из аккаунта

### Работа с досками

* Создание досок
* Просмотр досок
* Изменение названия досок
* Удаление досок

### Работа с задачами

* Создание задач
* Изменение названия задач
* Удаление задач
* Переключение статуса:

  * ✅ Done
  * ⏳ Todo

### Интерфейс

* Адаптивный дизайн (Bootstrap 5)

---

## 📁 Архитектура проекта

```plaintext
trello-fullstack/
│
├── backend/                    # Backend (Node.js + Express)
│   ├── src/
│   │   └── server.ts           # Главный файл сервера
│   ├── database.db             # База данных SQLite
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    # Переменные окружения
│
└── frontend/                   # Frontend (Vue 3)
    ├── src/
    │   ├── components/
    │   │   └── Header.vue      # Шапка приложения
    │   │
    │   ├── views/
    │   │   ├── Login.vue       # Вход
    │   │   ├── Register.vue    # Регистрация
    │   │   └── Boards.vue      # Доски и задачи
    │   │
    │   ├── stores/
    │   │   └── auth.js         # Pinia Store
    │   │
    │   ├── router/
    │   │   └── index.js        # Маршрутизация
    │   │
    │   ├── App.vue             # Корневой компонент
    │   └── main.js             # Точка входа
    │
    ├── package.json
    └── index.html
```

---

## 🚀 Запуск проекта

### 1. Запуск Backend

```bash
cd backend
npm install
npm run dev
```

Сервер будет доступен по адресу:

```text
http://localhost:5178
```

---

### 2. Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно по адресу:

```text
http://localhost:5173
```

---

## 🔑 Авторизация

Приложение поддерживает:

* Регистрацию нового пользователя

  * Email
  * Username
  * Password

* Авторизацию через JWT

* Сохранение токена:

```text
localStorage
```

* Выход из аккаунта с очисткой данных

---

## 🗄️ База данных (SQLite)

### Таблицы

| Таблица | Поля                             |
| ------- | -------------------------------- |
| users   | id, username, email, password    |
| boards  | id, boardname, content, userId   |
| tasks   | id, description, status, boardId |

---

### Связи

```text
boards.userId → users.id
(один пользователь → много досок)

tasks.boardId → boards.id
(одна доска → много задач)
```

### Каскадное удаление

```sql
ON DELETE CASCADE
```

При удалении доски автоматически удаляются все связанные задачи.

---

## 📌 Планы по развитию

* Drag & Drop для задач
* Дедлайны
* Админ-панель
* Деплой на Render / Vercel
* Переход с SQLite на PostgreSQL
* Docker контейнеризация

---

## 👤 Автор

**GitHub:** `starrager`
