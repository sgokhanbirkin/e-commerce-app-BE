# 🛒 Kayra Export E-Commerce Backend API

Modern e-commerce backend API'si. Node.js, TypeScript, Express.js, Prisma ve SQLite kullanılarak geliştirilmiştir.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup database
npx prisma generate
npx prisma migrate deploy
pnpm seed

# Start development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

## 📋 API Endpoints

### 🔐 Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "createdAt": "2025-08-05T14:13:09.738Z"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Get User Profile
```http
GET /api/auth/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "createdAt": "2025-08-05T14:13:09.738Z",
  "addresses": [
    {
      "id": 1,
      "label": "Home",
      "line1": "123 Main St",
      "line2": "Apt 4B",
      "city": "New York",
      "postal": "10001",
      "country": "USA",
      "phone": "+1234567890"
    }
  ]
}
```

### 📦 Products

#### Get All Products
```http
GET /api/products
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "iPhone 15 Pro",
    "description": "Latest iPhone with advanced camera system",
    "price": 999.99,
    "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Electronics"
    },
    "variants": [
      {
        "id": 1,
        "sku": "IPHONE15PRO-128",
        "attribute": "capacity",
        "value": "128GB",
        "stock": 20,
        "priceDiff": 0
      },
      {
        "id": 2,
        "sku": "IPHONE15PRO-256",
        "attribute": "capacity",
        "value": "256GB",
        "stock": 20,
        "priceDiff": 100
      }
    ],
    "reviews": []
  }
]
```

#### Get Product by ID
```http
GET /api/products/{id}
```

#### Get Products by Category
```http
GET /api/products?categoryId={categoryId}
```

### 🛒 Shopping Cart (Protected)

#### Get Cart Items
```http
GET /api/cart
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "variantId": 1,
    "quantity": 2,
    "variant": {
      "id": 1,
      "sku": "IPHONE15PRO-128",
      "attribute": "capacity",
      "value": "128GB",
      "stock": 20,
      "priceDiff": 0,
      "product": {
        "id": 1,
        "title": "iPhone 15 Pro",
        "price": 999.99,
        "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
      }
    }
  }
]
```

#### Add Item to Cart
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "variantId": 1,
  "quantity": 2
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/{itemId}
Authorization: Bearer <token>
```

### 📋 Orders (Protected)

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "addressId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "status": "pending",
  "total": 1999.98,
  "createdAt": "2025-08-05T14:15:18.000Z",
  "items": [
    {
      "id": 1,
      "orderId": 1,
      "variantId": 1,
      "quantity": 2,
      "price": 999.99,
      "variant": {
        "id": 1,
        "sku": "IPHONE15PRO-128",
        "attribute": "capacity",
        "value": "128GB",
        "product": {
          "id": 1,
          "title": "iPhone 15 Pro",
          "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"
        }
      }
    }
  ],
  "address": {
    "id": 1,
    "label": "Home",
    "line1": "123 Main St",
    "city": "New York",
    "postal": "10001",
    "country": "USA"
  }
}
```

#### Get Order by ID
```http
GET /api/orders/{id}
Authorization: Bearer <token>
```

#### Get User Order History
```http
GET /api/orders/users/me/orders
Authorization: Bearer <token>
```

### ⭐ Reviews

#### Get Product Reviews
```http
GET /api/products/{productId}/reviews
```

**Response:**
```json
[
  {
    "id": 1,
    "productId": 1,
    "userId": 1,
    "rating": 5,
    "comment": "Excellent product!",
    "createdAt": "2025-08-05T14:15:18.000Z",
    "user": {
      "id": 1,
      "name": "John Doe"
    }
  }
]
```

#### Add Product Review (Protected)
```http
POST /api/products/{productId}/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent product!"
}
```

## 🔐 Authentication Flow

### 1. Register User
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    phone: '+1234567890'
  })
});

const user = await response.json();
```

### 2. Login User
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token, user } = await response.json();
// Store token in localStorage or secure storage
localStorage.setItem('token', token);
```

### 3. Use Token for Protected Requests
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/cart', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const basket = await response.json();
```

## 🎯 Frontend Integration Examples

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return { token, user, login, logout };
};
```

### Product List Component
```javascript
const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    };
    
    fetchProducts();
  }, []);

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <img src={product.imageUrl} alt={product.title} />
          <h3>{product.title}</h3>
          <p>${product.price}</p>
          <select>
            {product.variants.map(variant => (
              <option key={variant.id} value={variant.id}>
                {variant.value} (+${variant.priceDiff})
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};
```

### Shopping Cart Management
```javascript
const CartManager = () => {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);

  const addToCart = async (variantId, quantity) => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variantId, quantity })
    });
    
    // Refresh cart
    fetchCart();
  };

  const fetchCart = async () => {
    const response = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setCart(data);
  };

  return (
    <div>
      {cart.map(item => (
        <div key={item.id}>
          <img src={item.variant.product.imageUrl} />
          <h4>{item.variant.product.title}</h4>
          <p>{item.variant.value}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.variant.product.price + item.variant.priceDiff}</p>
        </div>
      ))}
    </div>
  );
};
```

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Products
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  imageUrl TEXT,
  categoryId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Product Variants
```sql
CREATE TABLE product_variants (
  id INTEGER PRIMARY KEY,
  productId INTEGER,
  sku TEXT UNIQUE NOT NULL,
  attribute TEXT NOT NULL,
  value TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  priceDiff DECIMAL(10,2) DEFAULT 0
);
```

### Cart Items
```sql
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY,
  userId INTEGER,
  variantId INTEGER,
  quantity INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Development

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
CORS_ORIGIN="*"
LOG_LEVEL="info"
NODE_ENV="development"
PORT=8080
```

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm test          # Run tests
pnpm lint          # Run ESLint
pnpm seed          # Seed database with sample data
```

### Docker
```bash
# Build image
docker build -t ecommerce-backend .

# Run container
docker run -p 8080:8080 ecommerce-backend

# Using Docker Compose
docker compose up -d
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **CORS Protection** - Configurable CORS settings
- **Rate Limiting** - API rate limiting (100 requests per 15 minutes)
- **Helmet** - Security headers
- **Input Validation** - Zod schema validation
- **Error Handling** - Centralized error handling

## 📈 API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## 🧪 Testing

### Run Tests
```bash
pnpm test
```

### Test Coverage
- Unit tests for services
- Integration tests for API endpoints
- Authentication tests
- Database operations tests

## 📚 API Documentation

Interactive API documentation available at:
```
http://localhost:8080/api-docs
```

## 🚀 Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Docker Deployment
```bash
docker build -t ecommerce-backend .
docker run -p 8080:8080 -e NODE_ENV=production ecommerce-backend
```

### Environment Variables for Production
```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="your-super-secure-jwt-secret"
CORS_ORIGIN="https://yourdomain.com"
LOG_LEVEL="error"
NODE_ENV="production"
```

## 📞 Support

For API support and questions:
- **Email:** support@kayraexport.com
- **Documentation:** http://localhost:8080/api-docs
- **GitHub Issues:** [Repository Issues](https://github.com/your-repo/issues)

---

**Built with ❤️ using Node.js, TypeScript, Express.js, Prisma, and SQLite**