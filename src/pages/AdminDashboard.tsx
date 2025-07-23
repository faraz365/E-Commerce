@@ .. @@
 // API Base URL
-const API_BASE_URL = 'https://5a312d61-cda0-4de1-a8e9-97dbb3fc6107-00-35o6ocl1ielmf.sisko.replit.dev';
+const API_BASE_URL = 'http://localhost:5000';

 interface Product {
@@ .. @@
   // Socket event listeners for real-time updates
   useEffect(() => {
-    if (!socket) return;
+    if (!socket || !socket.connected) return;

     // Product events
     socket.on('productAdded', (newProduct: Product) => {
@@ .. @@
     });

     socket.on('productDeleted', ({ id }: { id: string }) => {
       setProducts(prev => prev.filter(p => p.id !== parseInt(id)));
-      showMessage('Product deleted!', 'success');
+      showMessage('Product deleted successfully!', 'success');
     });

     // Category events
@@ .. @@
     });

     socket.on('categoryDeleted', ({ id }: { id: string }) => {
       setCategories(prev => prev.filter(c => c.id !== parseInt(id)));
-      showMessage('Category deleted!', 'success');
+      showMessage('Category deleted successfully!', 'success');
     });

     // Cleanup listeners
@@ .. @@
       socket.off('categoryDeleted');
     };
-  }, [socket]);
+  }, [socket, socket?.connected]);