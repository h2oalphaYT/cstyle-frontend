import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antTheme } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
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

// Admin imports
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/Dashboard';
import ProductsPage from './admin/pages/Products';
import OffersPage from './admin/pages/Offers';
import OrdersPage from './admin/pages/Orders';
import InventoryPage from './admin/pages/Inventory';
import CustomersPage from './admin/pages/Customers';
import AnalyticsPage from './admin/pages/Analytics';
import SettingsPage from './admin/pages/Settings';

function AppContent() {
  const { theme: currentTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#D4AF37',
          colorBgBase: currentTheme === 'dark' ? '#0D0D0D' : '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
        },
      }}
    >
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Home />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/shop" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Shop />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/product/:id" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <ProductDetail />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/cart" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Cart />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/checkout" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Checkout />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/about" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <About />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/contact" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Contact />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/auth" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Auth />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/wishlist" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Wishlist />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/order-success" element={
            <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <OrderSuccess />
              </main>
              <Footer />
            </div>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;