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
      document.getElementById('editImageExisting').value = product.image || '';
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

export { UIManager };