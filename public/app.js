import { APIService } from './apiservice.js';
import { Product } from './product.js';
import { CartItem, Cart } from './cart.js';
import { UIManager } from './ui.js';
import './modal.js';

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

    const imageFile = document.getElementById('createImageFile').files[0] || null;
    const productData = {
      name: document.getElementById('createName').value,
      brewery: document.getElementById('createBrew').value,
      price: parseFloat(document.getElementById('createPrice').value),
      alcohol: parseFloat(document.getElementById('createAlcohol').value) || 0,
      volume: parseInt(document.getElementById('createVolume').value) || 500,
      category: document.getElementById('createCategory').value,
      imageFile,
      description: document.getElementById('createDescription').value,
    };

    try {
      await this.api.createProduct(productData);
      this.ui.showNotification('Товар успішно додано!', 'success');
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
    const imageFile = document.getElementById('editImageFile').files[0] || null;
    const existingImage = document.getElementById('editImageExisting').value;

    const productData = {
      name: document.getElementById('editName').value,
      brewery: document.getElementById('editBrew').value,
      price: parseFloat(document.getElementById('editPrice').value),
      alcohol: parseFloat(document.getElementById('editAlcohol').value) || 0,
      volume: parseInt(document.getElementById('editVolume').value) || 500,
      category: document.getElementById('editCategory').value,
      image: existingImage,
      imageFile,
      description: document.getElementById('editDescription').value,
    };

    try {
      await this.api.updateProduct(productId, productData);
      this.ui.showNotification('Товар успішно оновлено!', 'success');
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

export { App };
