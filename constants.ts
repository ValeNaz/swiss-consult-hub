
import type { Service } from './types';

const ICONS = {
    assicurativa: new URL('./media/icone/icona_ConsulenzaAssicurativa.svg', import.meta.url).href,
    immobiliare: new URL('./media/icone/icona_IntermediazioneImmobiliare.svg', import.meta.url).href,
    lavorativa: new URL('./media/icone/icona_ConsulenzaLavorativa.svg', import.meta.url).href,
    legale: new URL('./media/icone/icona_ConsulenzaLegale.svg', import.meta.url).href,
    commerciale: new URL('./media/icone/icona_ConsulenzaCommerciale.svg', import.meta.url).href,
    medica: new URL('./media/icone/icona_ConsulenzaMedica.svg', import.meta.url).href,
    creditizia: new URL('./media/icone/icona_ConsulenzaCreditizia.svg', import.meta.url).href,
} as const;

export const NAV_LINKS = [
    { name: 'HOME', path: '/' },
    { name: 'SERVIZI', path: '/servizi' },
    { name: 'CHI SIAMO', path: '/chi-siamo' },
    { name: 'CONTATTI', path: '/contatti' },
];

export const SERVICES_DATA: Service[] = [
    {
        slug: 'consulenza-assicurativa',
        title: 'Consulenza Assicurativa',
        subtitle: 'Un futuro sereno e sicuro grazie a una gestione su misura',
        theme: 'assicurativa',
        icon: ICONS.assicurativa,
        description: 'Con Swiss Consult Hub, offriamo una consulenza assicurativa tramite il nostro partner colosso assicurativo progettata per garantire stabilità e sicurezza economica a privati e aziende.',
        details: {
            sectionTitle: 'I nostri servizi includono:',
            points: ['Tutto il ramo assicurativo, dalla assicurazione sanitaria e previdenziale per privati a tutte le assicurazioni per le aziende.'],
        },
        ctaPrimary: { text: 'Richiedi informazioni', link: '#/contatti' },
        ctaSecondary: { text: 'Tutti i servizi', link: '#/servizi' },
        targetAudience: ['privati', 'aziende'],
        idealFor: 'Privati e aziende che cercano protezione completa e continuativa',
    },
    {
        slug: 'intermediazione-immobiliare',
        title: 'Intermediazione e Gestione immobiliare',
        subtitle: 'Trova il tuo spazio ideale, in Svizzera e all&apos;estero',
        theme: 'immobiliare',
        icon: ICONS.immobiliare,
        description: 'Il nostro team di esperti vi accompagna passo dopo passo nella ricerca della soluzione abitativa o d&apos;investimento perfetta, sia in Svizzera che all&apos;estero.',
        details: {
            sectionTitle: 'Cosa offriamo:',
            points: [
                'Ricerca di immobili personalizzata: Che si tratti di una casa, un appartamento o una stanza, ci occupiamo di trovare le opzioni migliori per voi.',
                'Supporto per affitti e acquisti: Gestiamo tutte le fasi della transazione, dall&apos;individuazione del proprietà alla stipula del contratto.',
                'Investimenti immobiliari internazionali: Offriamo consulenze per investire in mercati strategici come Svizzera, Italia e altri Paesi ad alto rendimento.',
                'Gestione delle proprietà: Ci prendiamo cura e responsabilità delle vostre proprietà a 360° gradi, garantendovi il 100% dei servizi.'
            ],
        },
        ctaPrimary: { text: 'Richiedi informazioni', link: '#/contatti' },
        ctaSecondary: { text: 'Scopri il servizio', link: '#/servizi/intermediazione-immobiliare' },
        targetAudience: ['privati', 'pmi', 'aziende'],
        idealFor: 'Chi cerca immobili o vuole investire nel settore immobiliare',
    },
    {
        slug: 'consulenza-lavorativa-professionale',
        title: 'Consulenza Lavorativa e Professionale',
        subtitle: 'Dalla ricerca al colloquio: il lavoro che meriti è a un passo.',
        theme: 'lavorativa',
        icon: ICONS.lavorativa,
        description: 'La nostra consulenza lavorativa è pensata per chi desidera migliorare la propria posizione professionale o trovare nuove opportunità in Svizzera e all&apos;estero.\nCi concentriamo su ogni fase del processo di ricerca e candidatura per garantirvi risultati concreti.',
        details: {
            sectionTitle: 'Cosa facciamo per voi:',
            points: [
                'Identificazione delle migliori opportunità lavorative: Valutiamo il vostro profilo e individuiamo aziende e le posizioni più adatte alle vostre competenze.',
                'Creazione di CV professionali e lettere di presentazione: Vi aiutiamo a distinguervi nel mercato del lavoro Svizzero con documenti efficaci, chiari e personalizzati.',
                'Preparazione per colloqui: Offriamo sessioni di coaching per migliorare le vostre capacità comunicative e affrontare i colloqui con sicurezza.',
                'Il nostro obiettivo è accompagnarvi verso il successo, rendendo il mercato del lavoro accessibile e trasparente per voi.'
            ],
        },
        ctaPrimary: { text: 'Candidati', link: '#/contatti' },
        ctaSecondary: { text: 'Tutti i servizi', link: '#/servizi' },
        targetAudience: ['privati'],
        idealFor: 'Professionisti che cercano nuove opportunità di carriera in Svizzera',
    },
    {
        slug: 'consulenza-legale',
        title: 'Consulenza Legale',
        subtitle: 'Consulenza legale affidabile per situazioni complesse',
        theme: 'legale',
        icon: ICONS.legale,
        description: 'Affrontare questioni legali può essere complesso, ma con Swiss Consult Hub e i nostri partner esperti, potete contare su un supporto professionale su misura per ogni situazione.',
        details: {
            sectionTitle: 'I nostri servizi includono:',
            points: [
                'Consulenza su misura: Analizziamo la vostra situazione e vi proponiamo soluzioni legali personalizzate per tutelare i vostri diritti.',
                'Contrattualistica e risoluzione delle controversie: Vi supportiamo nella redazione e negoziazione di contratti, oltre a gestire eventuali dispute legali.',
                'Assistenza legale continuativa: Offriamo piani di tutela legale che garantiscono un accesso rapido e semplificato al nostro team di esperti.'
            ],
        },
        ctaPrimary: { text: 'Richiedi informazioni', link: '#/contatti' },
        targetAudience: ['privati', 'pmi', 'aziende'],
        idealFor: 'Situazioni legali complesse che richiedono supporto professionale',
    },
    {
        slug: 'consulenza-commerciale',
        title: 'Consulenza Commerciale',
        subtitle: 'Supporto completo per privati e imprese',
        theme: 'commerciale',
        icon: ICONS.commerciale,
        description: 'La nostra consulenza commerciale è progettata per chi desidera avviare una nuova attività o ottimizzare la gestione di una già esistente.\nOffriamo un&apos;assistenza completa per ogni fase del ciclo imprenditoriale.',
        details: {
            sectionTitle: 'Cosa offriamo:',
            points: [
                'Apertura di attività: Dalla pianificazione iniziale alla costituzione legale, vi guidiamo per avviare i vostri business senza intoppi.',
                'Fiscalità e gestione: Assistenza ai privati per dichiarazioni e verifiche dei guadagni, con gesti completi per le aziende.',
                'Consulenza strategica: Vi aiutiamo a migliorare la produttività e a identificare nuove opportunità di crescita.'
            ],
        },
        ctaPrimary: { text: 'Richiedi informazioni', link: '#/contatti' },
        targetAudience: ['privati', 'pmi', 'aziende'],
        idealFor: 'Imprenditori e aziende in fase di startup o crescita',
    },
    {
        slug: 'consulenza-medica',
        title: 'Consulenza Medica',
        subtitle: 'Accesso Privilegiato alla Sanità Svizzera d&apos;Eccellenza',
        theme: 'medica',
        icon: ICONS.medica,
        description: '',
        details: {
            sectionTitle: 'I nostri servizi includono:',
            points: [
                'Ricerca e Selezione di Specialisti: Ti assistiamo nell&apos;individuare i migliori medici di base, specialisti (es. dentisti, oculisti, fisioterapisti, ecc.) e cliniche private o ospedali, in base alle tue specifiche esigenze e alla tua località.',
                'Supporto Amministrativo: Ti guidiamo nella comprensione delle procedure sanitarie svizzere, nella gestione della documentazione e nella coordinazione con la tua cassa malati.'
            ],
        },
        ctaPrimary: { text: 'Richiedi informazioni', link: '#/contatti' },
        targetAudience: ['privati'],
        idealFor: 'Privati che necessitano di accesso a cure mediche specializzate',
    },
    {
        slug: 'consulenza-creditizia',
        title: 'Consulenza Creditizia',
        subtitle: 'Le soluzioni finanziarie giuste per voi',
        theme: 'creditizia',
        icon: ICONS.creditizia,
        description: 'Affrontare il mondo dei crediti e del leasing può essere complesso, ma con Swiss Consult Hub tutto diventa semplice e trasparente.',
        details: {
            sectionTitle: 'I nostri servizi:',
            points: [
                'Crediti personalizzati: Vi aiutiamo nella scelta di finanziamenti su misura, grazie alla nostra consulenza esperta.',
                'Leasing competitivo: Vi guidiamo nella scelta del miglior leasing per veicoli, con soluzioni adattate alle vostre esigenze.',
                'Consulenza personalizzata: Analizziamo le vostre esigenze e troviamo insieme a voi la soluzione migliore per raggiungere i vostri obiettivi, come l&apos;acquisto di un immobile all&apos;estero.'
            ],
        },
        ctaPrimary: { text: 'Richiedi adesso', link: '#/contatti' },
        ctaSecondary: { text: 'Tutti i servizi', link: '#/servizi' },
        targetAudience: ['privati', 'pmi'],
        idealFor: 'Chi cerca finanziamenti, leasing o soluzioni creditizie personalizzate',
    }
];

export const PROCESS_STEPS = [
    {
        number: 1,
        title: 'Scopri',
        description: 'Esplora i nostri servizi e identifica quello più adatto alle tue esigenze',
    },
    {
        number: 2,
        title: 'Contattaci',
        description: 'Richiedi una consulenza gratuita con i nostri esperti',
    },
    {
        number: 3,
        title: 'Ottieni risultati',
        description: 'Ricevi supporto dedicato fino al raggiungimento dei tuoi obiettivi',
    },
];

export const TARGET_AUDIENCE_LABELS = {
    privati: 'Privati',
    pmi: 'PMI',
    aziende: 'Aziende',
} as const;

export const TRUST_STATS = [
    {
        value: '500+',
        label: 'Clienti serviti',
    },
    {
        value: '7',
        label: 'Aree di consulenza',
    },
    {
        value: '4',
        label: 'Sedi in Svizzera',
    },
    {
        value: '15+',
        label: 'Partner certificati',
    },
];
