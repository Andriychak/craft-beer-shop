// ===== API Service Class =====
class APIService {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Products endpoints
  async getProducts(search = null, sort = 'name', category = 'all') {
    let endpoint = '/products?sort=' + sort;
    if (search) {
      endpoint += '&search=' + encodeURIComponent(search);
    }
    if (category && category !== 'all') {
      endpoint += '&category=' + encodeURIComponent(category);
    }
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', 'POST', productData);
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, 'PUT', productData);
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, 'DELETE');
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/cart', 'POST', { product_id: productId, quantity });
  }

  async removeFromCart(cartItemId) {
    return this.request(`/cart/${cartItemId}`, 'DELETE');
  }

  async updateCartItem(cartItemId, quantity) {
    return this.request(`/cart/${cartItemId}`, 'PUT', { quantity });
  }

  async clearCart() {
    return this.request('/cart', 'DELETE');
  }
}

// ===== Product Class =====
class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this.price = data.price;
    this.alcohol = data.alcohol || 0;
    this.volume = data.volume || 500;
    this.brewery = data.brewery || '';
    this.category = data.category || 'Не зазначено';
    this.image = data.image || '';
  }

  getPrice() {
    return this.price.toFixed(2);
  }

  getAlcohol() {
    return this.alcohol.toFixed(1);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      alcohol: this.alcohol,
      volume: this.volume,
      brewery: this.brewery,
      category: this.category,
      image: this.image,
    };
  }
}

// ===== Cart Item Class =====
class CartItem {
  constructor(data) {
    this.cartId = data.cart_id;
    this.productId = data.id;
    this.name = data.name;
    this.price = data.price;
    this.quantity = data.quantity;
    this.alcohol = data.alcohol || 0;
    this.volume = data.volume || 500;
    this.brewery = data.brewery || '';
    this.image = data.image || '';
  }

  getSubtotal() {
    return (this.price * this.quantity).toFixed(2);
  }

  toJSON() {
    return {
      cartId: this.cartId,
      productId: this.productId,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      alcohol: this.alcohol,
      volume: this.volume,
      brewery: this.brewery,
      image: this.image,
    };
  }
}

// ===== Cart Class =====
class Cart {
  constructor() {
    this.items = [];
  }

  addItem(cartItem) {
    this.items.push(cartItem);
  }

  removeItem(cartItemId) {
    this.items = this.items.filter((item) => item.cartId !== cartItemId);
  }

  updateItem(cartItemId, quantity) {
    const item = this.items.find((item) => item.cartId === cartItemId);
    if (item) {
      item.quantity = quantity;
    }
  }

  clear() {
    this.items = [];
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + parseFloat(item.getSubtotal()), 0).toFixed(2);
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

// ===== UI Manager Class =====
class UIManager {
  constructor() {
    this.currentPage = 'products';
  }

  showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach((page) => {
      page.classList.remove('active');
    });

