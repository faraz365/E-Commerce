@@ .. @@
 // API Base URL
-const API_BASE_URL = 'https://5a312d61-cda0-4de1-a8e9-97dbb3fc6107-00-35o6ocl1ielmf.sisko.replit.dev';
+const API_BASE_URL = 'http://localhost:5000';

 interface DeliveryInfo {
@@ .. @@
     try {
       const orderData = {
         user_id: user?.id,
@@ .. @@
         status: 'ordered'
       };

-      const response = await axios.post('https://5a312d61-cda0-4de1-a8e9-97dbb3fc6107-00-35o6ocl1ielmf.sisko.replit.dev/api/orders', orderData);
       const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
-      setOrderId(response.data.id);
+      setOrderId(response.data.orderId || response.data.id);
       setOrderPlaced(true);
       clearCart();
     } catch (error) {