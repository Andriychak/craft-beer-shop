const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = 5300;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new sqlite3.Database(path.join(__dirname, 'beer_shop.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      alcohol REAL,
      volume INTEGER,
      brewery TEXT,
      category TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating products table:', err);
    } else {
      ensureCategoryColumn(seedProducts);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating cart table:', err);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating orders table:', err);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating order_items table:', err);
  });
}

function ensureCategoryColumn(callback) {
  db.all("PRAGMA table_info('products')", (err, columns) => {
    if (err) {
      console.error('Error checking products table schema:', err);
      if (callback) callback();
      return;
    }
    const hasCategory = columns.some((column) => column.name === 'category');
    if (!hasCategory) {
      db.run('ALTER TABLE products ADD COLUMN category TEXT', (alterErr) => {
        if (alterErr) {
          console.error('Error adding category column:', alterErr);
        }
        if (callback) callback();
      });
    } else if (callback) {
      callback();
    }
  });
}

function seedProducts() {
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products count:', err);
      return;
    }
    if (row.count > 0) {
      return;
    }

    const seedData = [
      {
        name: 'Golden Summer Ale',
        brewery: 'Sunrise Brewery',
        category: 'Світле',
        price: 85.00,
        alcohol: 4.8,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1510626176961-4b9a33891411?auto=format&fit=crop&w=600&q=80',
        description: 'Світле освіжаюче пиво з легким фруктовим ароматом.',
      },
      {
        name: 'Midnight Stout',
        brewery: 'Black Barrel',
        category: 'Темне',
        price: 110.00,
        alcohol: 6.5,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1542103749-55c11c8b7764?auto=format&fit=crop&w=600&q=80',
        description: 'Насичений темний стаут з нотками кави та шоколаду.',
      },
      {
        name: 'Crystal Lager',
        brewery: 'Silver Hop',
        category: 'Лагер',
        price: 75.00,
        alcohol: 5.0,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        description: 'Чистий лагер з легким хмільним післясмаком.',
      },
      {
        name: 'Hazy IPA',
        brewery: 'Cloud Nine',
        category: 'IPA',
        price: 95.00,
        alcohol: 6.8,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1515548210574-1c0fd7f5ed3f?auto=format&fit=crop&w=600&q=80',
        description: 'Хмільний IPA з цитрусовими нотками і м’яким тілом.',
      },
      {
        name: 'Amber Ale',
        brewery: 'Copper Kettle',
        category: 'Світле',
        price: 89.00,
        alcohol: 5.4,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1532634896-26909d0d1b31?auto=format&fit=crop&w=600&q=80',
        description: 'Яскравий ель з карамельними відтінками та солодовим ароматом.',
      },
      {
        name: 'Porter Revival',
        brewery: 'Iron Works',
        category: 'Портер',
        price: 105.00,
        alcohol: 6.2,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&w=600&q=80',
        description: 'Теплий портер з нотками шоколаду та рекомендується до десертів.',
      },
      {
        name: 'Wheat Breeze',
        brewery: 'Golden Grain',
        category: 'Світле',
        price: 82.00,
        alcohol: 5.1,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
        description: 'Легке пшеничне пиво з фруктовими нотами та відчутною свіжістю.',
      },
      {
        name: 'Rye IPA',
        brewery: 'Hop House',
        category: 'IPA',
        price: 98.00,
        alcohol: 7.1,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1532634896-26909d0d1b31?auto=format&fit=crop&w=600&q=80',
        description: 'Соковитий IPA з пряними нотами та щільною піною.',
      },
      {
        name: 'Dark Velvet',
        brewery: 'Nightfall Brew',
        category: 'Темне',
        price: 115.00,
        alcohol: 7.2,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1510626176961-4b9a33891411?auto=format&fit=crop&w=600&q=80',
        description: 'Насичене темне пиво з карамельними та пряними нотами.',
      },
      {
        name: 'Citrus Session IPA',
        brewery: 'Summer Tap',
        category: 'IPA',
        price: 92.00,
        alcohol: 5.5,
        volume: 500,
        image: 'https://images.unsplash.com/photo-1542103749-55c11c8b7764?auto=format&fit=crop&w=600&q=80',
        description: 'Легкий IPA з помітною цитрусовою свіжістю.',
      },
    ];

    const insert = db.prepare(`
      INSERT INTO products (name, description, price, alcohol, volume, brewery, category, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    seedData.forEach((product) => {
      insert.run([product.name, product.description, product.price, product.alcohol, product.volume, product.brewery, product.category, product.image]);
    });

    insert.finalize((finalErr) => {
      if (finalErr) {
        console.error('Error seeding products:', finalErr);
      } else {
        console.log('Seeded initial beer products');
      }
    });
  });
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  const { search, sort, category } = req.query;
  let query = 'SELECT * FROM products';
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ? OR brewery LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (category && category !== 'all') {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Default sort by name
  const sortOption = sort || 'name';
  const validSorts = ['name', 'price', 'alcohol', 'created_at'];
  if (validSorts.includes(sortOption)) {
    query += ` ORDER BY ${sortOption}`;
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(rows);
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(row);
  });
});

// Create product
app.post('/api/products', upload.single('imageFile'), (req, res) => {
  const { name, description, price, alcohol, volume, brewery, category } = req.body;
  let image = req.body.image || '';

  if (req.file) {
    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString('base64');
    image = `data:${mimeType};base64,${base64Data}`;
  }

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.run(
    `INSERT INTO products (name, description, price, alcohol, volume, brewery, category, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, description, price, alcohol, volume, brewery, category, image],
    function(err) {
      if (err) {
        console.error('Error creating product:', err);
        return res.status(500).json({ error: 'Failed to create product' });
      }
      res.status(201).json({ id: this.lastID, message: 'Product created successfully' });
    }
  );
});

