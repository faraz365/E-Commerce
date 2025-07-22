import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
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
    const product = {
      ...req.body,
      created_at: new Date()
    };

    const result = await db.collection('products').insertOne(product);
    res.status(201).json({ 
      message: 'Product created successfully', 
      productId: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
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
    const category = {
      ...req.body,
      created_at: new Date()
    };

    const result = await db.collection('categories').insertOne(category);
    res.status(201).json({ 
      message: 'Category created successfully', 
      categoryId: result.insertedId 
    });
  } catch (error) {
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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});