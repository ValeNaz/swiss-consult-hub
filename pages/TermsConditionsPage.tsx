import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LegalPages.css';

const TermsConditionsPage: React.FC = () => {
    const { t } = useTranslation('legal');

    return (
        <div className="legal-page">
            <div className="legal-container">
                {/* Header */}
                <header className="legal-header">
                    <h1>{t('terms.title')}</h1>
                    <p className="legal-last-update">{t('terms.lastUpdate')}</p>
                </header>

                {/* Contenuto */}
                <div className="legal-content">
                    {/* TODO: Full content internationalization pending - current version shows Italian content */}
                    <p className="legal-note" style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-background-secondary)', borderRadius: '8px' }}>
                        {t('terms.note')}
                    </p>
                    {/* 1. Definizioni */}
                    <section className="legal-section">
                        <h2>1. Definizioni</h2>
                        <p>Ai fini dei presenti Termini e Condizioni:</p>
                        <ul>
                            <li><strong>"Servizi":</strong> I servizi di consulenza offerti da Swiss Consult Hub nelle aree creditizia, assicurativa, immobiliare, lavorativa, legale, medica e fiscale</li>
                            <li><strong>"Cliente":</strong> Qualsiasi persona fisica o giuridica che utilizza i nostri servizi</li>
                            <li><strong>"Consulente":</strong> I professionisti qualificati del team Swiss Consult Hub</li>
                            <li><strong>"Sito":</strong> Il sito web www.swissconsulthub.ch e tutti i suoi sottodomini</li>
                            <li><strong>"Contenuti":</strong> Tutti i materiali, informazioni, documenti e consulenze forniti</li>
                        </ul>
                    </section>

                    {/* 2. Accettazione Termini */}
                    <section className="legal-section">
                        <h2>2. Accettazione dei Termini</h2>
                        <p>
                            Utilizzando i nostri servizi, accettate di essere vincolati ai presenti Termini e Condizioni. 
                            Se non accettate questi termini, siete pregati di non utilizzare i nostri servizi.
                        </p>
                        <p>
                            Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche 
                            sostanziali vi saranno comunicate via email o tramite notifica sul sito. L'uso continuato 
                            dei servizi dopo le modifiche costituisce accettazione dei nuovi termini.
                        </p>
                    </section>

                    {/* 3. Descrizione Servizi */}
                    <section className="legal-section">
                        <h2>3. Descrizione dei Servizi</h2>
                        <p>Swiss Consult Hub offre i seguenti servizi di consulenza:</p>

                        <h3>3.1 Consulenza Creditizia</h3>
                        <p>
                            Consulenza per crediti personali, leasing, finanziamenti e soluzioni creditizie personalizzate. 
                            Include analisi della situazione finanziaria, ricerca di soluzioni ottimali e supporto nella presentazione delle richieste.
                        </p>
                        <p className="legal-note">
                            <strong>Disclaimer:</strong> Swiss Consult Hub non è un intermediario finanziario regolamentato. 
                            Le decisioni finali sono di competenza degli istituti finanziari. I prodotti finanziari comportano rischi.
                        </p>

                        <h3>3.2 Consulenza Assicurativa</h3>
                        <p>
                            Consulenza per assicurazioni sanitarie, previdenziali e aziendali tramite i nostri partner assicurativi. 
                            Include analisi delle esigenze, comparazione prodotti e supporto nella stipula.
                        </p>
                        <p className="legal-note">
                            <strong>Disclaimer:</strong> Swiss Consult Hub agisce come intermediario assicurativo. 
                            Riceviamo commissioni dalle compagnie assicurative. I prodotti hanno limitazioni ed esclusioni.
                        </p>

                        <h3>3.3 Intermediazione Immobiliare</h3>
                        <p>
                            Ricerca immobili, supporto per affitti e acquisti, investimenti immobiliari e gestione proprietà. 
                            Operativo in Svizzera e all'estero.
                        </p>
                        <p className="legal-note">
                            <strong>Disclaimer:</strong> Verificare sempre le proprietà personalmente. 
                            Per questioni legali, consultare un avvocato. Per finanziamenti, consultare banca o consulente.
                        </p>

                        <h3>3.4 Consulenza Lavorativa</h3>
                        <p>
                            Supporto nella ricerca lavoro, creazione CV, preparazione colloqui e identificazione opportunità 
                            professionali in Svizzera e all'estero.
                        </p>
                        <p className="legal-note">
                            <strong>Disclaimer:</strong> La consulenza è informativa. Verificare sempre i vostri diritti 
                            con le autorità competenti. Le leggi sul lavoro variano per cantone.
                        </p>

                        <h3>3.5 Consulenza Legale</h3>
                        <p>
                            Supporto legale tramite avvocati qualificati per contrattualistica, controversie e tutela legale. 
                            Coperto da segreto professionale.
                        </p>
                        <p className="legal-note">
                            <strong>Disclaimer:</strong> La consulenza è fornita da avvocati iscritti all'Albo. 
                            Coperta da assicurazione responsabilità civile. Segreto professionale garantito.
                        </p>

                        <h3>3.6 Consulenza Medica</h3>
                        <p>
                            Accesso a medici specialisti, cliniche private e supporto amministrativo sanitario. 
                            Dati medici trattati con massima riservatezza.
                        </p>
                        <p className="legal-note">
                            <strong>Disclaimer:</strong> La consulenza non sostituisce visita medica in persona. 
                            In caso di emergenza, contattare immediatamente il 144. Segreto medico garantito.
                        </p>

                        <h3>3.7 Consulenza Fiscale</h3>
                        <p>
                            Supporto per dichiarazioni fiscali, pianificazione fiscale e conformità normative tramite 
                            consulenti fiscali qualificati.
                        </p>
                        <p className="legal-note">
                            <strong>Disclaimer:</strong> Verificare sempre con le autorità fiscali competenti. 
                            Le leggi fiscali variano per cantone.
                        </p>
                    </section>

                    {/* 4. Tariffe e Pagamenti */}
                    <section className="legal-section">
                        <h2>4. Tariffe e Pagamenti</h2>
                        <h3>4.1 Tariffe</h3>
                        <p>
                            Le tariffe per i nostri servizi variano in base al tipo di consulenza richiesta. 
                            I prezzi specifici vi saranno comunicati prima dell'inizio del servizio.
                        </p>
                        <ul>
                            <li>Prima consulenza gratuita (fino a 30 minuti)</li>
                            <li>Consulenza oraria: CHF [importo] + IVA</li>
                            <li>Pacchetti servizi: Prezzi su richiesta</li>
                            <li>Commissioni: Per servizi assicurativi e creditizi, riceviamo commissioni dai partner</li>
                        </ul>

                        <h3>4.2 Modalità di Pagamento</h3>
                        <p>Accettiamo le seguenti modalità di pagamento:</p>
                        <ul>
                            <li>Bonifico bancario</li>
                            <li>Carta di credito (Visa, Mastercard)</li>
                            <li>TWINT</li>
                            <li>Fattura (per aziende con accordo)</li>
                        </ul>

                        <h3>4.3 Termini di Pagamento</h3>
                        <p>
                            Le fatture sono esigibili entro 30 giorni dalla data di emissione, salvo diverso accordo scritto. 
                            In caso di ritardo, potremmo applicare interessi di mora secondo le normative svizzere.
                        </p>

                        <h3>4.4 Diritto di Recesso</h3>
                        <p>
                            Avete il diritto di recedere dal contratto entro 14 giorni dalla stipula, senza dover fornire 
                            motivazioni. Per esercitare il diritto di recesso, dovete inviarci una comunicazione scritta.
                        </p>
                    </section>

                    {/* 5. Limitazioni di Responsabilità */}
                    <section className="legal-section">
                        <h2>5. Limitazioni di Responsabilità</h2>
                        <h3>5.1 Esclusione Responsabilità</h3>
                        <p>Swiss Consult Hub non è responsabile per:</p>
                        <ul>
                            <li>Danni indiretti, consequenziali o incidentali</li>
                            <li>Perdite finanziarie derivanti da decisioni prese sulla base delle consulenze fornite</li>
                            <li>Interruzioni del servizio dovute a cause di forza maggiore</li>
                            <li>Perdita di dati dovuta a guasti tecnici (pur mantenendo backup regolari)</li>
                            <li>Azioni di terze parti, inclusi partner e fornitori</li>
                            <li>Violazioni di sicurezza non imputabili a nostra negligenza</li>
                        </ul>

                        <h3>5.2 Limite Massimo</h3>
                        <p>
                            In ogni caso, la nostra responsabilità totale verso di voi non supererà l'importo delle 
                            tariffe pagate per i servizi negli ultimi 12 mesi, salvo responsabilità non escludibili per legge.
                        </p>

                        <h3>5.3 Assicurazione</h3>
                        <p>
                            Manteniamo un'assicurazione responsabilità civile professionale adeguata per coprire 
                            i rischi legati ai nostri servizi.
                        </p>
                    </section>

                    {/* 6. Garanzie e Disclaimer */}
                    <section className="legal-section">
                        <h2>6. Garanzie e Disclaimer</h2>
                        <h3>6.1 Disclaimer Generale</h3>
                        <p>
                            I servizi sono forniti "così come sono". Pur sforzandoci di fornire consulenze accurate 
                            e aggiornate, non garantiamo:
                        </p>
                        <ul>
                            <li>Completezza o accuratezza assoluta delle informazioni</li>
                            <li>Risultati specifici o successo garantito</li>
                            <li>Assenza di errori o omissioni</li>
                            <li>Disponibilità continua e ininterrotta dei servizi</li>
                        </ul>

                        <h3>6.2 Natura Informativa</h3>
                        <p>
                            Le consulenze fornite hanno natura informativa e orientativa. Ogni situazione è unica e 
                            richiede valutazione personalizzata. Per decisioni critiche, consultare sempre professionisti 
                            qualificati.
                        </p>

                        <h3>6.3 Responsabilità del Cliente</h3>
                        <p>
                            Siete responsabili di verificare l'accuratezza e la completezza delle informazioni fornite 
                            e di valutare l'applicabilità delle consulenze alla vostra situazione specifica.
                        </p>
                    </section>

                    {/* 7. Proprietà Intellettuale */}
                    <section className="legal-section">
                        <h2>7. Proprietà Intellettuale</h2>
                        <h3>7.1 Diritti d'Autore</h3>
                        <p>
                            Tutti i contenuti del sito, inclusi testi, grafica, loghi, icone, immagini e software, 
                            sono di proprietà di Swiss Consult Hub o dei suoi licenzianti e sono protetti da 
                            leggi sul copyright svizzere e internazionali.
                        </p>

                        <h3>7.2 Marchi</h3>
                        <p>
                            "Swiss Consult Hub" e tutti i loghi correlati sono marchi registrati. 
                            Non è consentito l'uso senza autorizzazione scritta.
                        </p>

                        <h3>7.3 Licenza d'Uso</h3>
                        <p>
                            Vi concediamo una licenza limitata, non esclusiva e non trasferibile per accedere e 
                            utilizzare il sito per uso personale e non commerciale.
                        </p>

                        <h3>7.4 Uso Vietato</h3>
                        <p>È vietato:</p>
                        <ul>
                            <li>Copiare, modificare o distribuire i contenuti senza autorizzazione</li>
                            <li>Utilizzare i contenuti per scopi commerciali</li>
                            <li>Rimuovere notifiche di copyright o marchi</li>
                            <li>Effettuare reverse engineering del software</li>
                        </ul>
                    </section>

                    {/* 8. Riservatezza */}
                    <section className="legal-section">
                        <h2>8. Riservatezza</h2>
                        <h3>8.1 Segreto Professionale</h3>
                        <p>
                            Per i servizi di consulenza legale e medica, viene garantito il segreto professionale 
                            secondo le normative svizzere (art. 321 CP).
                        </p>

                        <h3>8.2 Confidenzialità</h3>
                        <p>
                            Tutte le informazioni condivise durante la consulenza sono trattate con massima 
                            riservatezza e non saranno divulgate a terzi senza il vostro consenso, salvo 
                            obblighi legali.
                        </p>

                        <h3>8.3 Eccezioni</h3>
                        <p>
                            La riservatezza può essere interrotta solo nei seguenti casi:
                        </p>
                        <ul>
                            <li>Obbligo legale (es. segnalazione attività illecite)</li>
                            <li>Consenso esplicito del cliente</li>
                            <li>Necessità di difesa in procedimenti legali</li>
                        </ul>
                    </section>

                    {/* 9. Obblighi del Cliente */}
                    <section className="legal-section">
                        <h2>9. Obblighi del Cliente</h2>
                        <p>Utilizzando i nostri servizi, vi impegnate a:</p>
                        <ul>
                            <li><strong>Fornire informazioni accurate:</strong> Tutte le informazioni fornite devono essere veritiere e complete</li>
                            <li><strong>Rispettare le leggi:</strong> Non utilizzare i servizi per scopi illeciti</li>
                            <li><strong>Non abusare:</strong> Non interferire con il funzionamento del sito o dei servizi</li>
                            <li><strong>Rispettare i diritti:</strong> Non violare diritti di terzi (copyright, privacy, ecc.)</li>
                            <li><strong>Mantenere credenziali:</strong> Mantenere riservate le credenziali di accesso (se applicabile)</li>
                            <li><strong>Pagare le tariffe:</strong> Pagare tempestivamente le tariffe concordate</li>
                        </ul>
                    </section>

                    {/* 10. Terminazione */}
                    <section className="legal-section">
                        <h2>10. Terminazione</h2>
                        <h3>10.1 Terminazione da Parte del Cliente</h3>
                        <p>
                            Potete terminare il rapporto in qualsiasi momento inviando una comunicazione scritta. 
                            Le tariffe per i servizi già forniti rimangono dovute.
                        </p>

                        <h3>10.2 Terminazione da Parte Nostra</h3>
                        <p>
                            Ci riserviamo il diritto di terminare o sospendere i servizi in caso di:
                        </p>
                        <ul>
                            <li>Violazione dei presenti Termini e Condizioni</li>
                            <li>Mancato pagamento delle tariffe</li>
                            <li>Comportamento inappropriato o offensivo</li>
                            <li>Uso fraudolento dei servizi</li>
                        </ul>

                        <h3>10.3 Effetti della Terminazione</h3>
                        <p>
                            Alla terminazione:
                        </p>
                        <ul>
                            <li>I vostri dati saranno conservati secondo la Privacy Policy</li>
                            <li>L'accesso ai servizi sarà immediatamente sospeso</li>
                            <li>Gli obblighi di pagamento rimangono validi</li>
                        </ul>
                    </section>

                    {/* 11. Legge Applicabile */}
                    <section className="legal-section">
                        <h2>11. Legge Applicabile e Foro Competente</h2>
                        <h3>11.1 Legge Applicabile</h3>
                        <p>
                            I presenti Termini e Condizioni sono regolati e interpretati secondo il diritto svizzero, 
                            con esclusione delle norme di conflitto di leggi.
                        </p>

                        <h3>11.2 Foro Competente</h3>
                        <p>
                            Per qualsiasi controversia derivante dai presenti termini, il foro competente esclusivo 
                            è quello di Lucerna, Svizzera, salvo disposizioni imperative di legge.
                        </p>

                        <h3>11.3 Risoluzione Amichevole</h3>
                        <p>
                            Prima di ricorrere a vie legali, ci impegniamo a cercare una risoluzione amichevole 
                            delle controversie attraverso negoziazione o mediazione.
                        </p>
                    </section>

                    {/* 12. Disposizioni Generali */}
                    <section className="legal-section">
                        <h2>12. Disposizioni Generali</h2>
                        <h3>12.1 Intero Accordo</h3>
                        <p>
                            I presenti Termini e Condizioni, insieme alla Privacy Policy e alla Cookie Policy, 
                            costituiscono l'intero accordo tra voi e Swiss Consult Hub.
                        </p>

                        <h3>12.2 Separabilità</h3>
                        <p>
                            Se una disposizione di questi termini è ritenuta invalida o inapplicabile, le restanti 
                            disposizioni rimarranno in vigore.
                        </p>

                        <h3>12.3 Rinuncia</h3>
                        <p>
                            Il mancato esercizio di un diritto previsto da questi termini non costituisce rinuncia 
                            a tale diritto.
                        </p>

                        <h3>12.4 Cessione</h3>
                        <p>
                            Non potete cedere i vostri diritti o obblighi previsti da questi termini senza il 
                            nostro consenso scritto.
                        </p>
                    </section>

                    {/* 13. Contatti */}
                    <section className="legal-section">
                        <h2>13. Contatti</h2>
                        <p>Per domande sui presenti Termini e Condizioni:</p>
                        <div className="legal-contact-box">
                            <h4>Swiss Consult Hub</h4>
                            <p><strong>Indirizzo:</strong> Spinnereistrasse 5, 6220 Emmenbrücke, Lucerna, Svizzera</p>
                            <p><strong>Email:</strong> <a href="mailto:info@swissconsulthub.ch">info@swissconsulthub.ch</a></p>
                            <p><strong>Telefono:</strong> +41 412 420 442</p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="legal-footer-section">
                    <p>
                        Questi Termini e Condizioni sono conformi al Codice delle Obbligazioni svizzero 
                        e alle normative europee ove applicabili.
                    </p>
                    <p className="legal-back-link">
                        <a href="/#/">← Torna alla Home</a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default TermsConditionsPage;