// Update product
app.put('/api/products/:id', upload.single('imageFile'), (req, res) => {
  console.log('PUT /api/products/:id called with:', req.params.id, req.body, req.file ? 'has file' : 'no file');
  const { id } = req.params;
  const { name, description, price, alcohol, volume, brewery, category, image } = req.body;
  let imageData = image;

  if (req.file) {
    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString('base64');
    imageData = `data:${mimeType};base64,${base64Data}`;
  }

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.get('SELECT image FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching current image:', err);
      return res.status(500).json({ error: 'Failed to fetch current product image' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!req.file && imageData === undefined) {
      imageData = row.image;
    }

    db.run(
      `UPDATE products SET name = ?, description = ?, price = ?, alcohol = ?, volume = ?, brewery = ?, category = ?, image = ?
       WHERE id = ?`,
      [name, description, price, alcohol, volume, brewery, category, imageData, id],
      function(err) {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).json({ error: 'Failed to update product' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully' });
      }
    );
  });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Cart Routes

// Get cart
app.get('/api/cart', (req, res) => {
  const query = `
    SELECT c.id as cart_id, p.id, p.name, p.price, p.alcohol, p.volume, p.brewery, p.image, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.id
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching cart:', err);
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }
    res.json(rows);
  });
});

// Add to cart
app.post('/api/cart', (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  // Check if item already in cart
  db.get('SELECT * FROM cart WHERE product_id = ?', [product_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add to cart' });
    }

    if (row) {
      // Update quantity
      db.run(
        'UPDATE cart SET quantity = quantity + ? WHERE product_id = ?',
        [quantity, product_id],
        function(err) {
          if (err) return res.status(500).json({ error: 'Failed to add to cart' });
          res.json({ message: 'Product quantity updated in cart' });
        }
      );
    } else {
      // Insert new item
      db.run(
        'INSERT INTO cart (product_id, quantity) VALUES (?, ?)',
        [product_id, quantity],
        function(err) {
          if (err) return res.status(500).json({ error: 'Failed to add to cart' });
          res.status(201).json({ message: 'Product added to cart' });
        }
      );
    }
  });
});

// Remove from cart
app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM cart WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error removing from cart:', err);
      return res.status(500).json({ error: 'Failed to remove from cart' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  db.run('DELETE FROM cart', function(err) {
    if (err) {
      console.error('Error clearing cart:', err);
      return res.status(500).json({ error: 'Failed to clear cart' });
    }
    res.json({ message: 'Cart cleared successfully' });
  });
});

// Place order
app.post('/api/orders', (req, res) => {
  const cartQuery = `
    SELECT c.product_id, p.price, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.id
  `;

  db.all(cartQuery, (err, cartItems) => {
    if (err) {
      console.error('Error fetching cart for order:', err);
      return res.status(500).json({ error: 'Failed to place order' });
    }

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run('INSERT INTO orders DEFAULT VALUES', function(err) {
        if (err) {
          console.error('Error creating order:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to place order' });
        }

        const orderId = this.lastID;
        const stmt = db.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        );

        cartItems.forEach((item) => {
          stmt.run(orderId, item.product_id, item.quantity, item.price);
        });

        stmt.finalize((stmtErr) => {
          if (stmtErr) {
            console.error('Error saving order items:', stmtErr);
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to place order' });
          }

          db.run('DELETE FROM cart', function(deleteErr) {
            if (deleteErr) {
              console.error('Error clearing cart after order:', deleteErr);
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to place order' });
            }

            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                console.error('Error committing order transaction:', commitErr);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to place order' });
              }

              res.json({ message: 'Order placed successfully', orderId });
            });
          });
        });
      });
    });
  });
});

// Update cart item quantity
app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity <= 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  db.run('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id], function(err) {
    if (err) {
      console.error('Error updating cart:', err);
      return res.status(500).json({ error: 'Failed to update cart' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Cart item updated successfully' });
  });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
