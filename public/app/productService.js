import { Product } from './product.js';

class ProductService {
  constructor(api, ui) {
    this.api = api;
    this.ui = ui;
    this.products = [];
    this.currentSort = 'name';
    this.currentSearch = '';
    this.currentCategory = 'all';
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
    // Kept for compatibility, but product service does not manage cart.
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
      this.ui.showNotification('Товар успішно доданий!', 'success');
      this.ui.clearProductForm(false);
      this.ui.showPage('products');
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
      this.ui.showPage('edit');
    }
  }

  async handleEditProduct(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('editId').value);
    const imageFile = document.getElementById('editImageFile').files[0] || null;

    const productData = {
      name: document.getElementById('editName').value,
      brewery: document.getElementById('editBrew').value,
      price: parseFloat(document.getElementById('editPrice').value),
      alcohol: parseFloat(document.getElementById('editAlcohol').value) || 0,
      volume: parseInt(document.getElementById('editVolume').value) || 500,
      category: document.getElementById('editCategory').value,
      imageFile,
      description: document.getElementById('editDescription').value,
    };

    try {
      await this.api.updateProduct(productId, productData);
      this.ui.showNotification('Товар успішно оновлено!', 'success');
      this.ui.clearProductForm(true);
      this.ui.showPage('products');
      await this.loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      this.ui.showNotification('Помилка при оновленні товару', 'error');
    }
  }

  handleDeleteProductClick(productId) {
    this.ui.showModal(
      'Видалення товару',
      'Ви впевнені, що хочете видалити цей товар? Дія незворотна.',
      () => this.confirmDeleteProduct(productId)
    );
  }

  async confirmDeleteProduct(productId) {
    try {
      await this.api.deleteProduct(productId);
      this.ui.closeModal();
      this.ui.showNotification('Товар успішно видалений!', 'success');
      await this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      this.ui.showNotification('Помилка при видаленні товару', 'error');
    }
  }
}

export { ProductService };