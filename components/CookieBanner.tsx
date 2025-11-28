import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings, Check } from 'lucide-react';
import '../styles/CookieBanner.css';
import { useTranslation } from 'react-i18next';

interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

const CookieBanner: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true, // Always true
        analytics: false,
        marketing: false,
    });
    const { t } = useTranslation('cookies');

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('sch_cookie_consent');
        if (!consent) {
            // Show banner after 1 second
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const savePreferences = (prefs: CookiePreferences) => {
        const consent = {
            ...prefs,
            essential: true, // Always true
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        localStorage.setItem('sch_cookie_consent', JSON.stringify(consent));
        
        // Initialize analytics if consented
        if (prefs.analytics) {
            initializeAnalytics();
        }

        setShowBanner(false);
        setShowSettings(false);
    };

    const initializeAnalytics = () => {
        // Initialize Google Analytics or other analytics here
        console.log('📊 Analytics initialized');
        // Example: window.gtag('config', 'GA_MEASUREMENT_ID');
    };

    const handleAcceptAll = () => {
        savePreferences({
            essential: true,
            analytics: true,
            marketing: true,
        });
    };

    const handleRejectAll = () => {
        savePreferences({
            essential: true,
            analytics: false,
            marketing: false,
        });
    };

    const handleSaveCustom = () => {
        savePreferences(preferences);
    };

    const handleTogglePreference = (key: keyof CookiePreferences) => {
        if (key === 'essential') return; // Cannot toggle essential
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    if (!showBanner) return null;

    return (
        <div className="cookie-banner-overlay">
            <div className={`cookie-banner ${showSettings ? 'cookie-banner-expanded' : ''}`}>
                {/* Header */}
                <div className="cookie-banner-header">
                    <div className="cookie-banner-icon">
                        <Cookie size={24} />
                    </div>
                    <h3 className="cookie-banner-title">
                        {showSettings ? t('banner.settingsTitle') : t('banner.title')}
                    </h3>
                    <button
                        className="cookie-banner-close"
                        onClick={() => setShowBanner(false)}
                        aria-label={t('banner.closeButton')}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                {!showSettings ? (
                    // Simple View
                    <div className="cookie-banner-content">
                        <p>
                            {t('banner.description')}
                        </p>
                        <p className="cookie-banner-link">
                            {t('banner.readMore')}{' '}
                            <a href="/#/cookie-policy" target="_blank" rel="noopener noreferrer">
                                {t('banner.cookiePolicy')}
                            </a>{' '}
                            {t('banner.and')}{' '}
                            <a href="/#/privacy-policy" target="_blank" rel="noopener noreferrer">
                                {t('banner.privacyPolicy')}
                            </a>
                        </p>
                    </div>
                ) : (
                    // Detailed Settings
                    <div className="cookie-banner-settings">
                        {/* Essential Cookies */}
                        <div className="cookie-category">
                            <div className="cookie-category-header">
                                <label className="cookie-toggle">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        aria-label={t('categories.essential.ariaLabel')}
                                    />
                                    <span className="cookie-toggle-slider disabled"></span>
                                </label>
                                <div>
                                    <h4>{t('categories.essential.title')}</h4>
                                    <span className="cookie-badge">{t('categories.essential.badge')}</span>
                                </div>
                            </div>
                            <p className="cookie-category-description">
                                {t('categories.essential.description')}
                            </p>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="cookie-category">
                            <div className="cookie-category-header">
                                <label className="cookie-toggle">
                                    <input
                                        type="checkbox"
                                        checked={preferences.analytics}
                                        onChange={() => handleTogglePreference('analytics')}
                                        aria-label={t('categories.analytics.ariaLabel')}
                                    />
                                    <span className="cookie-toggle-slider"></span>
                                </label>
                                <div>
                                    <h4>{t('categories.analytics.title')}</h4>
                                    <span className={`cookie-badge ${preferences.analytics ? 'badge-enabled' : 'badge-disabled'}`}>
                                        {preferences.analytics ? t('categories.analytics.badgeEnabled') : t('categories.analytics.badgeDisabled')}
                                    </span>
                                </div>
                            </div>
                            <p className="cookie-category-description">
                                {t('categories.analytics.description')}
                            </p>
                        </div>

                        {/* Marketing Cookies */}
                        <div className="cookie-category">
                            <div className="cookie-category-header">
                                <label className="cookie-toggle">
                                    <input
                                        type="checkbox"
                                        checked={preferences.marketing}
                                        onChange={() => handleTogglePreference('marketing')}
                                        aria-label={t('categories.marketing.ariaLabel')}
                                    />
                                    <span className="cookie-toggle-slider"></span>
                                </label>
                                <div>
                                    <h4>{t('categories.marketing.title')}</h4>
                                    <span className={`cookie-badge ${preferences.marketing ? 'badge-enabled' : 'badge-disabled'}`}>
                                        {preferences.marketing ? t('categories.marketing.badgeEnabled') : t('categories.marketing.badgeDisabled')}
                                    </span>
                                </div>
                            </div>
                            <p className="cookie-category-description">
                                {t('categories.marketing.description')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="cookie-banner-actions">
                    {!showSettings ? (
                        <>
                            <button
                                className="cookie-btn cookie-btn-settings"
                                onClick={() => setShowSettings(true)}
                            >
                                <Settings size={18} />
                                {t('banner.buttons.customize')}
                            </button>
                            <button
                                className="cookie-btn cookie-btn-reject"
                                onClick={handleRejectAll}
                            >
                                {t('banner.buttons.rejectAll')}
                            </button>
                            <button
                                className="cookie-btn cookie-btn-accept"
                                onClick={handleAcceptAll}
                            >
                                <Check size={18} />
                                {t('banner.buttons.acceptAll')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="cookie-btn cookie-btn-back"
                                onClick={() => setShowSettings(false)}
                            >
                                {t('banner.buttons.back')}
                            </button>
                            <button
                                className="cookie-btn cookie-btn-save"
                                onClick={handleSaveCustom}
                            >
                                <Check size={18} />
                                {t('banner.buttons.savePreferences')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
