import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { CurrencyProvider } from './context/CurrencyContext';
import { GoldRateProvider } from './context/GoldRateContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import About from './pages/About';
import { AuthProvider } from './context/AuthContext';
import EducationDiamond from './pages/EducationDiamond';
import EducationGold from './pages/EducationGold';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <GoldRateProvider>
          <HashRouter>
            <ScrollToTop/>
            <Routes>
              <Route element={<Layout />}>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<Product />} />
                <Route path="/about" element={<About />} />
                <Route path="/education/diamond" element={<EducationDiamond />} />
                <Route path="/education/gold" element={<EducationGold />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            
          </HashRouter>
        </GoldRateProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;