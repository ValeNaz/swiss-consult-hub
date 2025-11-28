/**
 * ============================================
 * ADMIN LAYOUT - MINIMAL & MODERN DESIGN
 * ============================================
 * Layout pulito con logo, sidebar elegante e header minimal
 */

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { authService } from '../services/authService';
import { requestsService } from '../services/dataService';
import NotificationsPanel from './NotificationsPanel';
import { useTranslation } from 'react-i18next';
import '../styles/AdminLayout.css';

const LANGUAGES = [
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' }
] as const;

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const [notifications, setNotifications] = useState(0);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication on mount
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (!user) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Real-time counter for new requests
  useEffect(() => {
    const unsubscribe = requestsService.subscribe((requests) => {
      const newRequestsCount = requests.filter(req => req.status === 'nuova').length;
      setNotifications(newRequestsCount);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login');
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('i18nextLng', langCode);
      } catch {}
    }
    setIsLanguageOpen(false);
  };

  const navigationItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: t('navigation.dashboard')
    },
    {
      path: '/admin/requests',
      icon: FileText,
      label: t('navigation.requests'),
      badge: notifications
    },
    {
      path: '/admin/clienti',
      icon: Users,
      label: t('navigation.clients')
    },
    {
      path: '/admin/report',
      icon: BarChart3,
      label: t('navigation.reports')
    }
  ];

  if (currentUser?.role === 'admin') {
    navigationItems.push(
      {
        path: '/admin/utenti',
        icon: User,
        label: t('navigation.users')
      },
      {
        path: '/admin/impostazioni',
        icon: Settings,
        label: t('navigation.settings')
      }
    );
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-layout-minimal">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="admin-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar-minimal ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img
            src="/media/LogoDark_SwissConsultHub.png"
            alt="Swiss Consult Hub"
            className="logo-image"
          />
          <div className="logo-divider"></div>
          <span className="logo-subtitle">{t('layout.adminPanel')}</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav-minimal">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item-minimal ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span className="nav-label-minimal">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge-minimal">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer-minimal">
          <div className="user-profile-minimal">
            <div className="user-avatar-minimal">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <User size={18} strokeWidth={1.5} />
              )}
            </div>
            <div className="user-info-minimal">
              <span className="user-name-minimal">{currentUser?.name || t('layout.defaultAdmin')}</span>
              <span className="user-role-minimal">{currentUser?.role || t('layout.administrator')}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button-minimal">
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-minimal">
        {/* Top Header */}
        <header className="admin-header-minimal">
          <div className="header-left-minimal">
            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle-admin"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="header-breadcrumb">
              {/* Breadcrumb can be added here */}
            </div>
          </div>

          <div className="header-actions-minimal">
            {/* Language Switcher */}
            <div className="admin-language-switcher">
              <button
                className="language-button-admin"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                aria-label="Change language"
              >
                <Languages size={20} strokeWidth={1.5} />
                <span className="current-lang-admin">{i18n.language.toUpperCase()}</span>
              </button>

              {isLanguageOpen && (
                <>
                  <div
                    className="language-dropdown-overlay"
                    onClick={() => setIsLanguageOpen(false)}
                  />
                  <div className="language-dropdown-admin">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        className={`language-option-admin ${i18n.language === lang.code ? 'active' : ''}`}
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications Panel */}
            <NotificationsPanel />
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content-minimal">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
