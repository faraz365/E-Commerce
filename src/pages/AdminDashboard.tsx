// API Base URL
const API_BASE_URL = 'http://localhost:5000';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !socket.connected) return;

    // Product events
    socket.on('productAdded', (newProduct: Product) => {
      setProducts(prev => [...prev, newProduct]);
      showMessage('New product added!', 'success');
    });

    socket.on('productUpdated', (updatedProduct: Product) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      showMessage('Product updated!', 'success');
    });

    socket.on('productDeleted', ({ id }: { id: string }) => {
      setProducts(prev => prev.filter(p => p.id !== parseInt(id)));
      showMessage('Product deleted successfully!', 'success');
    });

    // Category events
    socket.on('categoryAdded', (newCategory: Category) => {
      setCategories(prev => [...prev, newCategory]);
      showMessage('New category added!', 'success');
    });

    socket.on('categoryUpdated', (updatedCategory: Category) => {
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      showMessage('Category updated!', 'success');
    });

    socket.on('categoryDeleted', ({ id }: { id: string }) => {
      setCategories(prev => prev.filter(c => c.id !== parseInt(id)));
      showMessage('Category deleted successfully!', 'success');
    });

    // Cleanup listeners
    return () => {
      socket.off('productAdded');
      socket.off('productUpdated');
      socket.off('productDeleted');
      socket.off('categoryAdded');
      socket.off('categoryUpdated');
      socket.off('categoryDeleted');
    };
  }, [socket, socket?.connected]);

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products`),
        fetch(`${API_BASE_URL}/api/categories`)
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
          message.type === 'success' ? 'bg-green-500 text-white' :
          message.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Product Management System</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductManager 
            products={products} 
            categories={categories} 
            onRefresh={fetchData}
            showMessage={showMessage}
          />
          <CategoryManager 
            categories={categories} 
            onRefresh={fetchData}
            showMessage={showMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default App;