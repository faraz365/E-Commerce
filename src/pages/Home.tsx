// API Base URL
const API_BASE_URL = 'http://localhost:5000';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Socket connection
const socket = io(API_BASE_URL);

// Custom hook for API calls
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error };
};

// Main App Component
const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { apiCall, loading, error } = useApi();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData, ordersData, usersData] = await Promise.all([
          apiCall('/api/products'),
          apiCall('/api/categories'),
          apiCall('/api/orders'),
          apiCall('/api/users')
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
        setOrders(ordersData);
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>E-commerce Dashboard</h1>
        {currentUser && <span>Welcome, {currentUser.name}</span>}
      </header>
      
      <main>
        <section className="products">
          <h2>Products ({products.length})</h2>
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
                <p>Stock: {product.stock}</p>
                <p>Category: {categories.find(c => c.id === product.category)?.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="orders">
          <h2>Orders ({orders.length})</h2>
          <div className="order-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <h3>Order #{order.id}</h3>
                <p>Total: ${order.total}</p>
                <p>Status: {order.status}</p>
                <p>Items: {order.items.length}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="categories">
          <h2>Categories ({categories.length})</h2>
          <div className="category-list">
            {categories.map(category => (
              <div key={category.id} className="category-card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}
    </div>
  );
};

export default App;