# Craft Beer Shop - Інтернет-магазин крафтового пива

Craft Beer Shop — це жива web-аплікація для управління каталогом крафтового пива, корзиною та оформленням замовлень з повноцінним Node.js/Express бекендом та SQLite базою.

## Особливості

✅ **Управління товарами**
- Додавання нових товарів
- Редагування існуючих товарів
- Видалення товарів
- Пошук за назвою, описом, пивоварнею
- Фільтрація за категоріями
- Сортування за назвою, ціною, міцністю, датою додавання

✅ **Робота з корзиною**
- Додавання товарів у корзину
- Оновлення кількості товарів
- Видалення позицій з корзини
- Очищення корзини
- Підрахунок загальної суми
- Оформлення замовлення

✅ **Робота з зображенням**
- Завантаження власного зображення товару
- Підтримка базового64-зображень у базі даних

✅ **Технології**
- **Frontend:** HTML5, CSS3, JavaScript (ES6 modules)
- **Backend:** Node.js, Express
- **Database:** SQLite3
- **Design:** Dark theme, Mobile First, Responsive

## Архітектура

### Frontend

Клієнтська частина розбита на модулі в `public/app/`:
- `apiservice.js` — HTTP-запити до API
- `product.js` — модель товару
- `cart.js` — модель товару в корзині
- `productService.js` — логіка завантаження, пошуку, фільтрації та CRUD товарів
- `cartService.js` — логіка корзини та оформлення замовлення
- `ui.js` — рендеринг сторінок, форм, повідомлень та модальних вікон
- `app.js` — ініціалізація додатку та обробка подій
- `modal.js` — універсальний модальний компонент

### Backend

Сервер реалізовано в `server.js`. Тут створюються таблиці SQLite та визначаються API-ендпоінти.

API endpoints:
- `GET /api/products` — отримати всі товари (підтримується `search`, `sort`, `category`)
- `GET /api/products/:id` — отримати конкретний товар
- `POST /api/products` — створити товар (підтримує `multipart/form-data` з `imageFile`)
- `PUT /api/products/:id` — оновити товар
- `DELETE /api/products/:id` — видалити товар
- `GET /api/cart` — отримати поточний стан корзини
- `POST /api/cart` — додати товар у корзину
- `PUT /api/cart/:id` — оновити кількість у корзині
- `DELETE /api/cart/:id` — видалити товар з корзини
- `DELETE /api/cart` — очистити корзину
- `POST /api/orders` — оформити замовлення з поточної корзини

## Встановлення та запуск

### Вимоги
- Node.js (v14+)
- npm

### Запуск

1. Встановіть залежності:
```bash
npm install
```

2. Запустіть сервер:
```bash
npm start
```

3. Відкрийте браузер і перейдіть за адресою:
```bash
http://localhost:5300
```

### Режим розробки

```bash
npm run dev
```

> Порт сервера встановлено в `server.js` як `5300`. Якщо ви зміните порт, оновіть також `public/app/apiservice.js` у `baseURL`.

## Структура проекту

```
craft-beer-shop/
├── server.js
├── package.json
├── SETUP.md
├── README.md
├── beer_shop.db
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── img/
│   │   └── no-image.avif
│   └── app/
│       ├── apiservice.js
│       ├── app.js
│       ├── cart.js
│       ├── cartService.js
│       ├── modal.js
│       ├── product.js
│       ├── productService.js
│       └── ui.js
```

## Використання

### Перегляд каталогу
- Список доступних товарів відображається на головній сторінці
- Використовуйте поле пошуку для пошуку за назвою, описом або пивоварнею
- Сортуйте за назвою, ціною, міцністю або датою додавання
- Фільтруйте товари за категоріями

### Додавання товару
1. Відкрийте форму "Додати товар"
2. Заповніть поля:
   - Назва
   - Пивоварня
   - Ціна
   - Міцність
   - Об'єм
   - Категорія
   - Опис
   - Зображення або URL зображення
3. Натисніть "Додати товар"

### Редагування товару
1. Натисніть "Редагувати" на карточці товару
2. Змініть дані та завантажте нове зображення за потреби
3. Підтвердіть зміни

### Видалення товару
1. Натисніть "Видалити"
2. Підтвердіть дію в модальному вікні

### Робота з корзиною
1. Додайте товар у корзину
2. Перейдіть на сторінку корзини
3. Оновіть кількість або видаліть елемент
4. Натисніть "Оформити замовлення" для завершення покупки

## Дизайн

- Темна тема з теплими акцентами
- Mobile First та адаптивний дизайн
- Плавні анімації та інтуїтивний інтерфейс

## База даних

SQLite база створюється автоматично при першому запуску.

### Таблиці

**products**
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  alcohol REAL,
  volume INTEGER,
  brewery TEXT,
  category TEXT,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**cart**
```sql
CREATE TABLE cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

**orders**
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**order_items**
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

## Подальші напрямки розвитку

- Додати аутентифікацію та профілі користувачів
- Реалізувати історію замовлень
- Додати рольову адміністративну панель
- Інтегрувати платіжну систему
- Додати відгуки та рейтинг товарів

## Ліцензія

ISC

## Автор

Craft Beer Shop Team 🍺
