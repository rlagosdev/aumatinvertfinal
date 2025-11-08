import React, { useState, useEffect } from 'react';
    import { useNavigate, Navigate } from 'react-router-dom';
    import { useAuth } from '../context/AuthContext';
    import { supabase } from '../supabase/client';
    import { toast } from 'react-toastify';
    import { LogOut, BarChart3, Package, Calendar, Users, UserCog, Tag, Palette, Ticket, Menu, X, Layout, Share2, Sparkles, Mail, Send, Bot, ShoppingBag, Bell, Cloud, Video, ContactRound, Megaphone } from 'lucide-react';
    import { useSiteLogo } from '../hooks/useSiteLogo';
    import AdminOverview from '../components/admin/AdminOverview';
    import AdminProducts from '../components/admin/AdminProducts';
    import AdminOrders from '../components/admin/AdminOrders';
    import AdminCalendar from '../components/admin/AdminCalendar';
    import AdminUsers from '../components/admin/AdminUsers';
    import AdminCategories from '../components/admin/AdminCategories';
    import SiteCustomization from '../components/admin/SiteCustomization';
    import SiteAppearance from '../components/admin/SiteAppearance';
    import PromoCodesManager from '../components/admin/PromoCodesManager';
    import MarketingSuite from '../components/admin/MarketingSuite';
    import EmailManager from '../components/admin/EmailManager';
    import SocialMediaPublisher from '../components/admin/SocialMediaPublisher';
    import PrintifyShopManager from '../components/admin/PrintifyShopManager';
    import NotificationManager from '../components/admin/NotificationManager';
    import APIIntegrations from '../components/admin/APIIntegrations';
    import VideoCallManager from '../components/admin/VideoCallManager';
    import AdminCRM from '../components/admin/AdminCRM';
    import AnnonceManager from '../components/admin/AnnonceManager';

    const AdminDashboard: React.FC = () => {
      const { user, signOut } = useAuth();
      const navigate = useNavigate();
      const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
      const [activeTab, setActiveTab] = useState('overview');
      const [sidebarExpanded, setSidebarExpanded] = useState(false);
      const { logoSettings, loading: logoLoading } = useSiteLogo();

      useEffect(() => {
        const checkAdmin = async () => {
          if (!user) {
            setIsAdmin(false);
            return;
          }

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error || profile?.role !== 'admin') {
            setIsAdmin(false);
          } else {
            setIsAdmin(true);
          }
        };

        checkAdmin();
      }, [user]);

      const handleSignOut = async () => {
        await signOut();
        toast.success('Déconnexion réussie');
        navigate('/admin/login');
      };

      if (isAdmin === null) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary mx-auto"></div>
              <p className="mt-4 text-zinc-600">Vérification des droits...</p>
            </div>
          </div>
        );
      }

      if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
      }

      const tabs = [
        { id: 'overview', name: 'Vue d\'ensemble', icon: BarChart3 },
        { id: 'orders', name: 'Commandes', icon: Users },
        { id: 'crm', name: 'CRM - Contacts', icon: ContactRound },
        { id: 'products', name: 'Produits', icon: Package },
        { id: 'categories', name: 'Catégories', icon: Tag },
        { id: 'shop', name: 'Boutique', icon: ShoppingBag },
        { id: 'promocodes', name: 'Codes Promo', icon: Ticket },
        { id: 'marketing', name: 'Suite Marketing', icon: Sparkles },
        { id: 'videocall', name: 'Visio & Rendez-vous', icon: Video },
        { id: 'notifications', name: 'Notifications Push', icon: Bell },
        { id: 'annonces', name: 'Annonces Popup', icon: Megaphone },
        { id: 'publisher', name: 'Publication Réseaux Sociaux', icon: Send },
        { id: 'email', name: 'Messagerie', icon: Mail },
        { id: 'apis', name: 'APIs & Intégrations', icon: Cloud },
        { id: 'appearance', name: 'Apparence', icon: Layout },
        { id: 'users', name: 'Utilisateurs', icon: UserCog },
        { id: 'calendar', name: 'Calendrier', icon: Calendar },
        { id: 'customization', name: 'Personnalisation', icon: Palette },
      ];

      return (
        <div className="min-h-screen bg-gray-50 flex">
          {/* Mobile Overlay */}
          {sidebarExpanded && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarExpanded(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed left-0 top-0 h-full bg-white border-r border-zinc-200 shadow-lg transition-all duration-300 ease-in-out z-50 ${
              sidebarExpanded ? 'w-64' : 'w-20 -translate-x-full md:translate-x-0'
            }`}
            onMouseEnter={() => window.innerWidth >= 768 && setSidebarExpanded(true)}
            onMouseLeave={() => window.innerWidth >= 768 && setSidebarExpanded(false)}
          >
            {/* Logo / Header */}
            <div className="h-16 flex items-center px-4 border-b border-zinc-200">
              {logoSettings.logo_image ? (
                <div className={`w-10 h-10 overflow-hidden flex items-center justify-center flex-shrink-0 ${
                  logoSettings.logo_shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                }`}>
                  <img
                    src={logoSettings.logo_image}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLDivElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-site-primary to-cyan-500 rounded-full hidden items-center justify-center">
                    <span className="text-white font-bold text-sm">AM</span>
                  </div>
                </div>
              ) : logoLoading ? (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                  <span className="text-gray-400 text-xs">...</span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-site-primary to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">AM</span>
                </div>
              )}
              <div
                className={`ml-3 overflow-hidden transition-all duration-300 ${
                  sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}
              >
                <h1 className="text-sm font-bold text-zinc-800 whitespace-nowrap">Administration</h1>
                <p className="text-xs text-zinc-600 whitespace-nowrap">Au Matin Vert</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="py-4 overflow-y-auto h-[calc(100vh-8rem)]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-site-primary/10 to-transparent border-l-4 border-site-primary text-site-primary'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${activeTab === tab.id ? 'text-site-primary' : ''}`} />
                    <span
                      className={`ml-3 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                        sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                      }`}
                    >
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-0 left-0 w-full border-t border-zinc-200 bg-white">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-4 text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`ml-3 font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  }`}
                >
                  Déconnexion
                </span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div
            className={`flex-1 transition-all duration-300 md:ml-20 overflow-x-hidden ${
              sidebarExpanded ? 'md:ml-64' : ''
            }`}
          >
            {/* Top Header Bar */}
            <header className="bg-white shadow-sm border-b border-zinc-200 h-16 flex items-center px-4 md:px-6">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-6 w-6 text-zinc-600" />
              </button>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-semibold text-zinc-800 truncate">
                  {tabs.find((tab) => tab.id === activeTab)?.name || 'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs md:text-sm text-zinc-600 truncate max-w-[150px] md:max-w-none">{user?.email}</span>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-4 md:p-6 w-full max-w-full">
              <div className={activeTab === 'customization' || activeTab === 'appearance' || activeTab === 'marketing' || activeTab === 'email' || activeTab === 'publisher' || activeTab === 'shop' || activeTab === 'notifications' || activeTab === 'annonces' || activeTab === 'apis' || activeTab === 'videocall' ? '' : 'bg-white rounded-lg shadow-sm p-3 md:p-6'}>
                {activeTab === 'overview' && <AdminOverview onNavigate={setActiveTab} />}
                {activeTab === 'orders' && <AdminOrders />}
                {activeTab === 'crm' && <AdminCRM />}
                {activeTab === 'products' && <AdminProducts />}
                {activeTab === 'categories' && <AdminCategories />}
                {activeTab === 'shop' && <PrintifyShopManager />}
                {activeTab === 'promocodes' && <PromoCodesManager />}
                {activeTab === 'marketing' && <MarketingSuite onNavigate={setActiveTab} />}
                {activeTab === 'videocall' && <VideoCallManager />}
                {activeTab === 'notifications' && <NotificationManager />}
                {activeTab === 'annonces' && <AnnonceManager />}
                {activeTab === 'publisher' && <SocialMediaPublisher />}
                {activeTab === 'email' && <EmailManager />}
                {activeTab === 'apis' && <APIIntegrations />}
                {activeTab === 'appearance' && <SiteAppearance />}
                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'calendar' && <AdminCalendar />}
                {activeTab === 'customization' && <SiteCustomization />}
              </div>
            </main>
          </div>
        </div>
      );
    };

    export default AdminDashboard;