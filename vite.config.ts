@@ .. @@
 export default defineConfig({
   plugins: [react()],
   server: {
-    port: 5173,
-    host: true
+    port: 3000,
+    host: true,
+    proxy: {
+      '/api': {
+        target: 'http://localhost:5000',
+        changeOrigin: true,
+        secure: false,
+      },
+      '/socket.io': {
+        target: 'http://localhost:5000',
+        changeOrigin: true,
+        ws: true,
+      }
+    }
   },
   optimizeDeps: {
     exclude: ['lucide-react'],
   },
 });