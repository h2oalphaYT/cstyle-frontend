import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BubbleCursor from './components/BubbleCursor';
import { Spinner } from './components/StateViews';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Wishlist from './pages/Wishlist';
import OrderSuccess from './pages/OrderSuccess';
import { AccountPage, AccountOrdersPage, AccountOrderDetailPage, TrackOrder } from './pages/Account';

// The admin panel (Ant Design, charts) is loaded only when an admin opens it.
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'));
const ProductsPage = lazy(() => import('./admin/pages/Products'));
const CategoriesPage = lazy(() => import('./admin/pages/Categories'));
const OffersPage = lazy(() => import('./admin/pages/Offers'));
const OrdersPage = lazy(() => import('./admin/pages/Orders'));
const InventoryPage = lazy(() => import('./admin/pages/Inventory'));
const CustomersPage = lazy(() => import('./admin/pages/Customers'));
const AnalyticsPage = lazy(() => import('./admin/pages/Analytics'));
const SettingsPage = lazy(() => import('./admin/pages/Settings'));
// Payroll & HR section, its own chunk.
const HrRoutes = lazy(() => import('./admin/hr/HrRoutes'));
// Full-screen factory TV board (no admin layout or Ant Design).
const ProductionBoard = lazy(() => import('./admin/hr/ProductionBoard'));

const StoreLayout = () => (
  <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

/** Admins and payroll/HR staff reach /admin; everyone else is sent to log in. */
const RequireBackOffice = ({ children }: { children: React.ReactElement }) => {
  const { ready, isAuthenticated, isBackOffice } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="min-h-screen bg-brand-black"><Spinner label="Checking access" /></div>;
  if (!isAuthenticated) return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (!isBackOffice) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-center px-4">
        <div className="space-y-4">
          <p className="text-white uppercase tracking-[0.2em]">Admins only</p>
          <p className="text-brand-muted text-sm">Your account does not have access to the admin panel.</p>
          <Link to="/" className="text-brand-champagne underline text-sm">Back to the store</Link>
        </div>
      </div>
    );
  }
  return children;
};

/** Store administration stays with admins; payroll/HR staff are sent to their section. */
const AdminOnly = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/admin/hr" replace />;
};

const NotFound = () => (
  <div className="min-h-[60vh] bg-brand-black flex items-center justify-center text-center px-4">
    <div className="space-y-4">
      <p className="text-brand-champagne uppercase tracking-[0.3em] text-xs">404</p>
      <h1 className="text-3xl font-light text-white uppercase tracking-[0.15em]">Page not found</h1>
      <Link to="/shop" className="inline-block mt-4 border border-brand-champagne/40 text-brand-champagne px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-brand-champagne hover:text-brand-black">Continue Shopping</Link>
    </div>
  </div>
);

function AppContent() {
  return (
    <>
      {/* Ant Design's provider lives in AdminLayout so the storefront never downloads antd. */}
      <Router>
          <BubbleCursor />
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-brand-black"><Spinner /></div>}>
            <Routes>
              {/* Customer Routes */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/orders" element={<AccountOrdersPage />} />
                <Route path="/account/orders/:id" element={<AccountOrderDetailPage />} />
                <Route path="/profile" element={<Navigate to="/account" replace />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="/factory-board" element={<RequireBackOffice><ProductionBoard /></RequireBackOffice>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<RequireBackOffice><AdminLayout /></RequireBackOffice>}>
                <Route path="hr/*" element={<HrRoutes />} />
                <Route element={<AdminOnly />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="offers" element={<OffersPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
