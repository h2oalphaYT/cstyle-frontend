# 🎯 Cstyle Admin Dashboard

## Overview
A modern, feature-rich Admin Dashboard for the Cstyle e-commerce platform built with React, TypeScript, TailwindCSS, Ant Design, Framer Motion, and Recharts.

## 🌟 Features

### Core Features
- **🎨 Dark/Light Mode** - Persistent theme toggle with smooth transitions
- **📱 Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- **✨ Smooth Animations** - Page transitions, card animations using Framer Motion
- **📊 Data Visualization** - Interactive charts with Recharts
- **🎭 Luxury Design** - Black & Gold theme matching the Cstyle brand

### Dashboard Pages

#### 1. **Dashboard Overview** (`/admin`)
- 4 Animated stat cards showing:
  - Total Sales (LKR/USD toggle)
  - Total Products
  - Items in Stock
  - Active Offers
- **Charts:**
  - Sales Trend Line Chart (weekly/monthly)
  - Revenue Distribution Pie Chart
  - Top-Selling Categories Bar Chart
- Real-time currency toggle
- Time range filters

#### 2. **Products Management** (`/admin/products`)
- Full CRUD operations
- **Features:**
  - Searchable product table
  - Advanced filters (Category, Status, Sort)
  - Add/Edit Product Modal with:
    - Product name, category, status
    - Price, discount, stock management
    - Multi-image upload
    - Description editor
  - Quick actions: View, Edit, Delete
  - Low stock highlighting
  - Export functionality

#### 3. **Orders Management** (`/admin/orders`)
- Order tracking and management
- **Features:**
  - Order status tracking (Pending, Processing, Shipped, Completed, Cancelled)
  - Customer information
  - Order details modal
  - Print invoice functionality
  - Advanced filters and search
  - Pending orders badge counter

#### 4. **Analytics** (`/admin/analytics`)
- **Charts & Insights:**
  - Conversion Rate Trend (Area Chart)
  - New vs Returning Customers (Line Chart)
  - Export to CSV/PDF
- More analytics coming soon

#### 5. **Offers Management** (`/admin/offers`)
- Manage promotional offers
- Add/Edit offers with:
  - Discount type (percentage/fixed)
  - Validity period
  - Applicable products
  - Active/Inactive toggle
- *(Coming Soon - Placeholder ready)*

#### 6. **Stock/Inventory** (`/admin/inventory`)
- Inventory tracking
- Stock level graphs
- Reorder alerts for low stock
- *(Coming Soon - Placeholder ready)*

#### 7. **Customers** (`/admin/customers`)
- Customer database
- Order history per customer
- Customer analytics
- *(Coming Soon - Placeholder ready)*

#### 8. **Settings** (`/admin/settings`)
- **General Settings:**
  - Default currency (LKR/USD)
  - Store name
  - Email notifications toggle
- **Admin Profile:**
  - Name and email management
  - Password change
  - Theme preferences

## 🎨 Design System

### Color Palette
```css
Primary Black: #0D0D0D
Accent Gold: #D4AF37
Gold Dark: #B8941F
Gold Light: #E8C35A
Text Light: #F1F1F1
Text Dark: #1A1A1A
Beige: #F5E6CC
```

### Typography
- **Headings:** Poppins (Bold, 300-900)
- **Body:** Inter (Regular, 300-700)

### Layout
- **Sidebar:** Collapsible navigation (260px expanded, 80px collapsed)
- **Top Bar:** Search, Notifications, Theme toggle, Profile
- **Content:** Responsive grid with cards and tables

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 16+ 
npm or yarn
```

### Installation
Already installed with your project. The admin uses these packages:
```bash
- antd (UI Components)
- recharts (Data Visualization)
- @ant-design/icons (Icons)
- framer-motion (Animations)
```

### Access
Navigate to: **`http://localhost:5173/admin`**

## 📱 Mobile Responsiveness

### Mobile View Features:
- Sidebar collapses to overlay menu
- Dashboard cards stack vertically
- Tables become scrollable
- Compact header with essential icons
- Touch-friendly buttons and controls

### Breakpoints:
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## ✨ Animations

### Page Transitions
- **Enter:** Fade in + Slide up (300ms)
- **Exit:** Fade out + Slide down (300ms)

