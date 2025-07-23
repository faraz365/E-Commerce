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
@@ .. @@
       socket.off('categoryUpdated');
       socket.off('categoryDeleted');
     };
-  }, [socket]);
+  }, [socket, socket?.connected]);