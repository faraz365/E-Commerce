@@ .. @@
 // MongoDB connection
-const DB_URL = 'mongodb+srv://farazabdullah267:SjgRgW3SlAAa05Rl@project.ifut3ay.mongodb.net/';
+const DB_URL = process.env.MONGODB_URI || 'mongodb+srv://farazabdullah267:SjgRgW3SlAAa05Rl@project.ifut3ay.mongodb.net/';
 let db;

 // Connect to MongoDB
@@ .. @@
 // Middleware
 app.use(cors());
 app.use(express.json());
+
+// Add error handling middleware
+app.use((err, req, res, next) => {
+  console.error('Server error:', err);
+  res.status(500).json({ message: 'Internal server error' });
+});