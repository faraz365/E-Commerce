# E-Commerce Website

A full-stack e-commerce application built with React, Node.js, Express, MongoDB, and Socket.IO.

## Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 👤 User authentication (login/signup)
- 👨‍💼 Admin dashboard for managing products and categories
- 📊 Real-time updates with Socket.IO
- 📱 Responsive design
- 💳 Checkout process
- 📈 Order management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```

4. **Start the application**

   **Option 1: Start both frontend and backend together**
   ```bash
   npm run start
   ```

   **Option 2: Start them separately**
   
   Terminal 1 (Backend):
   ```bash
   npm run server
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Demo Accounts

### Admin Account
- Email: `admin@admin.com`
- Password: `admin123`

### User Account
- Email: `user@user.com`
- Password: `user123`

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts (Auth, Cart)
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   └── utils/             # Utility functions
├── server/                # Backend Express server
│   └── index.js          # Main server file
└── public/               # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

### Users
- `GET /api/users` - Get all users (Admin)

## Technologies Used

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (Icons)
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB with MongoDB Driver
- Socket.IO
- CORS

## Troubleshooting

### Common Issues

1. **Socket.IO Connection Errors**
   - Make sure the backend server is running on port 5000
   - Check that CORS is properly configured
   - Verify the Socket.IO URL in the frontend matches the backend

2. **Database Connection Issues**
   - Verify your MongoDB connection string
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure the database name is correct

3. **API Errors**
   - Check if the backend server is running
   - Verify API endpoints are correct
   - Check browser console for detailed error messages

### Development Tips

- Use browser developer tools to monitor network requests
- Check the console for Socket.IO connection status
- Monitor the backend logs for API requests and errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.