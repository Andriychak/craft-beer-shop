const API_BASE_URL = '/api';
// ===== API Service Class =====
class APIService {
  constructor(baseURL = API_BASE_URL) {
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
    if (productData.imageFile) {
      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        if (key === 'imageFile') {
          formData.append('imageFile', productData.imageFile);
        } else {
          formData.append(key, productData[key]);
        }
      });
      return this.requestForm('/products', 'POST', formData);
    }
    return this.request('/products', 'POST', productData);
  }

  async updateProduct(id, productData) {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === 'imageFile' && productData.imageFile) {
        formData.append('imageFile', productData.imageFile);
      } else if (key !== 'imageFile' && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });
    return this.requestForm(`/products/${id}`, 'PUT', formData);
  }

  async requestForm(endpoint, method = 'POST', formData) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      body: formData,
    };

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

  async placeOrder() {
    return this.request('/orders', 'POST');
  }
}

export { APIService };