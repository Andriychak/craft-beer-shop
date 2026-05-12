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

export { Product };