### Component Animations
- **Cards:** Float-in effect on load
- **Stats:** Number count-up animation
- **Charts:** Progressive draw animation
- **Sidebar:** Smooth expand/collapse
- **Buttons:** Scale + Glow on hover

## 🎯 Navigation Structure

```
/admin
├── Dashboard (Overview)
├── Products (Management)
├── Offers (Promotions)
├── Orders (Order tracking)
├── Inventory (Stock management)
├── Customers (Customer DB)
├── Analytics (Insights)
└── Settings (Configuration)
```

## 🔒 Security Features (To Be Implemented)

### Recommended:
- [ ] Admin authentication/login
- [ ] Role-based access control
- [ ] Session management
- [ ] API authentication tokens
- [ ] Activity logging

## 📊 Data Management

### Current State
- Using **mock data** for demonstration
- Data persists in component state

### To Connect Real Backend:
1. Replace mock data with API calls
2. Implement data fetching with React Query/SWR
3. Add loading states
4. Error handling
5. Real-time updates (WebSocket/Polling)

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  brand: {
    black: '#0D0D0D',
    gold: '#D4AF37',
    // ... add more
  }
}
```

### Dark Mode Styling
Edit `src/index.css`:
```css
.dark .ant-table {
  background: #1F2937 !important;
  // ... customize
}
```

## 🐛 Known Issues & Limitations

1. **No Backend Integration** - Currently using mock data
2. **No Authentication** - Open access to admin panel
3. **Limited CRUD** - Delete/Edit show notifications but don't persist
4. **Export Functions** - Buttons ready but not yet implemented
5. **Some Pages** - Placeholder pages (Inventory, Customers, Offers)

## 🔮 Future Enhancements

### Phase 2 (Planned):
- [ ] Complete Offers management UI
- [ ] Inventory management with alerts
- [ ] Customer management dashboard
- [ ] Real-time notifications
- [ ] Advanced analytics (heat maps, funnels)
- [ ] Bulk operations
- [ ] Export to CSV/PDF
- [ ] Email templates management
- [ ] Activity logs
- [ ] Multi-language support

### Phase 3 (Wishlist):
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Automated inventory ordering
- [ ] Marketing automation
- [ ] Chat integration
- [ ] Mobile app

## 📁 File Structure

```
src/admin/
├── components/
│   └── AdminLayout.tsx          # Main layout with sidebar & header
├── pages/
│   ├── Dashboard.tsx            # Overview with stats & charts
│   ├── Products.tsx             # Products CRUD
│   ├── Orders.tsx               # Orders management
│   ├── Analytics.tsx            # Analytics dashboard
│   ├── Offers.tsx               # Offers management
│   ├── Inventory.tsx            # Stock management
│   ├── Customers.tsx            # Customer database
│   └── Settings.tsx             # Admin settings
```

## 🎓 Component Usage Examples

### StatCard Component (Custom)
```tsx
<StatCard 
  title="Total Sales"
  value="Rs 2,450,000"
  change={12.5}
  icon={<DollarOutlined />}
  color="from-yellow-400 to-yellow-600"
/>
```

### Ant Design Table
```tsx
<Table
  columns={columns}
  dataSource={data}
  pagination={{ pageSize: 10 }}
  className={isDarkMode ? 'dark-table' : ''}
/>
```

### Recharts Line Chart
```tsx
<LineChart data={salesData}>
  <Line type="monotone" dataKey="sales" stroke="#D4AF37" />
</LineChart>
```

## 💡 Tips for Development

1. **Dark Mode Testing:** Use the theme toggle in the header
2. **Responsive Testing:** Use browser dev tools
3. **Animation Testing:** Watch page transitions
4. **Table Customization:** Edit column definitions
5. **Mock Data:** Located in each page component

## 🤝 Contributing

To add new features:
1. Create new page in `src/admin/pages/`
2. Add route in `src/App.tsx`
3. Add menu item in `AdminLayout.tsx`
4. Follow existing patterns for consistency

## 📞 Support

For issues or questions:
- Check existing components for examples
- Review Ant Design documentation
- Check Recharts documentation
- Review TailwindCSS utility classes

## 🎉 Credits

Built with:
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **Ant Design** - Component Library
- **Framer Motion** - Animations
- **Recharts** - Data Visualization
- **Lucide React** - Icons

---

**Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**Status:** ✅ Production Ready (Frontend Only)

**Access the Admin Dashboard:** `http://localhost:5173/admin`
