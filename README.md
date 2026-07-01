# 📋 Task Manager (Trello Clone)

Fullstack-приложение для управления досками и задачами в стиле **Trello**.

Проект позволяет создавать доски, управлять задачами, отслеживать их выполнение и работать через удобный адаптивный интерфейс.

---

## 🌐 Демо

🚀 **Открыть приложение:**
https://trello-fullstack.surge.sh

Вы можете зарегистрироваться и протестировать весь функционал прямо в браузере.

---

## 🛠️ Стек технологий

### Backend

* Node.js
* Express
* SQLite
* TypeScript
* JWT (JSON Web Tokens)
* bcrypt

### Frontend

* Vue 3
* Vue Router
* Pinia
* Axios
* Bootstrap 5

---

## ✨ Возможности

### 🔐 Авторизация

* Регистрация пользователя
* Вход по JWT
* Хранение токена в `localStorage`
* Выход из аккаунта

### 📌 Управление досками

* Создание досок
* Просмотр списка досок
* Изменение названия
* Удаление досок

### ✅ Управление задачами

* Создание задач
* Изменение названия
* Удаление задач
* Изменение статуса:

  * Done
  * Todo

### 🎨 Интерфейс

* Адаптивная верстка
* Bootstrap 5
* Автофокус при создании задачи
* Закрытие поля ввода по `Escape` / `Blur`

---

## 📁 Структура проекта

```plaintext
trello-fullstack/
│
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── database.db
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Header.vue
    │   │
    │   ├── views/
    │   │   ├── Login.vue
    │   │   ├── Register.vue
    │   │   └── Boards.vue
    │   │
    │   ├── stores/
    │   │   └── auth.js
    │   │
    │   ├── router/
    │   │   └── index.js
    │   │
    │   ├── App.vue
    │   └── main.js
    │
    ├── package.json
    └── index.html
```

---

## 🚀 Локальный запуск

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend будет доступен по адресу:

```text
http://localhost:5178
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен по адресу:

```text
http://localhost:5173
```

---

## 🗄️ База данных

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

## 🚀 Деплой

### Frontend — Surge.sh

Статический фронтенд размещён на Surge.

Сайт:
https://trello-fullstack.surge.sh

Команда деплоя:

```bash
cd frontend/dist
surge --domain trello-fullstack.surge.sh
```

---

### Backend — Render

Backend работает как Web Service.

API:

```text
https://trello-fullstack-fyd6.onrender.com
```

На фронтенде используется переменная:

```env
VITE_API_URL
```

---

## 📦 Установка зависимостей

### Backend

```bash
npm install
```

### Frontend

```bash
npm install
```

---

## 👤 Автор

GitHub: **starrager**

---

## 📄 Лицензия

MIT License