    // Show selected page
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
      page.classList.add('active');
      this.currentPage = pageName;
    }
  }

  renderProductCard(product) {
    const imageUrl = product.image || '';
    const imageContent = imageUrl
      ? `<img src="${imageUrl}" alt="${product.name}">`
      : `<div class="product-image-placeholder">🍺</div>`;

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          ${imageContent}
        </div>
        <div class="product-content">
          <div class="product-header">
            <div class="product-name">${this.escapeHtml(product.name)}</div>
            ${product.brewery ? `<div class="product-brewery">${this.escapeHtml(product.brewery)}</div>` : ''}
            ${product.category ? `<div class="product-category">${this.escapeHtml(product.category)}</div>` : ''}
          </div>
          
          <div class="product-info">
            <div class="info-item">
              <span class="info-label">Крепкість:</span>
              <span class="info-value">${product.alcohol}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">Об'єм:</span>
              <span class="info-value">${product.volume}мл</span>
            </div>
          </div>

          ${product.description ? `<div class="product-description">${this.escapeHtml(product.description)}</div>` : ''}
          
          <div class="product-price">${product.price.toFixed(2)} грн</div>
          
          <div class="product-actions">
            <button class="btn btn-success btn-sm" onclick="app.handleAddToCart(${product.id})">До корзини</button>
            <button class="btn btn-warning btn-sm" onclick="app.handleEditProductClick(${product.id})">Редагувати</button>
            <button class="btn btn-danger btn-sm" onclick="app.handleDeleteProductClick(${product.id})">Видалити</button>
          </div>
        </div>
      </div>
    `;
  }

  renderProductsGrid(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">Товари не знайдені</div>';
      return;
    }

    container.innerHTML = products.map((product) => this.renderProductCard(product)).join('');
  }

  renderCartItem(cartItem) {
    const imageUrl = cartItem.image || '';
    const imageContent = imageUrl
      ? `<img src="${imageUrl}" alt="${cartItem.name}">`
      : `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 2rem;">🍺</div>`;

    return `
      <div class="cart-item" data-cart-id="${cartItem.cartId}">
        <div class="cart-item-image">
          ${imageContent}
        </div>
        <div class="cart-item-content">
          <div class="cart-item-name">${this.escapeHtml(cartItem.name)}</div>
          ${cartItem.brewery ? `<div class="cart-item-brewery">${this.escapeHtml(cartItem.brewery)}</div>` : ''}
          <div class="cart-item-price">${cartItem.price.toFixed(2)} грн</div>
        </div>
        <div class="cart-item-controls">
          <input type="number" min="1" class="quantity-input" value="${cartItem.quantity}" 
                 onchange="app.handleUpdateCartQuantity(${cartItem.cartId}, this.value)">
          <button class="btn btn-danger btn-sm" onclick="app.handleRemoveFromCart(${cartItem.cartId})">Видалити</button>
        </div>
      </div>
    `;
  }

  renderCart(cartItems) {
    const container = document.getElementById('cartContainer');
    if (!container) return;

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <h3>Корзина порожня</h3>
          <p>Додайте товари в корзину</p>
          <button class="btn btn-primary" onclick="app.showPage('products')" style="margin-top: 1rem;">
            Перейти до каталогу
          </button>
        </div>
      `;
      return;
    }

    const itemsHTML = cartItems.map((item) => this.renderCartItem(item)).join('');
    let total = 0;
    let count = 0;

    cartItems.forEach((item) => {
      total += parseFloat(item.price) * item.quantity;
      count += item.quantity;
    });

    const summaryHTML = `
      <div class="cart-summary">
        <div class="summary-row">
          <span>Кількість товарів:</span>
          <span>${count}</span>
        </div>
        <div class="summary-row total">
          <span>Сума:</span>
          <span>${total.toFixed(2)} грн</span>
        </div>
      </div>
      <div class="cart-actions">
        <button class="btn btn-success">Оформити замовлення</button>
        <button class="btn btn-danger" onclick="app.handleClearCart()">Очистити корзину</button>
      </div>
    `;

    container.innerHTML = itemsHTML + summaryHTML;
  }

  loadProductForm(product = null) {
    if (product) {
      document.getElementById('editId').value = product.id;
      document.getElementById('editName').value = product.name;
      document.getElementById('editBrew').value = product.brewery || '';
      document.getElementById('editPrice').value = product.price;
      document.getElementById('editAlcohol').value = product.alcohol || '';
      document.getElementById('editVolume').value = product.volume || '';
      document.getElementById('editCategory').value = product.category || 'Світле';
      document.getElementById('editImage').value = product.image || '';
      document.getElementById('editDescription').value = product.description || '';
    }
  }

  clearProductForm(isEdit = false) {
    const formId = isEdit ? 'editForm' : 'createForm';
    document.getElementById(formId).reset();
  }

  updateCartCount(count) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = count;
    }
  }

  showModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');

    titleEl.textContent = title;
    messageEl.textContent = message;

    this.currentConfirmAction = onConfirm;

    modal.classList.add('show');
  }

  closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
    this.currentConfirmAction = null;
  }

  showNotification(message, type = 'success') {
    // Simple notification using alert - can be enhanced with a toast component
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ===== Main App Class =====
class App {
  constructor() {
    this.api = new APIService();
    this.ui = new UIManager();
    this.cart = new Cart();
    this.products = [];
    this.currentSort = 'name';
    this.currentSearch = '';
    this.currentCategory = 'all';
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadProducts();
    await this.loadCart();
  }

  setupEventListeners() {
    // Navigation
    window.showPage = (pageName) => this.showPage(pageName);

    // Product search and sort
    window.searchProducts = () => this.handleSearch();
    window.sortProducts = () => this.handleSort();
    window.filterCategory = () => this.handleFilter();

    // Form submissions
    const createForm = document.getElementById('createForm');
    if (createForm) {
      createForm.addEventListener('submit', (e) => this.handleCreateProduct(e));
    }

    const editForm = document.getElementById('editForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleEditProduct(e));
    }

    // Cart and delete actions
    window.app = this;
  }

  showPage(pageName) {
    this.ui.showPage(pageName);
  }

  async loadProducts() {
    try {
      const products = await this.api.getProducts(this.currentSearch, this.currentSort, this.currentCategory);
      this.products = products.map((p) => new Product(p));
      this.ui.renderProductsGrid(this.products);
    } catch (error) {
      console.error('Error loading products:', error);
      this.ui.showNotification('Помилка при завантаженні товарів', 'error');
    }
  }

  async loadCart() {
    try {
      const cartItems = await this.api.getCart();
      this.cart.clear();
      cartItems.forEach((item) => {
        this.cart.addItem(new CartItem(item));
      });
      this.ui.updateCartCount(this.cart.getItemCount());
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  handleSearch() {
    this.currentSearch = document.getElementById('searchInput').value;
    this.loadProducts();
  }

  handleSort() {
    this.currentSort = document.getElementById('sortSelect').value;
    this.loadProducts();
  }

  handleFilter() {
    this.currentCategory = document.getElementById('categoryFilter').value;
    this.loadProducts();
  }

  async handleCreateProduct(event) {
    event.preventDefault();

    const productData = {
      name: document.getElementById('createName').value,
      brewery: document.getElementById('createBrew').value,
      price: parseFloat(document.getElementById('createPrice').value),
      alcohol: parseFloat(document.getElementById('createAlcohol').value) || 0,
      volume: parseInt(document.getElementById('createVolume').value) || 500,
      category: document.getElementById('createCategory').value,
      image: document.getElementById('createImage').value,
      description: document.getElementById('createDescription').value,
    };

    try {
      await this.api.createProduct(productData);
      this.ui.showNotification('Товар успішно додан!', 'success');
      this.ui.clearProductForm(false);
      this.showPage('products');
      await this.loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      this.ui.showNotification('Помилка при додаванні товару', 'error');
    }
  }

  handleEditProductClick(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.ui.loadProductForm(product);
      this.showPage('edit');
    }
  }

  async handleEditProduct(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('editId').value);
    const productData = {
      name: document.getElementById('editName').value,
      brewery: document.getElementById('editBrew').value,
      price: parseFloat(document.getElementById('editPrice').value),
      alcohol: parseFloat(document.getElementById('editAlcohol').value) || 0,
      volume: parseInt(document.getElementById('editVolume').value) || 500,
      category: document.getElementById('editCategory').value,
      image: document.getElementById('editImage').value,
      description: document.getElementById('editDescription').value,
    };

    try {
      await this.api.updateProduct(productId, productData);
      this.ui.showNotification('Товар успішно оновлен!', 'success');
      this.ui.clearProductForm(true);
      this.showPage('products');
      await this.loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      this.ui.showNotification('Помилка при оновленні товару', 'error');
    }
  }

  handleDeleteProductClick(productId) {
    this.ui.showModal(
      'Видалення товару',
      'Ви впевнені, що хочете видалити цей товар? Дія необоротна.',
      () => this.confirmDeleteProduct(productId)
    );
  }

  async confirmDeleteProduct(productId) {
    try {
      await this.api.deleteProduct(productId);
      this.ui.closeModal();
      this.ui.showNotification('Товар успішно видален!', 'success');
      await this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      this.ui.showNotification('Помилка при видаленні товару', 'error');
    }
  }

  async handleAddToCart(productId) {
    try {
      await this.api.addToCart(productId, 1);
      this.ui.showNotification('Товар додан в корзину!', 'success');
      await this.loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.ui.showNotification('Помилка при додаванні в корзину', 'error');
    }
  }

  async handleRemoveFromCart(cartItemId) {
    try {
      await this.api.removeFromCart(cartItemId);
      this.ui.showNotification('Товар видален з корзини', 'success');
      await this.loadCart();
      this.ui.renderCart(this.cart.items);
    } catch (error) {
      console.error('Error removing from cart:', error);
      this.ui.showNotification('Помилка при видаленні з корзини', 'error');
    }
  }

  async handleUpdateCartQuantity(cartItemId, quantity) {
    const qty = parseInt(quantity);
    if (qty <= 0) {
      this.ui.showNotification('Кількість повинна бути більше 0', 'error');
      return;
    }

    try {
      await this.api.updateCartItem(cartItemId, qty);
      await this.loadCart();
      this.ui.renderCart(this.cart.items);
    } catch (error) {
      console.error('Error updating cart:', error);
      this.ui.showNotification('Помилка при оновленні кількості', 'error');
    }
  }

  async handleClearCart() {
    this.ui.showModal(
      'Очистити корзину',
      'Ви впевнені? Усі товари будуть видалені з корзини.',
      async () => {
        try {
          await this.api.clearCart();
          this.ui.closeModal();
          this.ui.showNotification('Корзина очищена', 'success');
          await this.loadCart();
          this.ui.renderCart(this.cart.items);
        } catch (error) {
          console.error('Error clearing cart:', error);
          this.ui.showNotification('Помилка при очищенні корзини', 'error');
        }
      }
    );
  }
}

// ===== Modal Functions =====
function confirmAction() {
  if (app.ui.currentConfirmAction) {
    app.ui.currentConfirmAction();
  }
}

function closeModal() {
  app.ui.closeModal();
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
