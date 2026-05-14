# Інструкція з запуску проекту

## Швидкий старт

### 1. Встановлення залежностей
```bash
npm install
```

### 2. Запуск сервера
```bash
npm start
```

Сервер буде доступний за адресою: **http://localhost:5300**

### 3. Тестування

Відкрийте браузер та перейдіть на:

```bash
http://localhost:5300
```

## Розробка

Для автооновлення під час розробки:

```bash
npm run dev
```

## Структура проекту

```
craft-beer-shop/
├── server.js              # Node.js/Express сервер з API
├── package.json           # Залежності проекту
├── SETUP.md               # Цей файл
├── README.md              # Документація
├── beer_shop.db           # SQLite база даних (створюється автоматично)
└── public/
    ├── index.html         # HTML структура
    ├── styles.css         # CSS стилі (dark theme, responsive)
    ├── img/
    │   └── no-image.avif  # запасне зображення
    └── app/
        ├── apiservice.js
        ├── app.js
        ├── cart.js
        ├── cartService.js
        ├── modal.js
        ├── product.js
        ├── productService.js
        └── ui.js
```

## Важливі моменти

- Порт сервера встановлений у `server.js` як `5300`.
- Якщо ви зміните порт, оновіть `public/app/apiservice.js` у `baseURL`.
- База даних `beer_shop.db` створюється автоматично при першому запуску.

## Основні команди

- `npm install` — встановити всі залежності
- `npm start` — запустити сервер
- `npm run dev` — запустити сервер з `nodemon` для автооновлення

## Примітка

Усі необхідні фронтенд-скрипти знаходяться в `public/app/`. Фронтенд працює без окремого сервера — достатньо запустити `server.js`.
