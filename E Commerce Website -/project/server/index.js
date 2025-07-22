
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002; 

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory data for demo (when MongoDB is not available)
let users = [
  { id: 1, name: 'Admin User', email: 'admin@admin.com', password: 'admin123', role: 'admin', created_at: new Date() },
  { id: 2, name: 'Amir Khan', email: 'user@user.com', password: 'user123', role: 'user', created_at: new Date() }
];

let categories = [
  { id: 1, name: 'Shirts', description: 'Stylish shirts for all occasions' },
  { id: 2, name: 'Pants', description: 'Comfortable and trendy pants' },
  { id: 3, name: 'Shoes', description: 'Quality footwear for every style' }
];

// Only 3 sample products
let products = [
  { id: 1, name: 'Classic White Shirt', description: 'Elegant white cotton shirt perfect for office and casual wear', price: 29.99, image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', stock: 50, category_id: 1 },
  { id: 2, name: 'Blue Denim Jeans', description: 'Comfortable blue denim jeans with modern fit', price: 49.99, image_url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', stock: 35, category_id: 2 },
  { id: 3, name: 'Black Leather Shoes', description: 'Premium black leather dress shoes for formal occasions', price: 89.99, image_url: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg', stock: 25, category_id: 3 }
];

let transactions = [
  { id: 1, user_id: 2, product_id: 1, quantity: 2, status: 'delivered', transaction_date: new Date('2024-01-15') },
  { id: 2, user_id: 2, product_id: 3, quantity: 1, status: 'shipped', transaction_date: new Date('2024-01-20') }
];

let orders = [
  { 
    id: 1, 
    user_id: 2, 
    user_name: 'John Doe',
    total_amount: 139.97,
    status: 'delivered',
    created_at: new Date('2024-01-15'),
    items: [
      { product_name: 'Classic White Shirt', quantity: 2, price: 29.99 },
      { product_name: 'Black Leather Shoes', quantity: 1, price: 89.99 }
    ]
  }
];

let contactMessages = [];

let nextUserId = 3;
let nextTransactionId = 3;
let nextProductId = 4;
let nextCategoryId = 4;
let nextOrderId = 2;
let nextContactId = 1;

// MongoDB Connection
let db = null;
let client = null;

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// MongoDB connection URL
const MONGODB_URI = 'mongodb+srv://farazabdullah267:SjgRgW3SlAAa05Rl@project.ifut3ay.mongodb.net/';

// Initialize MongoDB connection
async function initDB() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    db = client.db('ecommerce_db');
    
    console.log('Connected to MongoDB Atlas');
    await insertSampleData();
    console.log('Sample data inserted');
  } catch (error) {
    console.log('MongoDB not available, using in-memory data for demo');
    console.log('This is normal if you don\'t have MongoDB Atlas access');
    console.log('Error:', error.message);
    db = null;
  }
}

// Insert sample data
async function insertSampleData() {
  if (!db) return;

  try {
    // Insert sample users
    const usersCollection = db.collection('users');
    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers === 0) {
      await usersCollection.insertMany([
        { id: 1, name: 'Admin User', email: 'admin@admin.com', password: 'admin123', role: 'admin', created_at: new Date() },
        { id: 2, name: 'John Doe', email: 'user@user.com', password: 'user123', role: 'user', created_at: new Date() }
      ]);
    }

    // Insert sample categories
    const categoriesCollection = db.collection('categories');
    const existingCategories = await categoriesCollection.countDocuments();
    if (existingCategories === 0) {
      await categoriesCollection.insertMany([
        { id: 1, name: 'Shirts', description: 'Stylish shirts for all occasions' },
        { id: 2, name: 'Pants', description: 'Comfortable and trendy pants' },
        { id: 3, name: 'Shoes', description: 'Quality footwear for every style' }
      ]);
    }

    // Insert sample products
    const productsCollection = db.collection('products');
    const existingProducts = await productsCollection.countDocuments();
    if (existingProducts === 0) {
      await productsCollection.insertMany([
        { id: 1, name: 'Classic White Shirt', description: 'Elegant white cotton shirt perfect for office and casual wear', price: 29.99, image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', stock: 50, category_id: 1, created_at: new Date() },
        { id: 2, name: 'Blue Denim Jeans', description: 'Comfortable blue denim jeans with modern fit', price: 49.99, image_url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', stock: 35, category_id: 2, created_at: new Date() },
        { id: 3, name: 'Black Leather Shoes', description: 'Premium black leather dress shoes for formal occasions', price: 89.99, image_url: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg', stock: 25, category_id: 3, created_at: new Date() }
      ]);
    }

    // Insert sample transactions
    const transactionsCollection = db.collection('transactions');
    const existingTransactions = await transactionsCollection.countDocuments();
    if (existingTransactions === 0) {
      await transactionsCollection.insertMany([
        { id: 1, user_id: 2, product_id: 1, quantity: 2, status: 'delivered', transaction_date: new Date('2024-01-15') },
        { id: 2, user_id: 2, product_id: 3, quantity: 1, status: 'shipped', transaction_date: new Date('2024-01-20') }
      ]);
    }

    // Get next IDs from existing data
    const maxUser = await usersCollection.findOne({}, { sort: { id: -1 } });
    nextUserId = maxUser ? maxUser.id + 1 : 3;

    const maxProduct = await productsCollection.findOne({}, { sort: { id: -1 } });
    nextProductId = maxProduct ? maxProduct.id + 1 : 4;

    const maxCategory = await categoriesCollection.findOne({}, { sort: { id: -1 } });
    nextCategoryId = maxCategory ? maxCategory.id + 1 : 4;

    const maxTransaction = await transactionsCollection.findOne({}, { sort: { id: -1 } });
    nextTransactionId = maxTransaction ? maxTransaction.id + 1 : 3;

    const maxOrder = await db.collection('orders').findOne({}, { sort: { id: -1 } });
    nextOrderId = maxOrder ? maxOrder.id + 1 : 2;

    const maxContact = await db.collection('contactMessages').findOne({}, { sort: { id: -1 } });
    nextContactId = maxContact ? maxContact.id + 1 : 1;

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Helper function to get data from DB or memory
async function getFromDB(collection, query = {}, options = {}) {
  if (db) {
    try {
      const result = await db.collection(collection).find(query, options).toArray();
      return result;
    } catch (error) {
      console.error('Database query failed:', error);
      return null;
    }
  }
  return null;
}

// Helper function to get single document from DB
async function getOneFromDB(collection, query = {}) {
  if (db) {
    try {
      const result = await db.collection(collection).findOne(query);
      return result;
    } catch (error) {
      console.error('Database query failed:', error);
      return null;
    }
  }
  return null;
}

// Authentication Routes
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    // Check if user exists in DB
    const existingUser = await getOneFromDB('users', { email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    // Check in memory data as fallback
    const memoryUser = users.find(u => u.email === email);
    if (memoryUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    // Create new user
    if (db) {
      const newUser = {
        id: nextUserId++,
        name,
        email,
        password,
        role,
        created_at: new Date()
      };
      
      await db.collection('users').insertOne(newUser);
      return res.json({ user: newUser });
    } else {
      // Use memory
      const newUser = {
        id: nextUserId++,
        name,
        email,
        password,
        role,
        created_at: new Date()
      };
      users.push(newUser);
      return res.json({ user: newUser });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check in DB first
    const dbUser = await getOneFromDB('users', { email, password });
    
    if (dbUser) {
      return res.json({ user: dbUser });
    }

    // Check memory data
    const memoryUser = users.find(u => u.email === email && u.password === password);
    if (memoryUser) {
      return res.json({ user: memoryUser });
    }

    res.status(401).json({ message: 'Account not found. Please sign up first.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const dbProducts = await getFromDB('products');
    res.json(dbProducts || products);
  } catch (error) {
    res.json(products);
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dbProduct = await getOneFromDB('products', { id: parseInt(id) });
    if (dbProduct) {
      return res.json(dbProduct);
    }
    
    const product = products.find(p => p.id === parseInt(id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, image_url, stock, category_id } = req.body;
  
  try {
    if (db) {
      const newProduct = {
        id: nextProductId++,
        name,
        description,
        price: parseFloat(price),
        image_url,
        stock: parseInt(stock),
        category_id: parseInt(category_id),
        created_at: new Date()
      };
      
      await db.collection('products').insertOne(newProduct);
      res.json(newProduct);
    } else {
      const newProduct = {
        id: nextProductId++,
        name,
        description,
        price: parseFloat(price),
        image_url,
        stock: parseInt(stock),
        category_id: parseInt(category_id),
        created_at: new Date()
      };
      products.push(newProduct);
      res.json(newProduct);
    }
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, stock, category_id } = req.body;
  
  try {
    if (db) {
      const updateData = {
        name,
        description,
        price: parseFloat(price),
        image_url,
        stock: parseInt(stock),
        category_id: parseInt(category_id)
      };
      
      await db.collection('products').updateOne(
        { id: parseInt(id) },
        { $set: updateData }
      );
      
      const updatedProduct = await getOneFromDB('products', { id: parseInt(id) });
      res.json(updatedProduct);
    } else {
      const productIndex = products.findIndex(p => p.id === parseInt(id));
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          name,
          description,
          price: parseFloat(price),
          image_url,
          stock: parseInt(stock),
          category_id: parseInt(category_id)
        };
        res.json(products[productIndex]);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      await db.collection('products').deleteOne({ id: parseInt(id) });
      res.json({ message: 'Product deleted successfully' });
    } else {
      const productIndex = products.findIndex(p => p.id === parseInt(id));
      if (productIndex !== -1) {
        products.splice(productIndex, 1);
        res.json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    const dbCategories = await getFromDB('categories');
    res.json(dbCategories || categories);
  } catch (error) {
    res.json(categories);
  }
});

app.get('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    let category, productsByCategory;

    if (db) {
      category = await getOneFromDB('categories', { id: parseInt(id) });
      productsByCategory = await getFromDB('products', { category_id: parseInt(id) });
    } else {
      category = categories.find(c => c.id === parseInt(id)) || null;
      productsByCategory = products.filter(p => p.category_id === parseInt(id));
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category, products: productsByCategory });
  } catch (error) {
    console.error('Error fetching category and products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, description } = req.body;
  
  try {
    if (db) {
      const newCategory = {
        id: nextCategoryId++,
        name,
        description
      };
      
      await db.collection('categories').insertOne(newCategory);
      res.json(newCategory);
    } else {
      const newCategory = {
        id: nextCategoryId++,
        name,
        description
      };
      categories.push(newCategory);
      res.json(newCategory);
    }
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    if (db) {
      await db.collection('categories').updateOne(
        { id: parseInt(id) },
        { $set: { name, description } }
      );
      
      const updatedCategory = await getOneFromDB('categories', { id: parseInt(id) });
      res.json(updatedCategory);
    } else {
      const categoryIndex = categories.findIndex(c => c.id === parseInt(id));
      if (categoryIndex !== -1) {
        categories[categoryIndex] = {
          ...categories[categoryIndex],
          name,
          description
        };
        res.json(categories[categoryIndex]);
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    }
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      await db.collection('categories').deleteOne({ id: parseInt(id) });
      res.json({ message: 'Category deleted successfully' });
    } else {
      const categoryIndex = categories.findIndex(c => c.id === parseInt(id));
      if (categoryIndex !== -1) {
        categories.splice(categoryIndex, 1);
        res.json({ message: 'Category deleted successfully' });
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Routes (Admin only)
app.get('/api/users', async (req, res) => {
  try {
    const dbUsers = await getFromDB('users', {}, { projection: { password: 0 } });
    res.json(dbUsers || users.map(u => ({ ...u, password: undefined })));
  } catch (error) {
    res.json(users.map(u => ({ ...u, password: undefined })));
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  try {
    if (db) {
      await db.collection('users').updateOne(
        { id: parseInt(id) },
        { $set: { role } }
      );
      
      const updatedUser = await getOneFromDB('users', { id: parseInt(id) });
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } else {
      const userIndex = users.findIndex(u => u.id === parseInt(id));
      if (userIndex !== -1) {
        users[userIndex].role = role;
        const { password, ...userWithoutPassword } = users[userIndex];
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order Routes
app.get('/api/orders', async (req, res) => {
  const { user_id } = req.query;
  
  try {
    if (db) {
      let query = {};
      if (user_id) {
        query.user_id = parseInt(user_id);
      }
      
      const dbOrders = await getFromDB('orders', query, { sort: { created_at: -1 } });
      if (dbOrders) {
        // Add user names
        for (let order of dbOrders) {
          const user = await getOneFromDB('users', { id: order.user_id });
          order.user_name = user?.name || 'Unknown';
        }
        return res.json(dbOrders);
      }
    }
    
    // Use memory data
    let filteredOrders = orders;
    if (user_id) {
      filteredOrders = orders.filter(o => o.user_id === parseInt(user_id));
    }
    
    res.json(filteredOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { user_id, items, delivery_info, payment_method, total_amount, status = 'ordered' } = req.body;
  
  try {
    if (db) {
      const newOrder = {
        id: nextOrderId++,
        user_id: parseInt(user_id),
        total_amount: parseFloat(total_amount),
        status,
        delivery_info,
        payment_method,
        created_at: new Date(),
        items: items.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      await db.collection('orders').insertOne(newOrder);
      res.json({ id: newOrder.id, message: 'Order placed successfully' });
    } else {
      // Use memory
      const newOrder = {
        id: nextOrderId++,
        user_id: parseInt(user_id),
        total_amount: parseFloat(total_amount),
        status,
        delivery_info,
        payment_method,
        created_at: new Date(),
        items: items.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Get user name
      const user = users.find(u => u.id === parseInt(user_id));
      newOrder.user_name = user?.name || 'Unknown';
      
      orders.push(newOrder);
      res.json({ id: newOrder.id, message: 'Order placed successfully' });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    if (db) {
      await db.collection('orders').updateOne(
        { id: parseInt(id) },
        { $set: { status } }
      );
      
      const updatedOrder = await getOneFromDB('orders', { id: parseInt(id) });
      const user = await getOneFromDB('users', { id: updatedOrder.user_id });
      updatedOrder.user_name = user?.name || 'Unknown';
      res.json(updatedOrder);
    } else {
      const orderIndex = orders.findIndex(o => o.id === parseInt(id));
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        res.json(orders[orderIndex]);
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    }
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transaction Routes (Legacy - keeping for compatibility)
app.get('/api/transactions', async (req, res) => {
  const { user_id } = req.query;
  
  try {
    if (db) {
      let query = {};
      if (user_id) {
        query.user_id = parseInt(user_id);
      }
      
      const dbTransactions = await getFromDB('transactions', query, { sort: { transaction_date: -1 } });
      if (dbTransactions) {
        // Enrich with user and product data
        for (let transaction of dbTransactions) {
          const user = await getOneFromDB('users', { id: transaction.user_id });
          const product = await getOneFromDB('products', { id: transaction.product_id });
          transaction.user_name = user?.name || 'Unknown';
          transaction.product_name = product?.name || 'Unknown';
          transaction.price = product?.price || 0;
        }
        return res.json(dbTransactions);
      }
    }
    
    // Use memory data
    let filteredTransactions = transactions;
    if (user_id) {
      filteredTransactions = transactions.filter(t => t.user_id === parseInt(user_id));
    }
    
    const enrichedTransactions = filteredTransactions.map(t => {
      const user = users.find(u => u.id === t.user_id);
      const product = products.find(p => p.id === t.product_id);
      return {
        ...t,
        user_name: user?.name || 'Unknown',
        product_name: product?.name || 'Unknown',
        price: product?.price || 0
      };
    });
    
    res.json(enrichedTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  
  try {
    if (db) {
      const newTransaction = {
        id: nextTransactionId++,
        user_id: parseInt(user_id),
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        status: 'ordered',
        transaction_date: new Date()
      };
      
      await db.collection('transactions').insertOne(newTransaction);
      
      const user = await getOneFromDB('users', { id: newTransaction.user_id });
      const product = await getOneFromDB('products', { id: newTransaction.product_id });
      
      const enrichedTransaction = {
        ...newTransaction,
        user_name: user?.name || 'Unknown',
        product_name: product?.name || 'Unknown',
        price: product?.price || 0
      };
      
      res.json(enrichedTransaction);
    } else {
      const newTransaction = {
        id: nextTransactionId++,
        user_id: parseInt(user_id),
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        status: 'ordered',
        transaction_date: new Date()
      };
      transactions.push(newTransaction);
      
      const user = users.find(u => u.id === newTransaction.user_id);
      const product = products.find(p => p.id === newTransaction.product_id);
      
      const enrichedTransaction = {
        ...newTransaction,
        user_name: user?.name || 'Unknown',
        product_name: product?.name || 'Unknown',
        price: product?.price || 0
      };
      
      res.json(enrichedTransaction);
    }
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    if (db) {
      await db.collection('transactions').updateOne(
        { id: parseInt(id) },
        { $set: { status } }
      );
      
      const updatedTransaction = await getOneFromDB('transactions', { id: parseInt(id) });
      const user = await getOneFromDB('users', { id: updatedTransaction.user_id });
      const product = await getOneFromDB('products', { id: updatedTransaction.product_id });
      
      const enrichedTransaction = {
        ...updatedTransaction,
        user_name: user?.name || 'Unknown',
        product_name: product?.name || 'Unknown',
        price: product?.price || 0
      };
      
      res.json(enrichedTransaction);
    } else {
      const transactionIndex = transactions.findIndex(t => t.id === parseInt(id));
      if (transactionIndex !== -1) {
        transactions[transactionIndex].status = status;
        
        const user = users.find(u => u.id === transactions[transactionIndex].user_id);
        const product = products.find(p => p.id === transactions[transactionIndex].product_id);
        
        const enrichedTransaction = {
          ...transactions[transactionIndex],
          user_name: user?.name || 'Unknown',
          product_name: product?.name || 'Unknown',
          price: product?.price || 0
        };
        
        res.json(enrichedTransaction);
      } else {
        res.status(404).json({ message: 'Transaction not found' });
      }
    }
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact Routes
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  try {
    if (db) {
      const newMessage = {
        id: nextContactId++,
        name,
        email,
        subject,
        message,
        created_at: new Date()
      };
      
      await db.collection('contactMessages').insertOne(newMessage);
    } else {
      const newMessage = {
        id: nextContactId++,
        name,
        email,
        subject,
        message,
        created_at: new Date()
      };
      contactMessages.push(newMessage);
    }
    
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analytics Routes
app.get('/api/analytics', async (req, res) => {
  const { range = '6months' } = req.query;
  
  try {
    // Mock analytics data for demo
    const analyticsData = {
      monthlyRevenue: [
        { month: 'Jan', revenue: 4500, orders: 45 },
        { month: 'Feb', revenue: 5200, orders: 52 },
        { month: 'Mar', revenue: 4800, orders: 48 },
        { month: 'Apr', revenue: 6100, orders: 61 },
        { month: 'May', revenue: 7300, orders: 73 },
        { month: 'Jun', revenue: 8200, orders: 82 }
      ],
      topProducts: [
        { name: 'Classic White Shirt', sales: 156, revenue: 4680 },
        { name: 'Blue Denim Jeans', sales: 134, revenue: 6698 },
        { name: 'Black Leather Shoes', sales: 98, revenue: 8820 },
        { name: 'Summer Dress', sales: 87, revenue: 3480 },
        { name: 'Casual Sneakers', sales: 76, revenue: 4560 }
      ],
      ordersByStatus: [
        { status: 'Delivered', count: 245, color: '#10B981' },
        { status: 'Shipped', count: 67, color: '#3B82F6' },
        { status: 'Ordered', count: 34, color: '#F59E0B' },
        { status: 'Cancelled', count: 12, color: '#EF4444' }
      ],
      totalStats: {
        totalRevenue: 36100,
        totalOrders: 358,
        totalProducts: products.length,
        totalCustomers: users.length
      }
    };
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('📧 Demo accounts:');
    console.log('   Admin: admin@admin.com / admin123');
    console.log('   User: user@user.com / user123');
    if (db) {
      console.log('💾 Using MongoDB Atlas database');
    } else {
      console.log('💾 Using in-memory data (MongoDB not available)');
    }
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
  process.exit(0);
});
