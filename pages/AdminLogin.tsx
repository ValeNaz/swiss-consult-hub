import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import '../styles/AdminLogin.css';

const AdminLogin: React.FC = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        navigate(from, { replace: true });
      }
    };
    checkAuth();
  }, [navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setIsLoading(true);

    try {
      // TODO: Implementare reset password con backend
      setError(t('login.resetNotAvailable'));
    } catch (err: any) {
      setError(err.message || 'Errore invio email reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img
              src="/media/logo-dark.svg"
              alt="Swiss Consult Hub"
              className="login-logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="login-title">{t('login.title')}</h1>
            <p className="login-subtitle">{t('login.subtitle')}</p>
          </div>

          <form className="login-form" onSubmit={showResetPassword ? handleResetPassword : handleSubmit}>
            {error && (
              <div className="login-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {resetMessage && (
              <div className="login-success">
                <Info size={20} />
                <span>{resetMessage}</span>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email" className="form-label">
                {t('login.email')}
              </label>
              <div className="input-group">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className="form-input with-icon"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password" className="form-label">
                {t('login.password')}
              </label>
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="form-input with-icon with-toggle"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span>{t('login.rememberMe')}</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => {
                  setShowResetPassword(!showResetPassword);
                  setError('');
                  setResetMessage('');
                }}
              >
                {showResetPassword ? t('login.backToLogin') : t('login.forgotPassword')}
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                showResetPassword ? t('login.sendResetEmail') : t('login.loginButton')
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="demo-info">
              <strong>{t('login.secureAccess')}</strong>
            </p>
            <div className="demo-credentials">
              <div className="credential-item">
                <span className="credential-label">🔒</span>
                <span>{t('login.firebaseAuth')}</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">🛡️</span>
                <span>{t('login.protectedDatabase')}</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', marginTop: '12px', color: '#6b7280', textAlign: 'center' }}>
              {t('login.contactAdmin')}
            </p>
          </div>
        </div>

        <div className="login-info">
          <p>{t('login.copyright')}</p>
          <p>
            <a href="/">{t('login.backToSite')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;