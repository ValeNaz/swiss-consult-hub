import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CookieBanner from './components/CookieBanner';

// Public Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesListPage = lazy(() => import('./pages/ServicesListPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Legal Pages
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const DataSubjectRightsPage = lazy(() => import('./pages/DataSubjectRightsPage'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminRequestsList = lazy(() => import('./pages/AdminRequestsList'));
const AdminRequestDetail = lazy(() => import('./pages/AdminRequestDetail'));
const AdminClients = lazy(() => import('./pages/AdminClients'));
const AdminClientProfile = lazy(() => import('./pages/AdminClientProfile'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminUsersManagement = lazy(() => import('./pages/AdminUsersManagement'));


const App: React.FC = () => {
    return (
        <HashRouter>
            <Suspense fallback={
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    color: '#6b7886',
                    fontSize: '0.875rem'
                }}>
                    Caricamento...
                </div>
            }>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout><HomePage /></Layout>} />
                    <Route path="/chi-siamo" element={<Layout><AboutPage /></Layout>} />
                    <Route path="/servizi" element={<Layout><ServicesListPage /></Layout>} />
                    <Route path="/servizi/:slug" element={<Layout><ServiceDetailPage /></Layout>} />
                    <Route path="/contatti" element={<Layout><ContactPage /></Layout>} />

                    {/* Legal Pages */}
                    <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
                    <Route path="/terms-and-conditions" element={<Layout><TermsConditionsPage /></Layout>} />
                    <Route path="/cookie-policy" element={<Layout><CookiePolicyPage /></Layout>} />
                    <Route path="/data-subject-rights" element={<Layout><DataSubjectRightsPage /></Layout>} />

                    {/* Admin Login */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Admin Protected Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="requests" element={<AdminRequestsList />} />
                        <Route path="requests/:id" element={<AdminRequestDetail />} />
                        <Route path="clienti" element={<AdminClients />} />
                        <Route path="clients/:id" element={<AdminClientProfile />} />
                        <Route path="utenti" element={<AdminUsersManagement />} />
                        <Route path="report" element={<AdminReports />} />
                        <Route path="impostazioni" element={<AdminSettings />} />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>

            {/* Cookie Banner */}
            <CookieBanner />
        </HashRouter>
    );
};

export default App;
