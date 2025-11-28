import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LegalPages.css';

const PrivacyPolicyPage: React.FC = () => {
    const { t } = useTranslation('legal');
    return (
        <div className="legal-page">
            <div className="legal-container">
                {/* Header */}
                <header className="legal-header">
                    <h1>{t('privacyPolicy.title')}</h1>
                    <p className="legal-last-update">{t('privacyPolicy.lastUpdate')}</p>
                </header>

                {/* Contenuto */}
                <div className="legal-content">
                    {/* 1. Introduzione */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section1.title')}</h2>
                        <p>
                            {t('privacyPolicy.section1.intro')}
                        </p>
                        <div className="legal-info-box">
                            <h4>{t('privacyPolicy.section1.companyInfo.title')}</h4>
                            <p><strong>{t('privacyPolicy.section1.companyInfo.legalName')}</strong> {t('privacyPolicy.section1.companyInfo.legalNameValue')}</p>
                            <p><strong>{t('privacyPolicy.section1.companyInfo.legalAddress')}</strong> {t('privacyPolicy.section1.companyInfo.legalAddressValue')}</p>
                            <p><strong>{t('privacyPolicy.section1.companyInfo.email')}</strong> {t('privacyPolicy.section1.companyInfo.emailValue')}</p>
                            <p><strong>{t('privacyPolicy.section1.companyInfo.phone')}</strong> {t('privacyPolicy.section1.companyInfo.phoneValue')}</p>
                            <p><strong>{t('privacyPolicy.section1.companyInfo.dpo')}</strong> {t('privacyPolicy.section1.companyInfo.dpoValue')}</p>
                        </div>
                    </section>

                    {/* 2. Dati Raccolti */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section2.title')}</h2>
                        <p>{t('privacyPolicy.section2.intro')}</p>

                        <h3>{t('privacyPolicy.section2.subsection1.title')}</h3>
                        <ul>
                            {(t('privacyPolicy.section2.subsection1.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <h3>{t('privacyPolicy.section2.subsection2.title')}</h3>
                        <ul>
                            {(t('privacyPolicy.section2.subsection2.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <h3>{t('privacyPolicy.section2.subsection3.title')}</h3>
                        <ul>
                            {(t('privacyPolicy.section2.subsection3.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <h3>{t('privacyPolicy.section2.subsection4.title')}</h3>
                        <ul>
                            {(t('privacyPolicy.section2.subsection4.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <h3>{t('privacyPolicy.section2.subsection5.title')}</h3>
                        <ul>
                            {(t('privacyPolicy.section2.subsection5.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    {/* 3. Finalità del Trattamento */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section3.title')}</h2>
                        <p>{t('privacyPolicy.section3.intro')}</p>
                        <ul>
                            {(t('privacyPolicy.section3.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    {/* 4. Base Legale */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section4.title')}</h2>
                        <p>{t('privacyPolicy.section4.intro')}</p>
                        <ul>
                            {(t('privacyPolicy.section4.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    {/* 5. Destinatari dei Dati */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section5.title')}</h2>
                        <p>{t('privacyPolicy.section5.intro')}</p>
                        <ul>
                            {(t('privacyPolicy.section5.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                            <li>
                                <ul>
                                    {(t('privacyPolicy.section5.serviceProviders', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </li>
                            <li>{t('privacyPolicy.section5.authorities')}</li>
                        </ul>
                        <p className="legal-note">
                            <strong>{t('privacyPolicy.section5.note')}</strong> {t('privacyPolicy.section5.noteText')}
                        </p>
                    </section>

                    {/* 6. Trasferimenti Internazionali */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section6.title')}</h2>
                        <p>
                            {t('privacyPolicy.section6.intro')}
                        </p>
                        <ul>
                            {(t('privacyPolicy.section6.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    {/* 7. Diritti dell'Interessato */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section7.title')}</h2>
                        <p>{t('privacyPolicy.section7.intro')}</p>

                        <h3>{t('privacyPolicy.section7.subsection1.title')}</h3>
                        <p>{t('privacyPolicy.section7.subsection1.text')}</p>

                        <h3>{t('privacyPolicy.section7.subsection2.title')}</h3>
                        <p>{t('privacyPolicy.section7.subsection2.text')}</p>

                        <h3>{t('privacyPolicy.section7.subsection3.title')}</h3>
                        <p>{t('privacyPolicy.section7.subsection3.text')}</p>

                        <h3>{t('privacyPolicy.section7.subsection4.title')}</h3>
                        <p>{t('privacyPolicy.section7.subsection4.text')}</p>

                        <h3>{t('privacyPolicy.section7.subsection5.title')}</h3>
                        <p>{t('privacyPolicy.section7.subsection5.text')}</p>

                        <h3>{t('privacyPolicy.section7.subsection6.title')}</h3>
                        <p>{t('privacyPolicy.section7.subsection6.text')}</p>

                        <h3>{t('privacyPolicy.section7.subsection7.title')}</h3>
                        <p>{t('privacyPolicy.section7.subsection7.intro')}</p>
                        <ul>
                            {(t('privacyPolicy.section7.subsection7.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                        <p className="legal-note">
                            <strong>{t('privacyPolicy.section7.subsection7.note')}</strong> {t('privacyPolicy.section7.subsection7.noteText')}
                        </p>
                    </section>

                    {/* 8. Cookie e Tracciamento */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section8.title')}</h2>
                        <p>
                            {t('privacyPolicy.section8.intro')}
                        </p>
                        <h3>{t('privacyPolicy.section8.cookieTypes')}</h3>
                        <ul>
                            {(t('privacyPolicy.section8.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                        <p>{t('privacyPolicy.section8.management')}</p>
                    </section>

                    {/* 9. Sicurezza dei Dati */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section9.title')}</h2>
                        <p>{t('privacyPolicy.section9.intro')}</p>

                        <h3>{t('privacyPolicy.section9.subsection1.title')}</h3>
                        <ul>
                            {(t('privacyPolicy.section9.subsection1.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <h3>{t('privacyPolicy.section9.subsection2.title')}</h3>
                        <ul>
                            {(t('privacyPolicy.section9.subsection2.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>

                        <h3>{t('privacyPolicy.section9.subsection3.title')}</h3>
                        <p>
                            {t('privacyPolicy.section9.subsection3.text')}
                        </p>
                    </section>

                    {/* 10. Conservazione dei Dati */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section10.title')}</h2>
                        <p>{t('privacyPolicy.section10.intro')}</p>
                        <ul>
                            {(t('privacyPolicy.section10.items', { returnObjects: true }) as string[]).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                        <p>
                            {t('privacyPolicy.section10.conclusion')}
                        </p>
                    </section>

                    {/* 11. Minori */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section11.title')}</h2>
                        <p>
                            {t('privacyPolicy.section11.text')}
                        </p>
                    </section>

                    {/* 12. Modifiche alla Privacy Policy */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section12.title')}</h2>
                        <p>
                            {t('privacyPolicy.section12.text1')}
                        </p>
                        <p>
                            {t('privacyPolicy.section12.text2')}
                        </p>
                    </section>

                    {/* 13. Contatti */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section13.title')}</h2>
                        <p>{t('privacyPolicy.section13.intro')}</p>
                        <div className="legal-contact-box">
                            <h4>{t('privacyPolicy.section13.contactBox.title')}</h4>
                            <p><strong>{t('privacyPolicy.section13.contactBox.email')}</strong> <a href="mailto:dpo@swissconsulthub.ch">{t('privacyPolicy.section13.contactBox.emailValue')}</a></p>
                            <p><strong>{t('privacyPolicy.section13.contactBox.phone')}</strong> {t('privacyPolicy.section13.contactBox.phoneValue')}</p>
                            <p><strong>{t('privacyPolicy.section13.contactBox.address')}</strong> {t('privacyPolicy.section13.contactBox.addressValue')}</p>
                        </div>
                    </section>

                    {/* 14. Reclami */}
                    <section className="legal-section">
                        <h2>{t('privacyPolicy.section14.title')}</h2>
                        <p>
                            {t('privacyPolicy.section14.intro')}
                        </p>
                        <div className="legal-contact-box">
                            <h4>{t('privacyPolicy.section14.authority.title')}</h4>
                            <p><strong>{t('privacyPolicy.section14.authority.address')}</strong> {t('privacyPolicy.section14.authority.addressValue')}</p>
                            <p><strong>{t('privacyPolicy.section14.authority.email')}</strong> <a href="mailto:contact@edoeb.admin.ch">{t('privacyPolicy.section14.authority.emailValue')}</a></p>
                            <p><strong>{t('privacyPolicy.section14.authority.phone')}</strong> {t('privacyPolicy.section14.authority.phoneValue')}</p>
                            <p><strong>{t('privacyPolicy.section14.authority.website')}</strong> <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer">{t('privacyPolicy.section14.authority.websiteValue')}</a></p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="legal-footer-section">
                    <p>
                        {t('privacyPolicy.footer.compliance')}
                    </p>
                    <p className="legal-back-link">
                        <a href="/#/">{t('privacyPolicy.footer.backLink')}</a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
