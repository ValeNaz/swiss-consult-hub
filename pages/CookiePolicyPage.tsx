import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LegalPages.css';

const CookiePolicyPage: React.FC = () => {
    const { t } = useTranslation('legal');

    // Get arrays from translations
    const section2Items1 = t('cookiePolicy.section2.subsection1.items', { returnObjects: true }) as string[];
    const section2Items2 = t('cookiePolicy.section2.subsection2.items', { returnObjects: true }) as string[];
    const section2Items3 = t('cookiePolicy.section2.subsection3.items', { returnObjects: true }) as string[];
    const section3Cookies = t('cookiePolicy.section3.cookies', { returnObjects: true }) as Array<{name: string, purpose: string, duration: string}>;
    const section4Cookies = t('cookiePolicy.section4.subsection1.cookies', { returnObjects: true }) as Array<{name: string, purpose: string, duration: string}>;
    const section6Services = t('cookiePolicy.section6.services', { returnObjects: true }) as Array<{name: string, purpose: string, privacyLink: string}>;
    const section7Items = t('cookiePolicy.section7.subsection2.items', { returnObjects: true }) as string[];
    const section8Browsers = t('cookiePolicy.section8.subsection2.browsers', { returnObjects: true }) as Array<{name: string, instructions: string}>;
    const section8Tools = t('cookiePolicy.section8.subsection3.tools', { returnObjects: true }) as Array<{name: string, url: string}>;
    const section9Effects1 = t('cookiePolicy.section9.subsection1.effects', { returnObjects: true }) as string[];
    const section9Effects2 = t('cookiePolicy.section9.subsection2.effects', { returnObjects: true }) as string[];
    const section9Effects3 = t('cookiePolicy.section9.subsection3.effects', { returnObjects: true }) as string[];
    const section12Links = t('cookiePolicy.section12.links', { returnObjects: true }) as Array<{text: string, url: string, external?: boolean}>;

    return (
        <div className="legal-page">
            <div className="legal-container">
                {/* Header */}
                <header className="legal-header">
                    <h1>{t('cookiePolicy.title')}</h1>
                    <p className="legal-last-update">{t('cookiePolicy.lastUpdate')}</p>
                </header>

                {/* Contenuto */}
                <div className="legal-content">
                    {/* 1. Introduzione */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section1.title')}</h2>
                        <p>{t('cookiePolicy.section1.paragraph1')}</p>
                        <p>{t('cookiePolicy.section1.paragraph2')}</p>
                    </section>

                    {/* 2. Tipi di Cookie */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section2.title')}</h2>
                        <p>{t('cookiePolicy.section2.intro')}</p>

                        <h3>{t('cookiePolicy.section2.subsection1.title')}</h3>
                        <ul>
                            {section2Items1.map((item, index) => {
                                const [title, desc] = item.split(': ');
                                return (
                                    <li key={index}>
                                        <strong>{title}:</strong> {desc}
                                    </li>
                                );
                            })}
                        </ul>

                        <h3>{t('cookiePolicy.section2.subsection2.title')}</h3>
                        <ul>
                            {section2Items2.map((item, index) => {
                                const [title, desc] = item.split(': ');
                                return (
                                    <li key={index}>
                                        <strong>{title}:</strong> {desc}
                                    </li>
                                );
                            })}
                        </ul>

                        <h3>{t('cookiePolicy.section2.subsection3.title')}</h3>
                        <ul>
                            {section2Items3.map((item, index) => {
                                const [title, desc] = item.split(': ');
                                return (
                                    <li key={index}>
                                        <strong>{title}:</strong> {desc}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* 3. Cookie Essenziali */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section3.title')}</h2>
                        <p>{t('cookiePolicy.section3.intro')}</p>

                        <div className="cookie-table">
                            <h4>{t('cookiePolicy.section3.tableTitle')}</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('cookiePolicy.section3.tableHeaders.name')}</th>
                                        <th>{t('cookiePolicy.section3.tableHeaders.purpose')}</th>
                                        <th>{t('cookiePolicy.section3.tableHeaders.duration')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section3Cookies.map((cookie, index) => (
                                        <tr key={index}>
                                            <td><code>{cookie.name}</code></td>
                                            <td>{cookie.purpose}</td>
                                            <td>{cookie.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="legal-note">
                            <strong>{t('cookiePolicy.section3.note')}</strong> {t('cookiePolicy.section3.noteText')}
                        </p>
                    </section>

                    {/* 4. Cookie di Analisi */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section4.title')}</h2>
                        <p>{t('cookiePolicy.section4.intro')}</p>

                        <h3>{t('cookiePolicy.section4.subsection1.title')}</h3>
                        <p>{t('cookiePolicy.section4.subsection1.description')}</p>

                        <div className="cookie-table">
                            <h4>{t('cookiePolicy.section4.subsection1.tableTitle')}</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('cookiePolicy.section3.tableHeaders.name')}</th>
                                        <th>{t('cookiePolicy.section3.tableHeaders.purpose')}</th>
                                        <th>{t('cookiePolicy.section3.tableHeaders.duration')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section4Cookies.map((cookie, index) => (
                                        <tr key={index}>
                                            <td><code>{cookie.name}</code></td>
                                            <td>{cookie.purpose}</td>
                                            <td>{cookie.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p>
                            {t('cookiePolicy.section4.subsection1.privacyLink')}
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                                {t('cookiePolicy.section4.subsection1.privacyLinkText')}
                            </a>
                        </p>

                        <h3>{t('cookiePolicy.section4.subsection2.title')}</h3>
                        <p>{t('cookiePolicy.section4.subsection2.description')}</p>
                    </section>

                    {/* 5. Cookie di Marketing */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section5.title')}</h2>
                        <p>{t('cookiePolicy.section5.intro')}</p>

                        <p className="legal-note">
                            <strong>{t('cookiePolicy.section5.note')}</strong> {t('cookiePolicy.section5.noteText')}
                        </p>
                    </section>

                    {/* 6. Cookie di Terze Parti */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section6.title')}</h2>
                        <p>{t('cookiePolicy.section6.intro')}</p>

                        <h3>{t('cookiePolicy.section6.servicesTitle')}</h3>
                        <ul>
                            {section6Services.map((service, index) => (
                                <li key={index}>
                                    <strong>{service.name}:</strong> {service.purpose}{' '}
                                    (<a
                                        href={service.name === 'Google Analytics' ? 'https://policies.google.com/privacy' : 'https://cloudinary.com/privacy'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {service.privacyLink}
                                    </a>)
                                </li>
                            ))}
                        </ul>

                        <p>{t('cookiePolicy.section6.recommendation')}</p>
                    </section>

                    {/* 7. Altre Tecnologie di Tracciamento */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section7.title')}</h2>
                        <p>{t('cookiePolicy.section7.intro')}</p>

                        <h3>{t('cookiePolicy.section7.subsection1.title')}</h3>
                        <p>{t('cookiePolicy.section7.subsection1.description')}</p>

                        <h3>{t('cookiePolicy.section7.subsection2.title')}</h3>
                        <p>{t('cookiePolicy.section7.subsection2.description')}</p>
                        <ul>
                            {section7Items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>

                        <h3>{t('cookiePolicy.section7.subsection3.title')}</h3>
                        <p>{t('cookiePolicy.section7.subsection3.description')}</p>
                    </section>

                    {/* 8. Come Gestire i Cookie */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section8.title')}</h2>
                        <p>{t('cookiePolicy.section8.intro')}</p>

                        <h3>{t('cookiePolicy.section8.subsection1.title')}</h3>
                        <p>
                            {t('cookiePolicy.section8.subsection1.description')}
                            <a href="/#/cookie-settings">{t('cookiePolicy.section8.subsection1.linkText')}</a>.
                        </p>

                        <h3>{t('cookiePolicy.section8.subsection2.title')}</h3>
                        <p>{t('cookiePolicy.section8.subsection2.description')}</p>

                        <div className="browser-instructions">
                            {section8Browsers.map((browser, index) => (
                                <div key={index}>
                                    <h4>{browser.name}</h4>
                                    <p>{browser.instructions}</p>
                                </div>
                            ))}
                        </div>

                        <h3>{t('cookiePolicy.section8.subsection3.title')}</h3>
                        <p>{t('cookiePolicy.section8.subsection3.description')}</p>
                        <ul>
                            {section8Tools.map((tool, index) => (
                                <li key={index}>
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer">{tool.name}</a>
                                </li>
                            ))}
                        </ul>

                        <h3>{t('cookiePolicy.section8.subsection4.title')}</h3>
                        <p>{t('cookiePolicy.section8.subsection4.description')}</p>
                    </section>

                    {/* 9. Effetti della Disabilitazione */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section9.title')}</h2>
                        <p>{t('cookiePolicy.section9.intro')}</p>

                        <h3>{t('cookiePolicy.section9.subsection1.title')}</h3>
                        <p>{t('cookiePolicy.section9.subsection1.description')}</p>
                        <ul>
                            {section9Effects1.map((effect, index) => (
                                <li key={index}>{effect}</li>
                            ))}
                        </ul>

                        <h3>{t('cookiePolicy.section9.subsection2.title')}</h3>
                        <p>{t('cookiePolicy.section9.subsection2.description')}</p>
                        <ul>
                            {section9Effects2.map((effect, index) => (
                                <li key={index}>{effect}</li>
                            ))}
                        </ul>

                        <h3>{t('cookiePolicy.section9.subsection3.title')}</h3>
                        <p>{t('cookiePolicy.section9.subsection3.description')}</p>
                        <ul>
                            {section9Effects3.map((effect, index) => (
                                <li key={index}>{effect}</li>
                            ))}
                        </ul>
                    </section>

                    {/* 10. Cookie e Dispositivi Mobili */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section10.title')}</h2>
                        <p>{t('cookiePolicy.section10.intro')}</p>

                        <h3>{t('cookiePolicy.section10.ios.title')}</h3>
                        <p>{t('cookiePolicy.section10.ios.instructions')}</p>

                        <h3>{t('cookiePolicy.section10.android.title')}</h3>
                        <p>{t('cookiePolicy.section10.android.instructions')}</p>
                    </section>

                    {/* 11. Aggiornamenti */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section11.title')}</h2>
                        <p>{t('cookiePolicy.section11.paragraph1')}</p>
                        <p>{t('cookiePolicy.section11.paragraph2')}</p>
                    </section>

                    {/* 12. Link Utili */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section12.title')}</h2>
                        <ul>
                            {section12Links.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.url}
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                    >
                                        {link.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 13. Contatti */}
                    <section className="legal-section">
                        <h2>{t('cookiePolicy.section13.title')}</h2>
                        <p>{t('cookiePolicy.section13.intro')}</p>
                        <div className="legal-contact-box">
                            <h4>{t('cookiePolicy.section13.contactBox.companyName')}</h4>
                            <p><strong>{t('cookiePolicy.section13.contactBox.dpoTitle')}</strong></p>
                            <p><strong>{t('cookiePolicy.section13.contactBox.email')}</strong> <a href={`mailto:${t('cookiePolicy.section13.contactBox.emailValue')}`}>{t('cookiePolicy.section13.contactBox.emailValue')}</a></p>
                            <p><strong>{t('cookiePolicy.section13.contactBox.phone')}</strong> {t('cookiePolicy.section13.contactBox.phoneValue')}</p>
                            <p><strong>{t('cookiePolicy.section13.contactBox.address')}</strong> {t('cookiePolicy.section13.contactBox.addressValue')}</p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="legal-footer-section">
                    <p>{t('cookiePolicy.footer.compliance')}</p>
                    <p className="legal-back-link">
                        <a href="/#/">{t('cookiePolicy.footer.backLink')}</a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default CookiePolicyPage;
