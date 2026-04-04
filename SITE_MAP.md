# 🚀 Cstyle E-Commerce - Complete Site Map

## 🛍️ Customer-Facing Site

### Public Pages
| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Hero, features, new arrivals, promo codes in header |
| **Shop** | `/shop` | Product listing with filters & search |
| **Product Detail** | `/product/:id` | Individual product page |
| **Cart** | `/cart` | Shopping cart |
| **Checkout** | `/checkout` | Order checkout |
| **Wishlist** | `/wishlist` | Saved products |
| **About** | `/about` | Company information |
| **Contact** | `/contact` | Contact form |
| **Auth** | `/auth` | Login/Register |
| **Order Success** | `/order-success` | Order confirmation |

### Key Features (Customer Site)
- ✅ Dark/Light mode toggle
- ✅ LKR/USD currency toggle
- ✅ Rotating promo codes in header (CSTYLE50, MEGA30, FREESHIP)
- ✅ Responsive design
- ✅ Product filtering & sorting
- ✅ Shopping cart management
- ✅ Wishlist functionality

---

## 👨‍💼 Admin Dashboard

### Access Point
**URL:** `http://localhost:5173/admin`

### Admin Pages
| Page | URL | Description | Status |
|------|-----|-------------|--------|
| **Dashboard** | `/admin` | Stats, charts, overview | ✅ Complete |
| **Products** | `/admin/products` | Product CRUD management | ✅ Complete |
| **Offers** | `/admin/offers` | Manage promotions | 🔄 Placeholder |
| **Orders** | `/admin/orders` | Order management | ✅ Complete |
| **Inventory** | `/admin/inventory` | Stock management | 🔄 Placeholder |
| **Customers** | `/admin/customers` | Customer database | 🔄 Placeholder |
| **Analytics** | `/admin/analytics` | Advanced insights | ✅ Partial |
| **Settings** | `/admin/settings` | Admin configuration | ✅ Complete |

### Admin Features
- ✅ Collapsible sidebar navigation
- ✅ Dark/Light mode (independent from customer site)
- ✅ Real-time search
- ✅ Notification center (5 pending notifications)
- ✅ Profile dropdown with settings
- ✅ Animated page transitions
- ✅ Interactive data charts
- ✅ Responsive mobile view
- ✅ Table filtering & sorting
- ✅ Modal forms for CRUD operations
- ✅ LKR/USD currency toggle in stats

---

## 🎨 Brand Colors

### Main Palette
```css
Primary Black: #0D0D0D
Accent Gold: #D4AF37
Secondary Beige: #F5E6CC
Text Light: #F1F1F1
Text Dark: #1A1A1A
```

### Gradient Variations
```css
Gold Dark: #B8941F
Gold Light: #E8C35A
Gold Gradient: linear-gradient(135deg, #D4AF37 0%, #E8C35A 100%)
```

---

## 🔑 Quick Start Commands

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Access Customer Site
http://localhost:5173/

