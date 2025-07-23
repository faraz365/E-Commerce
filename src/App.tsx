@@ .. @@
 import React from 'react';
 import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
 import { AuthProvider, useAuth } from './contexts/AuthContext';
 import { CartProvider } from './contexts/CartContext';
+import ErrorBoundary from './components/ErrorBoundary';
 import Login from './components/Login';
@@ .. @@
 function App() {
   return (
-    <AuthProvider>
-      <CartProvider>
-        <AppContent />
-      </CartProvider>
-    </AuthProvider>
+    <ErrorBoundary>
+      <AuthProvider>
+        <CartProvider>
+          <AppContent />
+        </CartProvider>
+      </AuthProvider>
+    </ErrorBoundary>
   );
 }