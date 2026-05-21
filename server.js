const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const SERVER_HOST = '0.0.0.0';
const PORT = process.env.PORT || 5300;
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
        name: 'All Day IPA',
        brewery: 'Founders Brewing Co.',
        category: 'IPA',
        price: 134.00,
        alcohol: 4.7,
        volume: 500,
        image: '/img/all-day-ipa.jpg',
        description: 'Satisfies your tastes while keeping your senses sharp. Brewed with a complex array of ingredients. Balanced for optimal aromatics and a clean finish.',
      },
      {
        name: 'Busch Light',
        brewery: 'Anheuser-Busch',
        category: 'Світле',
        price: 87.00,
        alcohol: 4.1,
        volume: 500,
        image: '/img/busch-light.jpg',
        description: 'Busch Light offers a light, balanced flavor, with fewer calories. It has a pleasant hop aroma and a smooth, slightly sweet finish.',
      },
      {
        name: 'Fat Tire Ale',
        brewery: 'New Belgium Brewing Company',
        category: 'Світле',
        price: 145.00,
        alcohol: 5.2,
        volume: 500,
        image: '/img/fat-tire-ale.jpg',
        description: 'Made with premium ingredients, Fat Tire is a bright and balanced beer that\'s certified carbon neutral. Since 1991, we\'ve been working to reduce our environmental impact, while investing a portion of every Fat Tire you buy in community-based climate action. From certified B-Corp New Belgium Brewing, this ale is easy-drinking and easy on the planet.',
      },
      {
        name: 'Goose IPA',
        brewery: 'Goose Island Beer Co.',
        category: 'IPA',
        price: 155.00,
        alcohol: 5.9,
        volume: 500,
        image: '/img/goose-ipa.jpg',
        description: 'Goose Island’s flagship IPA is a six-time medal winner at the Great American Beer Festival. We’ve taken the traditional English Style and created our own fuller flavored IPA with bright citrus aromas and a bold hop finish. With hoppy, bold, and smooth flavor, Goose IPA is the perfect beer for hopheads and discovery drinkers alike.',
      },
      {
        name: 'Guinness Draught',
        brewery: 'Guinness',
        category: 'Світле',
        price: 110.00,
        alcohol: 4.2,
        volume: 500,
        image: '/img/guinness.jpg',
        description: 'Swirling clouds tumble as the storm begins to calm. Settle. Breathe in the moment, then break through the smooth, light head to the bittersweet reward. Unmistakeably GUINNESS, from the first velvet sip to the last, lingering drop. And every deep-dark satisfying mouthful in between.',
      },
      {
        name: 'Hoegaarden Wit / Blanche',
        brewery: 'Brouwerij Hoegaarden',
        category: 'Пшеничне',
        price: 132.00,
        alcohol: 4.9,
        volume: 330,
        image: '/img/hoegaarden.jpg',
        description: '500 years of hard work went into making this beer that features the aroma of orange peel, coriander and herbs that the merry monks imported from sunny Curacao. Speaking of which: pouring Hoegaarden is just like letting the sun fall into your glass: light yellow and naturally murky. And the soft foam adds a cloudy finish. And then there’s the soft taste, light and slightly sweet and sour and with subtle citrus notes… ah, just go ahead and taste it instead of reading about it!',
      },
      {
        name: 'Lagunitas IPA',
        brewery: 'Lagunitas Brewing Company',
        category: 'IPA',
        price: 124.00,
        alcohol: 6.0,
        volume: 500,
        image: '/img/lagunitas-ipa.jpg',
        description: 'A well-rounded, Highly drinkable India Pale Ale. A bit of Caramel Malt barley provides the richness that mellows out the twang of the hops, including Cascade, Centennial, Chinook and a splash of honorary “C” hop, Simcoe.',
      },
      {
        name: 'Pilsner Urquell',
        brewery: 'Plzeňský Prazdroj',
        category: 'Лагер',
        price: 92.00,
        alcohol: 4.4,
        volume: 500,
        image: '/img/pilsner-urquel.jpg',
        description: 'In 1842, at our brewery in Plzeň, brewer Josef Groll introduced the world to the first golden ‘pilsner’ lager, and changed beer forever. His invention soon became the most popular style of beer on the planet. We’ve brewed Pilsner Urquell in the same brewery using the same recipe for over 175 years. Today, we still insist on using traditional methods, like triple decoction and parallel brewing in wooden lagering barrels. It takes longer but means we never compromise on our taste.',
      },
      {
        name: 'Porter',
        brewery: 'Founders Brewing Co.',
        category: 'Портер',
        price: 105.00,
        alcohol: 6.5,
        volume: 500,
        image: '/img/porter.jpg',
        description: 'Pouring silky black with a creamy tan head, Porter gives off mild aromas of roasted coffee and dark chocolate complemented by low bitterness and a medium body. The nose is sweet with strong chocolate and caramel malt presence creating a graham cracker sweetness that needs to be tasted to be believed.',
      },
      {
        name: 'Schwarzbier',
        brewery: 'Köstritzer Schwarzbierbrauerei',
        category: 'Темне',
        price: 126.00,
        alcohol: 4.8,
        volume: 565,
        image: '/img/schwarzbier.jpg',
        description: 'Since April 1991, the Köstritzer black beer brewery, a subsidiary of the Bitburger brewery, has emerged as of one of the most modern breweries in Thuringia. In September 1993, it was with great pride we (re-) introduced the "original Köstritzer black beer".',
      },
      {
        name: 'Traditional Lager',
        brewery: 'Yuengling Brewery',
        category: 'Лагер',
        price: 126.00,
        alcohol: 4.5,
        volume: 330,
        image: '/img/traditional-lager.jpg',
        description: 'Famous for its rich amber color and medium-bodied flavor with roasted caramel malt for a subtle sweetness and a combination of cluster and cascade hops, this true original delivers a well-balanced taste with very distinct character. Born from a historic recipe that was resurrected in 1987, Yuengling Traditional Lager is a true classic.',
      },
      {
        name: 'Two Hearted IPA',
        brewery: 'Bell’s Brewery',
        category: 'IPA',
        price: 168.00,
        alcohol: 7.0,
        volume: 565,
        image: '/img/two-hearted-ipa.jpg',
        description: 'Brewed with 100% Centennial hops from the Pacific Northwest and named after the Two Hearted River in Michigan’s Upper Peninsula, this IPA is bursting with hop aromas ranging from pine to grapefruit from massive hop additions in both the kettle and the fermenter. Perfectly balanced with a malt backbone and combined with the signature fruity aromas of Bell\'s house yeast, this beer is remarkably drinkable and well suited for adventures everywhere.',
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
app.listen(PORT, SERVER_HOST, () => {
  console.log(`Server is running on http://${SERVER_HOST}:${PORT}`);
});
