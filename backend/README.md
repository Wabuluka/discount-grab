# DG Shopping Cart - Backend API

A robust RESTful API for an e-commerce shopping cart application built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with Refresh Token Rotation
- **Validation:** Zod (TypeScript-first schema validation)
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS, bcrypt, Rate Limiting

## Features

### Security & Authentication
- JWT-based authentication with access and refresh tokens
- Secure refresh token rotation to prevent token reuse attacks
- Password hashing with bcrypt (configurable salt rounds)
- HTTP security headers via Helmet
- Rate limiting on authentication endpoints (5 requests per 15 minutes)
- API rate limiting (100 requests per minute)
- Role-based access control (User/Admin)

### API Features
- RESTful API design
- Comprehensive input validation with Zod schemas
- Centralized error handling with custom AppError class
- Structured logging with Winston
- HTTP request logging with Morgan
- Pagination and sorting support
- Full-text search on products
- Automatic cart creation per user
- Order number generation
- Stock management with automatic updates

### Order Processing
- Automatic shipping cost calculation (free over $100)
- Tax calculation (10% of subtotal)
- Order status tracking
- Payment status management
- Order cancellation with stock reversal

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Application entry point
│   ├── config/
│   │   └── config.ts          # Configuration management
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   └── order.controller.ts
│   ├── routes/                # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── cart.routes.ts
│   │   └── order.routes.ts
│   ├── service/               # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── models/                # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   └── RefreshToken.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validate.ts
│   │   └── rateLimiter.ts
│   ├── validators/            # Zod validation schemas
│   │   ├── auth.ts
│   │   └── product.ts
│   └── utils/                 # Utility functions
│       └── logger.ts
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
├── Dockerfile
└── postman_collection.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/electronic-store
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=1d
   COOKIE_DOMAIN=localhost
   NODE_ENV=development
   SALT_ROUNDS=10
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Jest |

## API Endpoints

### Authentication (5 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Products (5 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List all products (pagination, search, filter) | No |
| GET | `/api/products/:id` | Get single product | No |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Cart (5 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get user's cart | Yes |
| POST | `/api/cart/add` | Add item to cart | Yes |
| PUT | `/api/cart/item/:productId` | Update item quantity | Yes |
| DELETE | `/api/cart/item/:productId` | Remove item from cart | Yes |
| DELETE | `/api/cart/clear` | Clear entire cart | Yes |

### Orders (8 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order | Yes |
| GET | `/api/orders` | Get user's orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| GET | `/api/orders/number/:orderNumber` | Get order by number | Yes |
| POST | `/api/orders/:id/cancel` | Cancel order | Yes |
| GET | `/api/orders/admin/all` | Get all orders | Admin |
| PUT | `/api/orders/admin/:id/status` | Update order status | Admin |
| PUT | `/api/orders/admin/:id/payment` | Update payment status | Admin |

## Postman Collection

A complete Postman collection is included for testing the API.

### Features

- **Collection Variables:** Pre-configured variables for `baseUrl`, `accessToken`, `productId`, `orderId`, and `orderNumber`
- **Auto-saved Tokens:** Login and Register requests automatically save the access token
- **Bearer Auth:** Collection-level authentication using the saved token
- **Example Responses:** Sample responses for each endpoint

### How to Use

1. Import `postman_collection.json` into Postman
2. Set the `baseUrl` variable (default: `http://localhost:4000/api`)
3. Register or login to get an access token (auto-saved)
4. Use any authenticated endpoints

## Database Models

### User
- Email (unique, required)
- Password (hashed)
- Name (optional)
- Role (user/admin)

### Product
- Title (indexed for search)
- Description
- Price
- Images (array of URLs)
- Stock
- Category
- Specs (flexible object)

### Cart
- User reference (unique per user)
- Items (product, quantity, price)
- Total (auto-calculated)

### Order
- User reference
- Order number (auto-generated)
- Items (product details snapshot)
- Shipping address
- Payment method (card/cash_on_delivery)
- Payment status (pending/paid/failed/refunded)
- Order status (pending/confirmed/processing/shipped/delivered/cancelled)
- Cost breakdown (subtotal, shipping, tax, total)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Access token expiration | 1d |
| `COOKIE_DOMAIN` | Cookie domain | localhost |
| `NODE_ENV` | Environment (development/production) | development |
| `SALT_ROUNDS` | bcrypt salt rounds | 10 |

## Error Handling

The API uses a centralized error handling approach:

- Custom `AppError` class for operational errors
- Consistent error response format
- Different error details for development vs production
- All errors logged via Winston

## Health Check

A health check endpoint is available at:
```
GET /health
```

## Docker Support

A Dockerfile is included for containerized deployment:

```bash
docker build -t dg-shopping-cart-backend .
docker run -p 4000:4000 --env-file .env dg-shopping-cart-backend
```

## License

ISC
