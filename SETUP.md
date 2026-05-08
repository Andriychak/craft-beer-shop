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

Сервер буде доступний за адресою: **http://localhost:3000**

### 3. Тестування

Відкрийте браузер та перейдіть на http://localhost:3000

## Структура проекту

```
craft-beer-shop/
├── server.js              # Node.js/Express сервер з API
├── package.json           # Залежності проекту
├── beer_shop.db          # SQLite база даних (автоматично)
├── public/
│   ├── index.html        # HTML структура
│   ├── styles.css        # CSS стилі (dark theme, responsive)
│   └── app.js            # JavaScript (ООП: класи, інкапсуляція)
├── README.md             # Документація
└── SETUP.md              # Цей файл
```

## Принципи ООП у проекті

Код структурований в 6 основних класів:

### 1. **APIService**
```javascript
// Управління HTTP запитами до сервера
- getProducts(search, sort)
- createProduct(data)
- updateProduct(id, data)
- deleteProduct(id)
- addToCart(productId, quantity)
- removeFromCart(cartItemId)
- updateCartItem(cartItemId, quantity)
- clearCart()
```

### 2. **Product**
```javascript
// Модель товару
- constructor(data)
- getPrice() - форматування ціни
- getAlcohol() - форматування крепкості
- toJSON() - серіалізація
```

### 3. **CartItem**
```javascript
// Модель товару в корзині
- constructor(data)
- getSubtotal() - розрахунок суми
- toJSON() - серіалізація
```

### 4. **Cart**
```javascript
// Управління корзиною
- addItem(cartItem)
- removeItem(cartItemId)
- updateItem(cartItemId, quantity)
- clear()
- getTotal() - розрахунок загальної суми
- getItemCount() - кількість товарів
- isEmpty()
```

### 5. **UIManager**
```javascript
// Управління інтерфейсом
- showPage(pageName)
- renderProductCard(product)
- renderProductsGrid(products)
- renderCartItem(cartItem)
- renderCart(cartItems)
- loadProductForm(product)
- showModal(title, message, onConfirm)
- escapeHtml(text) - захист від XSS
```

### 6. **App**
```javascript
// Головний клас застосунку (координатор)
- constructor() - ініціалізація
- init() - запуск
- loadProducts()
- loadCart()
- handleSearch()
- handleSort()
- handleCreateProduct(event)
- handleEditProductClick(productId)
- handleEditProduct(event)
- handleDeleteProductClick(productId)
- handleAddToCart(productId)
- handleRemoveFromCart(cartItemId)
- handleUpdateCartQuantity(cartItemId, quantity)
```

## Функціональність

### ✅ Управління товарами
- [x] Перегляд каталогу товарів
- [x] Додавання нових товарів через сервер (БД)
- [x] Редагування товарів
- [x] Видалення товарів
- [x] Пошук товарів (за назвою, описом, пивоварнею)
- [x] Сортування (за назвою, ціною, крепкістю, датою)

### ✅ Корзина
- [x] Додавання товарів в корзину
- [x] Видалення товарів з корзини
- [x] Змінення кількості товарів
- [x] Очищення корзини
- [x] Розрахунок суми

### ✅ Дизайн
- [x] Темна тема (dark mode)
- [x] Mobile First підхід
- [x] Responsive дизайн (мобільні, планшети, десктопи)
- [x] Плавні анімації та переходи

### ✅ Backend (Advanced)
- [x] SQLite база даних
- [x] Express API сервер
- [x] CRUD операції для товарів
- [x] Управління корзиною в БД
- [x] Валідація даних
- [x] Обробка помилок

## Демо дані

Для тестування, можна вручну додати товари через UI, або запустити скрипт:

```bash
node seed-database.js  # (якщо буде створений)
```

Приклад товару:
```json
{
  "name": "IPA Crazy",
  "brewery": "BrewMaster Brewery",
  "price": 85.50,
  "alcohol": 6.5,
  "volume": 500,
  "description": "Ароматне IPA з фруктовими нотками",
  "image": "https://via.placeholder.com/300x400"
}
```

## Часті запитання

### Як змінити порт?
Відкрийте `server.js` та змініть:
```javascript
const PORT = 3000; // змініть на бажаний номер
```

### Як підключити фронтенд на іншому порту?
Змініть URL в `app.js`:
```javascript
this.api = new APIService('http://localhost:3000/api');
```

### Як очистити базу даних?
Видаліть файл `beer_shop.db` - він буде пересоздан при наступному запуску сервера.

### Як дебажити?
Відкрийте браузер DevTools (F12) та перегляньте:
- Console для помилок та логів
- Network для перегляду API запитів
- Application для перегляду локального стану

## Розробка

### Для використання nodemon (auto-reload)
```bash
npm install --save-dev nodemon
npm run dev
```

### Структура запитів/відповідей API

**Успішна відповідь (200):**
```json
{
  "id": 1,
  "name": "IPA Crazy",
  "message": "Product created successfully"
}
```

**Помилка (400, 404, 500):**
```json
{
  "error": "Опис помилки"
}
```

## Безпека

- [x] XSS захист (escapeHtml)
- [x] CORS увімкнено
- [x] Валідація вхідних даних
- [x] Параметризовані SQL запити

## Наступні кроки для розширення

1. Додати реєстрацію та авторизацію користувачів
2. Зберігати корзину в БД, пов'язану з користувачем
3. Додати систему замовлень
4. Інтегрувати платіжну систему
5. Додати відгуки та оцінки товарів
6. Створити адміністративну панель

---

**Готово до роботи!** 🍺
