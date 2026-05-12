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

export { CartItem, Cart };