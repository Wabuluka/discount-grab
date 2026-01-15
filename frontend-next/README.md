# DG Shopping Cart - Electronics Store

A full-stack e-commerce application for an electronics store with a Node.js/Express backend and Next.js frontend.

## Project Structure

```
dg-shoppingcart/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config.ts          # Environment configuration
│   │   ├── server.ts          # Express app entry point
│   │   ├── controllers/       # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   └── product.controller.ts
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # JWT authentication
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── Cart.ts
│   │   │   ├── Order.ts
│   │   │   ├── Product.ts
│   │   │   ├── RefreshToken.ts
│   │   │   └── User.ts
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   └── product.routes.ts
│   │   └── service/           # Business logic
│   │       ├── auth.service.ts
│   │       ├── cart.service.ts
│   │       ├── order.service.ts
│   │       └── token.service.ts
│   └── package.json
│
├── frontend-next/              # Next.js 16 frontend
│   ├── public/
│   │   └── logo.jpg
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── auth/
│   │   │   │   ├── page.tsx           # Login
│   │   │   │   └── register/
│   │   │   │       └── page.tsx       # Registration
│   │   │   ├── cart/
│   │   │   │   └── page.tsx           # Shopping cart
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx           # Checkout flow
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # User dashboard
│   │   │   │   ├── orders/
│   │   │   │   │   └── page.tsx       # Order history
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx       # Account settings
│   │   │   ├── order-confirmation/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Order confirmation
│   │   │   ├── product/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Product details
│   │   │   ├── shop/
│   │   │   │   └── page.tsx           # Product catalog
│   │   │   ├── globals.css            # Global styles
│   │   │   ├── layout.tsx             # Root layout
│   │   │   └── page.tsx               # Home page
│   │   ├── components/
│   │   │   ├── form/
│   │   │   │   ├── FormWrapper.tsx    # React Hook Form wrapper
│   │   │   │   └── Input.tsx          # Form input component
│   │   │   ├── home/
│   │   │   │   ├── About.tsx
│   │   │   │   ├── Collections.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   └── ProductCard.tsx
│   │   │   ├── Card.tsx               # Product card
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   ├── hooks/
│   │   │   ├── useGetProducts.ts      # Fetch all products
│   │   │   └── useSingleProduct.ts    # Fetch single product
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx      # React Query provider
│   │   ├── services/
│   │   │   ├── api.ts                 # Axios instance with interceptors
│   │   │   ├── authApi.ts             # Auth API calls
│   │   │   ├── cartApi.ts             # Cart API calls
│   │   │   ├── orderApi.ts            # Order API calls
│   │   │   └── productApi.ts          # Product API calls
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts       # Auth state
│   │   │   │   ├── cartSlice.ts       # Cart state
│   │   │   │   └── productsSlice.ts   # Products state
│   │   │   ├── store.ts               # Redux store config
│   │   │   └── StoreProvider.tsx      # Redux provider
│   │   ├── types/
│   │   │   └── product.ts             # TypeScript interfaces
│   │   └── utils/
│   │       └── formatCurrency.ts      # Currency formatting
│   ├── .env.local                     # Environment variables
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
└── frontend/                   # Legacy Vite frontend (deprecated)
```

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh token rotation
- **Security**: Rate limiting, password hashing with bcrypt

### Frontend
- **Framework**: Next.js 16 (App Router)
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form with Yup validation
- **Styling**: Tailwind CSS 4 with DaisyUI components
- **HTTP Client**: Axios with automatic token refresh

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

npm run dev
```

The backend will start on `http://localhost:4000`

### Frontend Setup

```bash
cd frontend-next
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/electronics_store
JWT_SECRET=your-secret-key
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
SALT_ROUNDS=10
COOKIE_SECURE=false
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/item/:productId` | Update item quantity |
| DELETE | `/api/cart/item/:productId` | Remove item from cart |
| DELETE | `/api/cart/clear` | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders/:id/cancel` | Cancel order |

## Features

- User authentication with JWT and refresh tokens
- Product catalog with search and filtering
- Shopping cart with real-time updates
- Checkout with shipping information
- Order history and tracking
- User dashboard with account settings
- Admin product management
- Rate limiting on auth endpoints
- Responsive design with mobile support

## Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```
