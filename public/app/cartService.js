import { CartItem } from './cart.js';

class CartService {
  constructor(api, ui, cart) {
    this.api = api;
    this.ui = ui;
    this.cart = cart;
  }

  async loadCart() {
    try {
      const cartItems = await this.api.getCart();
      this.cart.clear();
      cartItems.forEach((item) => {
        this.cart.addItem(new CartItem(item));
      });
      this.ui.updateCartCount(this.cart.getItemCount());
      this.ui.renderCart(this.cart.items);
    } catch (error) {
      console.error('Error loading cart:', error);
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
        } catch (error) {
          console.error('Error clearing cart:', error);
          this.ui.showNotification('Помилка при очищенні корзини', 'error');
        }
      }
    );
  }
}

export { CartService };