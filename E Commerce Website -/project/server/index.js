import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// MongoDB connection
const DB_URL = 'mongodb+srv://farazabdullah267:SjgRgW3SlAAa05Rl@project.ifut3ay.mongodb.net/';
let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(DB_URL);
    await client.connect();
    db = client.db('ecommerce'); // Database name
    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
// Routes

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce API Server is running!',
    status: 'success',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      cart: '/api/cart',
      analytics: '/api/analytics/dashboard'
    }
  });
});

// User Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
      name,
      email,
      password, // In production, hash the password
      role,
      created_at: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.collection('products').find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.collection('products').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    // Validate required fields
    const { name, description, price, image_url, stock, category_id } = req.body;
    
    if (!name || !description || !price || !image_url || stock === undefined || !category_id) {
      return res.status(400).json({ 
        message: 'All fields are required: name, description, price, image_url, stock, category_id' 
      });
    }

    // Validate data types
    if (isNaN(price) || isNaN(stock) || isNaN(category_id)) {
      return res.status(400).json({ 
        message: 'Price, stock, and category_id must be valid numbers' 
      });
    }

    const product = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image_url: image_url.trim(),
      stock: parseInt(stock),
      category_id: parseInt(category_id),
      created_at: new Date()
    };

    const result = await db.collection('products').insertOne(product);
    
    // Get the created product with its ID
    const createdProduct = await db.collection('products').findOne({ _id: result.insertedId });
    
    // Emit real-time update to all connected clients
    io.emit('productAdded', createdProduct);
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      productId: result.insertedId,
      product: createdProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, description, price, image_url, stock, category_id } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !image_url || stock === undefined || !category_id) {
      return res.status(400).json({ 
        message: 'All fields are required: name, description, price, image_url, stock, category_id' 
      });
    }

    // Validate data types
    if (isNaN(price) || isNaN(stock) || isNaN(category_id)) {
      return res.status(400).json({ 
        message: 'Price, stock, and category_id must be valid numbers' 
      });
    }

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image_url: image_url.trim(),
      stock: parseInt(stock),
      category_id: parseInt(category_id),
      updated_at: new Date()
    };

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get the updated product
    const updatedProduct = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
    
    // Emit real-time update to all connected clients
    io.emit('productUpdated', updatedProduct);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(productId) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time update to all connected clients
    io.emit('productDeleted', { id: productId });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.collection('categories').find({}).toArray();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    // Validate required fields
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ 
        message: 'Name and description are required' 
      });
    }

    const category = {
      name: name.trim(),
      description: description.trim(),
      created_at: new Date()
    };

    const result = await db.collection('categories').insertOne(category);
    
    // Get the created category with its ID
    const createdCategory = await db.collection('categories').findOne({ _id: result.insertedId });
    
    // Emit real-time update to all connected clients
    io.emit('categoryAdded', createdCategory);
    
    res.status(201).json({ 
      message: 'Category created successfully', 
      categoryId: result.insertedId,
      category: createdCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update category route
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ 
        message: 'Name and description are required' 
      });
    }

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      updated_at: new Date()
    };

    const result = await db.collection('categories').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get the updated category
    const updatedCategory = await db.collection('categories').findOne({ _id: new ObjectId(req.params.id) });
    
    // Emit real-time update to all connected clients
    io.emit('categoryUpdated', updatedCategory);

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete category route
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if there are products using this category
    const productsUsingCategory = await db.collection('products').countDocuments({ 
      category_id: parseInt(categoryId) 
    });
    
    if (productsUsingCategory > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productsUsingCategory} products are using this category.` 
      });
    }
    
    const result = await db.collection('categories').deleteOne({ 
      _id: new ObjectId(categoryId) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Emit real-time update to all connected clients
    io.emit('categoryDeleted', { id: categoryId });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Order Routes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find({}).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await db.collection('orders').find({ 
      user_id: req.params.userId 
    }).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      ...req.body,
      created_at: new Date(),
      status: 'pending'
    };

    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ 
      message: 'Order created successfully', 
      orderId: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cart Routes
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const cart = await db.collection('carts').findOne({ 
      user_id: req.params.userId 
    });
    res.json(cart || { user_id: req.params.userId, items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    // Check if cart exists for user
    const existingCart = await db.collection('carts').findOne({ user_id });

    if (existingCart) {
      // Update existing cart
      const itemIndex = existingCart.items.findIndex(item => item.product_id === product_id);

      if (itemIndex > -1) {
        // Update quantity if item exists
        existingCart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        existingCart.items.push({ product_id, quantity });
      }

      await db.collection('carts').updateOne(
        { user_id },
        { $set: { items: existingCart.items, updated_at: new Date() } }
      );
    } else {
      // Create new cart
      await db.collection('carts').insertOne({
        user_id,
        items: [{ product_id, quantity }],
        created_at: new Date()
      });
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    await db.collection('carts').updateOne(
      { user_id: userId },
      { $pull: { items: { product_id: productId } } }
    );

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics Routes
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const totalProducts = await db.collection('products').countDocuments();
    const totalOrders = await db.collection('orders').countDocuments();
    const totalUsers = await db.collection('users').countDocuments();

    // Get recent orders
    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ created_at: -1 })
      .limit(5)
      .toArray();

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Route to get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray(); // hide passwords
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ✅ Route to get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.collection('transactions').find().toArray();
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});


// Start server
connectToMongoDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});