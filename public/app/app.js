import { APIService } from './apiservice.js';
import { Cart } from './cart.js';
import { UIManager } from './ui.js';
import { ProductService } from './productService.js';
import { CartService } from './cartService.js';
import './modal.js';

class App {
  constructor() {
    this.api = new APIService();
    this.ui = new UIManager();
    this.cart = new Cart();
    this.productService = new ProductService(this.api, this.ui);
    this.cartService = new CartService(this.api, this.ui, this.cart);
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.productService.loadProducts();
    await this.cartService.loadCart();
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

  handleSearch() {
    return this.productService.handleSearch();
  }

  handleSort() {
    return this.productService.handleSort();
  }

  handleFilter() {
    return this.productService.handleFilter();
  }

  async handleCreateProduct(event) {
    return this.productService.handleCreateProduct(event);
  }

  handleEditProductClick(productId) {
    return this.productService.handleEditProductClick(productId);
  }

  async handleEditProduct(event) {
    return this.productService.handleEditProduct(event);
  }

  handleDeleteProductClick(productId) {
    return this.productService.handleDeleteProductClick(productId);
  }

  async confirmDeleteProduct(productId) {
    return this.productService.confirmDeleteProduct(productId);
  }

  async handleAddToCart(productId) {
    return this.cartService.handleAddToCart(productId);
  }

  async handleRemoveFromCart(cartItemId) {
    return this.cartService.handleRemoveFromCart(cartItemId);
  }

  async handleUpdateCartQuantity(cartItemId, quantity) {
    return this.cartService.handleUpdateCartQuantity(cartItemId, quantity);
  }

  async handleClearCart() {
    return this.cartService.handleClearCart();
  }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

export { App };
