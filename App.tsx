import React, { useLayoutEffect, useState } from 'react';
    import '@radix-ui/themes/styles.css';
    import { Theme } from '@radix-ui/themes';
    import { ToastContainer } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';
    import './src/styles/custom-toast.css';
    import './src/styles/dynamic-colors.css';
    import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
    import { CartProvider } from './src/contexts/CartContext';
    import { AuthProvider } from './src/context/AuthContext';
    import { CursorToastProvider } from './src/contexts/CursorToastContext';
    import { useSiteColors } from './src/hooks/useSiteColors';
    import { useAutoNotifications } from './src/hooks/useAutoNotifications';
    import PWAInstallBanner from './src/components/PWAInstallBanner';
    import NotificationTestButton from './src/components/NotificationTestButton';
    // import ChatbotClient from './src/components/ChatbotClient';
    // import ChatbotAdmin from './src/components/ChatbotAdmin';

    import Home from './src/pages/Home';
    import Categories from './src/pages/Categories';
    import CategoryProducts from './src/pages/CategoryProducts';
    import Events from './src/pages/Events';
    import Services from './src/pages/Services';
    import About from './src/pages/About';
    import Shop from './src/pages/Shop';
    import Cart from './src/pages/Cart';
    import NotFound from './src/pages/NotFound';
    import AdminLogin from './src/pages/AdminLogin';
    import AdminDashboard from './src/pages/AdminDashboard';
    import FacebookCallback from './src/pages/FacebookCallback';
    import ResetNotifications from './src/pages/ResetNotifications';
    import PrivacyPolicy from './src/pages/PrivacyPolicy';
    import TermsOfService from './src/pages/TermsOfService';
    import LegalNotice from './src/pages/LegalNotice';
    import GmbOptimization from './src/pages/GmbOptimization';
    import PricingGuide from './src/pages/PricingGuide';

    // Composant pour gérer le scroll instantané sans animation
    const ScrollToTop: React.FC = () => {
      const { pathname } = useLocation();

      React.useEffect(() => {
        // Méthode la plus brutale : scroll synchrone
        window.scrollTo(0, 0);
      }, [pathname]);

      return null;
    };

    const App: React.FC = () => {
      // Charger et appliquer les couleurs du site
      useSiteColors();

      // Initialiser automatiquement les notifications push
      useAutoNotifications();

      return (
        <Theme appearance="inherit" radius="large" scaling="100%">
          <AuthProvider>
            <CartProvider>
              <CursorToastProvider>
                <Router>
                  <ScrollToTop />
                  <main className="min-h-screen font-inter">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/produits" element={<Categories />} />
                      <Route path="/produits/:categoryName" element={<CategoryProducts />} />
                      <Route path="/boutique" element={<Shop />} />
                      <Route path="/evenements" element={<Events />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/a-propos" element={<About />} />
                      <Route path="/panier" element={<Cart />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/legal-notice" element={<LegalNotice />} />
                      <Route path="/reset-notifications" element={<ResetNotifications />} />
                      <Route path="/gmb-ee283d4936ce203b5264331f749330b0" element={<GmbOptimization />} />
                      <Route path="/pricing-93b95bf17c59730a77adb96aa4ad58de" element={<PricingGuide />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/api/auth/facebook/callback" element={<FacebookCallback />} />
                      <Route path="/admin/*" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    limit={3}
                    style={{ zIndex: 9999 }}
                  />
                  {/* PWA Install Banner */}
                  <PWAInstallBanner />
                  {/* Notification Permission Banner */}
                  <NotificationTestButton />
                  {/* Chatbot Client - for all visitors */}
                  {/* <ChatbotClient /> */}
                  {/* Chatbot Admin - for administrators only */}
                  {/* <ChatbotAdmin /> */}
                </Router>
              </CursorToastProvider>
            </CartProvider>
          </AuthProvider>
        </Theme>
      );
    }

    export default App;