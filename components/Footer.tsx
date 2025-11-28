import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS, SERVICES_DATA } from '../constants';
import logoUrl from '../media/Logo_SwissConsultHub.png';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const { t } = useTranslation(['navigation', 'services']);

    return (
        <footer className="footer">
            {/* Main Footer Content */}
            <div className="container">
                <div className="footer-main">
                    {/* About Section */}
                    <div className="footer-about">
                        <NavLink to="/" className="footer-logo" aria-label="Swiss Consult Hub">
                            <img src={logoUrl} alt="Swiss Consult Hub" />
                            <span className="footer-logo-text">Swiss Consult Hub</span>
                        </NavLink>
                        <p className="footer-description">
                            {t('navigation:footer.description')}
                        </p>
                        <div className="footer-contact-quick">
                            <a href="mailto:info@swissconsulthub.ch" className="footer-contact-item">
                                <Mail size={16} />
                                <span>info@swissconsulthub.ch</span>
                            </a>
                            <a href="tel:+41412420442" className="footer-contact-item">
                                <Phone size={16} />
                                <span>+41 412 420 442</span>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="footer-column">
                        <h4 className="footer-title">{t('navigation:footer.navigation')}</h4>
                        <ul className="footer-list">
                            {NAV_LINKS.map((link) => (
                                <li key={link.path}>
                                    <NavLink to={link.path} end={link.path === '/'}>
                                        {link.path === '/' && t('navigation:menu.home')}
                                        {link.path === '/servizi' && t('navigation:menu.services')}
                                        {link.path === '/chi-siamo' && t('navigation:menu.about')}
                                        {link.path === '/contatti' && t('navigation:menu.contact')}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Section */}
                    <div className="footer-column">
                        <h4 className="footer-title">{t('navigation:footer.services')}</h4>
                        <ul className="footer-list">
                            {SERVICES_DATA.slice(0, 4).map((service) => (
                                <li key={service.slug}>
                                    <NavLink to={`/servizi/${service.slug}`}>{t(`services:services.${service.theme}.title`)}</NavLink>
                                </li>
                            ))}
                            <li className="footer-list-more">
                                <NavLink to="/servizi">{t('navigation:header.allServices')} →</NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Locations Section */}
                    <div className="footer-column">
                        <h4 className="footer-title">{t('navigation:footer.locations')}</h4>
                        <ul className="footer-list footer-locations">
                            <li>
                                <MapPin size={14} />
                                <div>
                                    <strong>{t('navigation:footer.location.emmenbrucke')}</strong>
                                    <p>{t('navigation:footer.location.emmenbruckeAddress')}</p>
                                </div>
                            </li>
                            <li>
                                <MapPin size={14} />
                                <div>
                                    <strong>{t('navigation:footer.location.zurich')}</strong>
                                    <p>{t('navigation:footer.location.zurichAddress')}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Section */}
                    <div className="footer-column">
                        <h4 className="footer-title">{t('navigation:footer.legalInfo')}</h4>
                        <ul className="footer-list">
                            <li><NavLink to="/privacy-policy">{t('navigation:footer.privacyPolicy')}</NavLink></li>
                            <li><NavLink to="/terms-and-conditions">{t('navigation:footer.termsConditions')}</NavLink></li>
                            <li><NavLink to="/cookie-policy">{t('navigation:footer.cookiePolicy')}</NavLink></li>
                            <li><NavLink to="/data-subject-rights">{t("navigation:footer.dataSubjectRights")}</NavLink></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="footer-divider"></div>

            {/* Footer Bottom */}
            <div className="container">
                <div className="footer-bottom">
                    {/* Left: Legal Links */}
                    <div className="footer-bottom-left">
                        <div className="footer-legal-links">
                            <NavLink to="/privacy-policy">{t('navigation:footer.privacy')}</NavLink>
                            <span className="separator">•</span>
                            <NavLink to="/terms-and-conditions">{t('navigation:footer.terms')}</NavLink>
                            <span className="separator">•</span>
                            <NavLink to="/cookie-policy">{t('navigation:footer.cookies')}</NavLink>
                        </div>
                    </div>

                    {/* Center: Copyright & DPO */}
                    <div className="footer-bottom-center">
                        <p className="footer-copyright">© {currentYear} Swiss Consult Hub. Tutti i diritti riservati.</p>
                        <div className="footer-dpo-info">
                            <Shield size={14} />
                            <span>{t('navigation:footer.dpoLabel')} <a href="mailto:dpo@swissconsulthub.ch">dpo@swissconsulthub.ch</a></span>
                        </div>
                    </div>

                    {/* Right: Additional Contacts */}
                    <div className="footer-bottom-right">
                        <a href="tel:+41783588121" className="footer-phone-link">
                            +41 783 588 121
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