# Access Admin Dashboard
http://localhost:5173/admin
```

---

## 📊 Admin Dashboard Screenshots Guide

### 1. Dashboard Overview
- 4 stat cards (Sales, Products, Stock, Offers)
- Sales trend line chart
- Revenue distribution pie chart
- Top-selling categories bar chart

### 2. Products Management
- Product table with images
- Filters: Search, Category, Status, Sort
- Add New Product button (opens modal)
- Actions: View, Edit, Delete

### 3. Orders Management
- Order table with status badges
- Filters: Search, Status, Date range
- View order details (modal)
- Print invoice functionality

### 4. Analytics Dashboard
- Conversion rate trend (area chart)
- New vs returning customers (line chart)
- Export report button

---

## 🎯 Promo Codes (Live in Header)

| Code | Discount | Description | Minimum |
|------|----------|-------------|---------|
| **CSTYLE50** | 50% OFF | First Order | Rs 16,250 |
| **MEGA30** | 30% OFF | Everything | Rs 10,000 |
| **FREESHIP** | Free Shipping | All Orders | No minimum |

**Location:** Top yellow bar (auto-rotates every 4 seconds)  
**Action:** Click copy icon to copy code

---

## 🔐 Admin Access (To Be Implemented)

Currently **no authentication** - admin dashboard is open access.

### Recommended Implementation:
1. Create admin login page at `/admin/login`
2. Implement JWT authentication
3. Protect admin routes with auth middleware
4. Add logout functionality
5. Session management

---

## 📱 Responsive Breakpoints

| Device | Width | Layout Changes |
|--------|-------|----------------|
| **Mobile** | < 640px | Stacked layout, hamburger menu |
| **Tablet** | 640px - 1024px | 2-column grid, collapsible sidebar |
| **Desktop** | > 1024px | Full layout, expanded sidebar |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations

### UI Libraries
- **Ant Design** - Admin dashboard components
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Routing
- **React Router v6** - Client-side routing

---

## 📁 Project Structure

```
src/
├── admin/                    # Admin dashboard
│   ├── components/
│   │   └── AdminLayout.tsx   # Sidebar + Header
│   └── pages/                # Admin pages
│       ├── Dashboard.tsx
│       ├── Products.tsx
│       ├── Orders.tsx
│       ├── Analytics.tsx
│       ├── Offers.tsx
│       ├── Inventory.tsx
│       ├── Customers.tsx
│       └── Settings.tsx
├── components/               # Customer site components
│   ├── Header.tsx            # With promo codes
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── pages/                    # Customer pages
│   ├── Home.tsx
│   ├── Shop.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Auth.tsx
│   ├── Wishlist.tsx
│   └── OrderSuccess.tsx
├── context/                  # Global state
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── ThemeContext.tsx
│   └── WishlistContext.tsx
├── data/
│   └── products.ts           # Product data
├── App.tsx                   # Main routing
└── index.css                 # Global styles
```

---

## 🎨 Theme Toggle Behavior

### Customer Site
- Toggle in main header (Sun/Moon icon)
- Persists in localStorage as `theme`
- Applies to all customer pages

### Admin Dashboard
- Independent toggle in admin header
- Persists in localStorage as `admin-theme`
- Only affects admin dashboard pages

**Note:** Customer and Admin themes are separate!

---

## 🚀 Deployment Checklist

### Before Production:
- [ ] Implement admin authentication
- [ ] Connect real backend API
- [ ] Add proper error handling
- [ ] Set up environment variables
- [ ] Configure CORS
- [ ] Add loading states
- [ ] Implement data persistence
- [ ] Add form validation
- [ ] Set up analytics tracking
- [ ] Optimize images
- [ ] Add SEO meta tags
- [ ] Test all features
- [ ] Mobile testing
- [ ] Browser compatibility testing
- [ ] Performance optimization
- [ ] Security audit

---

## 📊 Mock Data vs Real Data

### Currently Using Mock Data:
- Products list
- Orders
- Customer information
- Statistics & charts
- Analytics data

### To Integrate Real Backend:
1. Create API service layer
2. Replace mock data with API calls
3. Add error handling
4. Implement loading states
5. Add data caching (React Query/SWR)
6. Real-time updates (WebSocket)

---

## 💡 Development Tips

### Adding New Admin Page:
1. Create component in `src/admin/pages/YourPage.tsx`
2. Add route in `src/App.tsx`:
```tsx
<Route path="yourpage" element={<YourPage />} />
```
3. Add menu item in `src/admin/components/AdminLayout.tsx`:
```tsx
{ key: 'yourpage', icon: <Icon />, label: 'Your Page', path: '/admin/yourpage' }
```

### Styling Dark Mode:
```css
/* In index.css */
.dark .your-class {
  background: #1F2937 !important;
  color: #F1F1F1 !important;
}
```

---

## 🎉 Completed Features Summary

### ✅ Customer Site (100%)
- Home page with promo codes
- Shop with filters
- Product details
- Cart & Checkout
- Wishlist
- Theme toggle
- Currency toggle
- Responsive design

### ✅ Admin Dashboard (70%)
- Complete layout with sidebar
- Dashboard with charts
- Products management (full CRUD UI)
- Orders management
- Analytics dashboard
- Settings page
- Dark/Light mode
- Responsive design

### 🔄 Pending (30%)
- Offers management (placeholder ready)
- Inventory management (placeholder ready)
- Customers management (placeholder ready)
- Backend integration
- Authentication system

---

**For detailed admin documentation, see:** `ADMIN_DASHBOARD_README.md`  
**For theme updates, see:** `THEME_UPDATE.md`  
**For recent fixes, see:** `FIXES_APPLIED.md`

---

**Last Updated:** November 6, 2025  
**Version:** 1.0.0  
**Status:** ✅ Frontend Complete, Ready for Backend Integration
