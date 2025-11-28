
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS, SERVICES_DATA } from '../constants';
import { Menu, X, ChevronDown } from 'lucide-react';
import ServiceIcon from './ServiceIcon';
import { useScrollTrigger } from '../utils/useScrollTrigger';
import logoUrl from '../media/Logo_SwissConsultHub.png';
import logoDarkUrl from '../media/Logodark_SwissConsultHub.png';
import { useTranslation } from 'react-i18next';

const LANGUAGES = ['it', 'en', 'fr', 'de'] as const;

const Header: React.FC = () => {
    // Hook ottimizzato per gestire lo stato scrolled della navbar
    const isScrolled = useScrollTrigger({
        threshold: 50,      // Attiva stato scrolled dopo 50px
        hysteresis: 20,     // Zona cuscinetto di 20px per stabilità
        debounceMs: 50      // Debounce di 50ms per prevenire flickering
    });
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [activeLanguage, setActiveLanguage] = useState<(typeof LANGUAGES)[number]>('it');
    const location = useLocation();
    const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const { t, i18n } = useTranslation(['navigation', 'services']);

    const closeServices = () => setIsServicesOpen(false);
    const toggleMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMenu = () => {
        setIsMobileMenuOpen(false);
        closeServices();
    };

    const handleNavItemClick = () => closeMenu();

    const handleLanguageChange = (lang: (typeof LANGUAGES)[number]) => {
        setActiveLanguage(lang);
        i18n.changeLanguage(lang);
        if (typeof window !== 'undefined') {
            try { localStorage.setItem('i18nextLng', lang); } catch {}
        }
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            closeMenu();
        }
    };

    const handleServicesToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsServicesOpen(prev => !prev);
    };

    const handleServicesMouseEnter = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
            }
            setIsServicesOpen(true);
        }
    };

    const handleServicesMouseLeave = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            closeTimeoutRef.current = setTimeout(() => {
                setIsServicesOpen(false);
            }, 300);
        }
    };

    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

    useEffect(() => {
        const lng = (typeof window !== 'undefined' && localStorage.getItem('i18nextLng')) || i18n.language || 'it';
        setActiveLanguage((lng as (typeof LANGUAGES)[number]));
        const onLangChanged = (l: string) => setActiveLanguage(l as (typeof LANGUAGES)[number]);
        i18n.on('languageChanged', onLangChanged);
        return () => { i18n.off('languageChanged', onLangChanged); };
    }, [i18n]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('mobile-nav-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-nav-open');
        }

        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-nav-open');
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            closeServices();
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    const headerClasses = ['header'];
    if (isScrolled) headerClasses.push('scrolled');
    if (isMobileMenuOpen) headerClasses.push('menu-open');

    const getMenuLabel = (path: string) => {
        switch (path) {
            case '/': return t('navigation:menu.home');
            case '/servizi': return t('navigation:menu.services');
            case '/chi-siamo': return t('navigation:menu.about');
            case '/contatti': return t('navigation:menu.contact');
            default: return path;
        }
    };

    return (
        <header className={headerClasses.join(' ')}>
            {isMobileMenuOpen && (
                <div 
                    className="mobile-menu-overlay" 
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}
            <div className="top-bar">
                <div className="container">
                    <div className="top-bar-content">
                        <span>{t('navigation:header.topBar')}</span>
                        <a href="mailto:info@swissconsulthub.ch">info@swissconsulthub.ch</a>
                        <a href="tel:+41412420442">+41 412 420 442</a>
                        <a href="tel:+41783588121">+41 783 588 121</a>
                    </div>
                </div>
            </div>
            <div className="container header-container">
                <NavLink to="/" className="logo site-logo" aria-label="Swiss Consult Hub">
                    <img
                        src={logoUrl}
                        alt="Swiss Consult Hub"
                        className={`logo-img ${isScrolled ? 'hidden' : ''}`}
                    />
                    <img
                        src={logoDarkUrl}
                        alt="Swiss Consult Hub"
                        className={`logo-img ${isScrolled ? '' : 'hidden'}`}
                        aria-hidden={!isScrolled}
                    />
                </NavLink>
                <div className="header-actions">
                    <a className="header-call" href="tel:+41783588121" aria-label={t('navigation:header.callUs')}>
                        +41 783 588 121
                    </a>
                    <button
                        type="button"
                        className="mobile-menu-toggle"
                        aria-label={isMobileMenuOpen ? t('navigation:header.closeMenu') : t('navigation:header.openMenu')}
                        aria-expanded={isMobileMenuOpen}
                        onClick={toggleMenu}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`} aria-hidden={!isMobileMenuOpen}>
                    {NAV_LINKS.map((link) => (
                        link.path === '/servizi' ? (
                            <li
                                key={link.path}
                                className={`services-nav-item ${isServicesOpen ? 'open' : ''}`}
                                onMouseEnter={handleServicesMouseEnter}
                                onMouseLeave={handleServicesMouseLeave}
                            >
                                <div className="nav-link-group">
                                    <NavLink
                                        to={link.path}
                                        end
                                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                        onClick={handleNavItemClick}
                                    >
                                        {getMenuLabel(link.path)}
                                    </NavLink>
                                    <button
                                        type="button"
                                        className="nav-link-toggle"
                                        aria-label={isServicesOpen ? t('navigation:header.closeServices') : t('navigation:header.openServices')}
                                        aria-expanded={isServicesOpen}
                                        onClick={handleServicesToggle}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                                <div className={`services-dropdown ${isServicesOpen ? 'open' : ''}`} aria-hidden={!isServicesOpen}>
                                    <div className="services-dropdown-grid">
                                        {SERVICES_DATA.map((service) => (
                                            <a
                                                key={service.slug}
                                                href={`#/servizi/${service.slug}`}
                                                className="nav-service-card"
                                                data-service={service.theme}
                                                onClick={handleNavItemClick}
                                            >
                                                <span className="nav-service-icon" aria-hidden="true">
                                                    <ServiceIcon service={service.theme} />
                                                </span>
                                                <strong>{t(`services:services.${service.theme}.title`)}</strong>
                                            </a>
                                        ))}
                                        <a className="services-dropdown-all" href="#/servizi" onClick={handleNavItemClick}>
                                            {t('navigation:header.allServices')}
                                        </a>
                                    </div>
                                </div>
                                <div className={`mobile-services ${isServicesOpen ? 'open' : ''}`}>
                                    {SERVICES_DATA.map((service) => (
                                        <a
                                            key={service.slug}
                                            href={`#/servizi/${service.slug}`}
                                            className="nav-service-card"
                                            data-service={service.theme}
                                            onClick={handleNavItemClick}
                                        >
                                            <span className="nav-service-icon" aria-hidden="true">
                                                <ServiceIcon service={service.theme} />
                                            </span>
                                            <strong>{t(`services:services.${service.theme}.title`)}</strong>
                                        </a>
                                    ))}
                                    <a className="services-dropdown-all" href="#/servizi" onClick={handleNavItemClick}>
                                        {t('navigation:header.allServices')}
                                    </a>
                                </div>
                            </li>
                        ) : (
                            <li key={link.path}>
                                <NavLink
                                    to={link.path}
                                    end={link.path === '/'}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={handleNavItemClick}
                                >
                                    {getMenuLabel(link.path)}
                                </NavLink>
                            </li>
                        )
                    ))}
                    <li className="language-menu-item">
                        <div className="language-switcher language-switcher-mobile" role="group" aria-label={t('navigation:header.selectLanguage')}>
                            {LANGUAGES.map((lang) => (
                                <button
                                    type="button"
                                    key={lang}
                                    className={`lang-btn ${activeLanguage === lang ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange(lang)}
                                    aria-pressed={activeLanguage === lang}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </li>
                    <li className="mobile-contact-menu">
                        <div className="mobile-contact-block">
                            <span className="mobile-contact-eyebrow">{t('navigation:header.quickContacts')}</span>
                            <a href="tel:+41412420442" className="mobile-contact-link">+41 412 420 442</a>
                            <a href="tel:+41783588121" className="mobile-contact-link">+41 783 588 121</a>
                            <a href="mailto:info@swissconsulthub.ch" className="mobile-contact-link">info@swissconsulthub.ch</a>
                        </div>
                    </li>
                </ul>
                <div className="language-switcher language-switcher-desktop" role="group" aria-label={t('navigation:header.selectLanguage')}>
                    {LANGUAGES.map((lang) => (
                        <button
                            type="button"
                            key={lang}
                            className={`lang-btn ${activeLanguage === lang ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang)}
                            aria-pressed={activeLanguage === lang}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;
