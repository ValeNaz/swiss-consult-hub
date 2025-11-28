# 🌍 Report Completo Audit Traduzioni - Pagine Servizi

**Data**: 10 Novembre 2025
**Lingue Supportate**: Italiano (it), Inglese (en), Francese (fr), Tedesco (de)
**Sistema i18n**: i18next + react-i18next

---

## 📋 SOMMARIO ESECUTIVO

### ✅ Stato Generale
- **Pagine Servizi**: Completamente tradotte ✅
- **Calcolatore Creditizio**: Completamente tradotto ✅
- **Form**: **7 su 8 NON tradotti** ❌

### 🔴 PROBLEMA CRITICO

**7 componenti form completamente hardcoded in italiano** e non utilizzano il sistema i18n, nonostante i file di traduzione `forms.json` siano già predisposti in tutte e 4 le lingue.

---

## 🎯 FORM ANALIZZATI

### ✅ Form TRADOTTO CORRETTAMENTE

#### 1. **ContactRequestForm**
- **Percorso**: [components/ContactRequestForm.tsx](components/ContactRequestForm.tsx)
- **Stato**: ✅ COMPLETAMENTE TRADOTTO
- **Namespace i18n**: `contact`
- **Note**: Usa correttamente `useTranslation('contact')` con tutte le chiavi tradotte

---

### ❌ FORM NON TRADOTTI (7)

#### 2. **InsuranceConsultingForm**
- **Percorso**: [components/InsuranceConsultingForm.tsx](components/InsuranceConsultingForm.tsx:1)
- **Stato**: ❌ NON TRADOTTO
- **Righe critiche**: 52, 66, 72, 82-86, 93, 103, 108, 119, 127, 138, 143, 154, 161, 170, 188, 192-194
- **Namespace necessario**: `forms` → `insurance`
- **Testi hardcoded**:
  - Titolo: "Richiesta di consulenza assicurativa"
  - Sottotitolo: "Compila il modulo per ricevere una consulenza personalizzata..."
  - Label campi: "Nome", "Cognome", "Email", "Numero di telefono", "Note"
  - Placeholder: "Mario", "Rossi", "mario.rossi@example.com", ecc.
  - Messaggio successo: "Richiesta inviata con successo! Ti contatteremo entro 24 ore..."
  - Messaggio errore: "Si è verificato un errore. Riprova più tardi."
  - Pulsante: "Richiedi consulenza assicurativa" / "Invio in corso..."
  - Privacy: "Inviando questo modulo, accetti il trattamento..."

#### 3. **RealEstateForm**
- **Percorso**: [components/RealEstateForm.tsx](components/RealEstateForm.tsx:1)
- **Stato**: ❌ NON TRADOTTO
- **Righe critiche**: 52, 66, 72, 82-86, 93, 103, 108, 119, 127, 138, 143, 154, 161, 170, 188, 192-194
- **Namespace necessario**: `forms` → `realEstate`
- **Testi hardcoded**:
  - Titolo: "Richiesta di contatto immobiliare"
  - Sottotitolo: "Compila il modulo per ricevere assistenza..."
  - Placeholder: "Descrivi l'immobile o le tue esigenze..."
  - Messaggio successo: "Richiesta inviata con successo! Ti contatteremo entro 24 ore per discutere le tue esigenze immobiliari."
  - Pulsante: "Richiedi contatto immobiliare"

#### 4. **JobConsultingForm**
- **Percorso**: [components/JobConsultingForm.tsx](components/JobConsultingForm.tsx:1)
- **Stato**: ❌ NON TRADOTTO
- **Righe critiche**: 88, 112, 118, 128-130, 139, 149, 155, 165, 173, 189, 207, 220, 223, 228, 240, 243, 250, 263, 266, 271, 283, 286, 293, 302, 320, 325-326
- **Namespace necessario**: `forms` → `job`
- **Testi hardcoded**:
  - Titolo: "Candidatura per consulenza lavorativa"
  - Sottotitolo: "Compila il modulo e carica i documenti richiesti..."
  - Label: "Curriculum Vitae", "Lettera di presentazione", "Carta d'identità", "Permesso di soggiorno"
  - Placeholder file: "Seleziona file PDF", "Seleziona file PDF (opzionale)", "Seleziona file PDF (se richiesto)"
  - Hint: "Formato accettato: solo PDF (max 10MB)"
  - Placeholder note: "Indica la posizione desiderata, disponibilità, competenze principali, esperienza..."
  - Messaggio successo: "Candidatura inviata con successo! Ti contatteremo entro 48 ore..."
  - Pulsante: "Invia candidatura per consulenza lavorativa"

#### 5. **MedicalConsultingForm**
- **Percorso**: [components/MedicalConsultingForm.tsx](components/MedicalConsultingForm.tsx:1)
- **Stato**: ❌ NON TRADOTTO
- **Righe critiche**: 63, 80, 86, 96-100, 107, 117, 123, 133, 141, 151, 157, 167, 175, 184, 192, 202-207, 212-213, 219, 229-232, 240, 250-260, 279, 283-285
- **Namespace necessario**: `forms` → `medical`
- **Testi hardcoded**:
  - Titolo: "Richiesta di consulenza medica"
  - Sottotitolo: "Compila il modulo per richiedere una consulenza medica..."
  - Placeholder: "Descrivi brevemente i sintomi o il motivo della visita..."
  - Label: "Ramo medico", "Tipo di assicurazione", "Compagnia assicurativa"
  - Opzioni select: "Ortopedia", "Odontoiatria", "Urologia", "Medicina Generale", "Base", "Complementare"
  - Compagnie: "CSS Assicurazione", "Swica", "Helsana", "Sanitas", "Concordia", "Visana", "Groupe Mutuel", "Assura", "Altra"
  - Messaggio successo: "Richiesta inviata con successo! Ti contatteremo entro 24 ore per fissare la tua visita medica."
  - Pulsante: "Richiedi consulenza medica"

#### 6. **LegalConsultingForm**
- **Percorso**: [components/LegalConsultingForm.tsx](components/LegalConsultingForm.tsx:1)
- **Stato**: ❌ NON TRADOTTO
- **Righe critiche**: 57, 72, 78, 88-92, 99, 109, 115, 125, 133, 143, 149, 159, 167, 177-180, 187, 196, 214, 218-220
- **Namespace necessario**: `forms` → `legal`
- **Testi hardcoded**:
  - Titolo: "Richiesta di consulenza legale"
  - Sottotitolo: "Compila il modulo per richiedere una consulenza legale..."
  - Label: "Tipologia di consulenza"
  - Opzioni: "Civile", "Penale"
  - Placeholder: "Descrivi brevemente il tuo caso o la situazione..."
  - Messaggio successo: "Richiesta inviata con successo! Un nostro consulente legale ti contatterà entro 24 ore."
  - Pulsante: "Richiedi consulenza legale"

#### 7. **TaxDeclarationForm**
- **Percorso**: [components/TaxDeclarationForm.tsx](components/TaxDeclarationForm.tsx:1)
- **Stato**: ❌ NON TRADOTTO (MOLTO COMPLESSO)
- **Righe critiche**: 120-554 (tutto il form!)
- **Namespace necessario**: `forms` → `tax`
- **Sezioni da tradurre**:
  - **Dati Anagrafici**: Nome, Cognome, Data di nascita, Luogo di nascita, Nazionalità
  - **Dati di Contatto**: Email, Telefono, Indirizzo, Città, CAP, Cantone (con 26 opzioni!)
  - **Dati Fiscali**: Numero AVS/Codice fiscale, Stato civile, Stato occupazionale, Reddito annuo lordo
  - **Documenti**: Carica documenti, hint, lista file
  - **Messaggi**: Successo, errore
  - **Stati civili**: Celibe/Nubile, Coniugato/a, Divorziato/a, Vedovo/a, Unione registrata
  - **Stati occupazionali**: Dipendente, Lavoratore autonomo, Disoccupato, Pensionato, Studente
  - **26 Cantoni svizzeri**: Ticino, Zurigo, Berna, Ginevra, Vaud, Vallese, Grigioni, ecc.

#### 8. **DocumentUploadForm**
- **Percorso**: [components/DocumentUploadForm.tsx](components/DocumentUploadForm.tsx:1)
- **Stato**: ❌ NON TRADOTTO
- **Righe critiche**: 80, 95, 101, 111-114, 122, 132, 140, 156, 174, 183, 191, 204-206, 210-211, 229, 233-235
- **Namespace necessario**: `forms` → `credit` (o `documentUpload`)
- **Testi hardcoded**:
  - Titolo: "Richiedi il tuo credito"
  - Sottotitolo: "Compila il modulo sottostante e allega un documento di identità valido..."
  - Label: "Nome e Cognome", "Email", "Telefono", "Messaggio aggiuntivo", "Documento di identità"
  - Placeholder: "Mario Rossi", "mario.rossi@example.com", "+41 78 123 45 67", "Descrivi le tue esigenze o eventuali domande..."
  - File: "Scegli file", "Nessun file selezionato"
  - Hint: "Formato accettato: solo PDF (max 10MB)"
  - Messaggio successo: "Richiesta inviata con successo! Ti contatteremo a breve."
  - Pulsante: "Invia richiesta"

---

## 📁 FILE DI LOCALIZZAZIONE

### Struttura Esistente

```
locales/
├── it/
│   ├── forms.json ✅ (493 righe)
│   ├── services.json ✅
│   ├── common.json ✅
│   └── ... (altri)
├── en/
│   ├── forms.json ✅ (493 righe)
│   └── ...
├── fr/
│   ├── forms.json ✅ (493 righe - parzialmente in francese)
│   └── ...
└── de/
    ├── forms.json ✅ (493 righe - parzialmente in tedesco)
    └── ...
```

### ✅ Traduzioni GIÀ PRESENTI in forms.json

I file `forms.json` contengono già molte traduzioni pronte per:
- `common`: campi base (firstName, lastName, email, phone, notes, placeholders, messaggi)
- `contact`: form contatto
- `insurance`: form assicurativo (BASE)
- `realEstate`: form immobiliare (BASE)
- `job`: form lavorativo (BASE)
- `legal`: form legale (BASE)
- `medical`: form medico (BASE)
- `credit`: form creditizio (BASE)
- `tax`: form fiscale (BASE)
- `loanRequest`: form prestito complesso (COMPLETO - 490+ righe!)
- `documentReminder`: documenti necessari

### ❌ Traduzioni MANCANTI o INCOMPLETE

1. **Insurance**: manca `success`, `submit`
2. **RealEstate**: manca `success`, `submit`
3. **Job**: mancano molti campi specifici (CV, cover letter, ID document, residence permit)
4. **Medical**: mancano medicalBranch options specifiche, insuranceType, insuranceCompany options
5. **Legal**: manca consultingType con options (civile/penale)
6. **Tax**: mancano tutte le sezioni specifiche, cantoni, stati civili/occupazionali dettagliati
7. **DocumentUpload**: namespace mancante completamente (potrebbe usare `credit`)

---

## 🛠️ COME RISOLVERE

### Strategia Raccomandata

Per ogni form NON tradotto, seguire questi **3 step**:

#### **STEP 1**: Aggiungere chiavi mancanti nei file di localizzazione

#### **STEP 2**: Importare useTranslation nel componente

```tsx
import { useTranslation } from 'react-i18next';

const MyForm: React.FC = () => {
    const { t } = useTranslation('forms');
    // ...
```

#### **STEP 3**: Sostituire ogni testo hardcoded con `t('chiave')`

---

## 📝 ESEMPIO COMPLETO: InsuranceConsultingForm

### ❌ PRIMA (hardcoded):

```tsx
const InsuranceConsultingForm: React.FC = () => {
    // ...

    return (
        <div className="contact-request-form">
            <div className="form-header">
                <h3>Richiesta di consulenza assicurativa</h3>
                <p>
                    Compila il modulo per ricevere una consulenza personalizzata sui nostri servizi assicurativi.
                    Ti contatteremo al più presto.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="commercial-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="firstName" className="form-label">
                            Nome <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="Mario"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="lastName" className="form-label">
                            Cognome <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Rossi"
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Invio in corso...' : 'Richiedi consulenza assicurativa'}
                    </Button>
                </div>

                <p className="form-privacy">
                    Inviando questo modulo, accetti il trattamento dei tuoi dati personali secondo la nostra{' '}
                    <a href="#/privacy">informativa sulla privacy</a>.
                </p>
            </form>
        </div>
    );
};
```

### ✅ DOPO (tradotto):

```tsx
import { useTranslation } from 'react-i18next';

const InsuranceConsultingForm: React.FC = () => {
    const { t } = useTranslation('forms');
    // ...

    return (
        <div className="contact-request-form">
            <div className="form-header">
                <h3>{t('insurance.title')}</h3>
                <p>
                    {t('insurance.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="commercial-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="firstName" className="form-label">
                            {t('common.firstName')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder={t('common.placeholders.firstName')}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="lastName" className="form-label">
                            {t('common.lastName')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder={t('common.placeholders.lastName')}
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? t('common.submitting') : t('common.submit')}
                    </Button>
                </div>

                <p className="form-privacy">
                    {t('common.privacyText')}{' '}
                    <a href="#/privacy">{t('common.privacyLink')}</a>.
                </p>
            </form>
        </div>
    );
};
```

### Chiavi necessarie in forms.json:

```json
{
  "common": {
    "firstName": "Nome",
    "lastName": "Cognome",
    "email": "Email",
    "phone": "Numero di telefono",
    "notes": "Note",
    "submit": "Invia richiesta",
    "submitting": "Invio in corso...",
    "successMessage": "Richiesta inviata con successo!...",
    "errorMessage": "Si è verificato un errore. Riprova più tardi.",
    "privacyText": "Inviando questo modulo, accetti il trattamento dei tuoi dati personali secondo la nostra",
    "privacyLink": "informativa sulla privacy",
    "placeholders": {
      "firstName": "Mario",
      "lastName": "Rossi",
      "email": "mario.rossi@example.com",
      "phone": "+41 78 123 45 67"
    }
  },
  "insurance": {
    "title": "Richiesta di consulenza assicurativa",
    "subtitle": "Compila il modulo per ricevere una consulenza personalizzata sui nostri servizi assicurativi. Ti contatteremo al più presto."
  }
}
```

---

## 🎯 CHIAVI AGGIUNTIVE NECESSARIE

### Per forms.json (tutte le lingue):

#### 1. **insurance** (aggiungere):
```json
"insurance": {
  "title": "...",
  "subtitle": "...",
  "success": "Richiesta inviata con successo! Ti contatteremo entro 24 ore per la tua consulenza assicurativa.",
  "submit": "Richiedi consulenza assicurativa",
  "placeholders": {
    "notes": "Descrivi le tue esigenze assicurative o specifica se hai già una polizza esistente..."
  }
}
```

#### 2. **realEstate** (aggiungere):
```json
"realEstate": {
  "title": "Richiesta di contatto immobiliare",
  "subtitle": "Compila il modulo per ricevere assistenza nella gestione o intermediazione immobiliare. I nostri consulenti ti ricontatteranno al più presto.",
  "success": "Richiesta inviata con successo! Ti contatteremo entro 24 ore per discutere le tue esigenze immobiliari.",
  "submit": "Richiedi contatto immobiliare",
  "placeholders": {
    "notes": "Descrivi l'immobile o le tue esigenze (es. vendita, acquisto, affitto, gestione)..."
  }
}
```

#### 3. **job** (aggiungere):
```json
"job": {
  "title": "Candidatura per consulenza lavorativa",
  "subtitle": "Compila il modulo e carica i documenti richiesti per ricevere supporto nella ricerca di lavoro e opportunità professionali in Svizzera.",
  "labels": {
    "cv": "Curriculum Vitae",
    "coverLetter": "Lettera di presentazione",
    "idDocument": "Carta d'identità",
    "residencePermit": "Permesso di soggiorno"
  },
  "fileUpload": {
    "selectFile": "Seleziona file PDF",
    "selectOptional": "Seleziona file PDF (opzionale)",
    "selectIfRequired": "Seleziona file PDF (se richiesto)",
    "noFile": "Nessun file selezionato",
    "hint": "Formato accettato: solo PDF (max 10MB)"
  },
  "placeholders": {
    "notes": "Indica la posizione desiderata, disponibilità, competenze principali, esperienza..."
  },
  "success": "Candidatura inviata con successo! Ti contatteremo entro 48 ore per valutare le opportunità lavorative.",
  "submit": "Invia candidatura"
}
```

#### 4. **medical** (aggiungere):
```json
"medical": {
  "title": "Richiesta di consulenza medica",
  "subtitle": "Compila il modulo per richiedere una consulenza medica. Seleziona il ramo medico di interesse e indica il tipo di assicurazione di cui disponi.",
  "labels": {
    "medicalBranch": "Ramo medico",
    "insuranceType": "Tipo di assicurazione",
    "insuranceCompany": "Compagnia assicurativa"
  },
  "medicalBranches": {
    "select": "Seleziona il ramo medico",
    "ortopedia": "Ortopedia",
    "odontoiatria": "Odontoiatria",
    "urologia": "Urologia",
    "medicinaGenerale": "Medicina Generale"
  },
  "insuranceTypes": {
    "select": "Seleziona il tipo di assicurazione",
    "base": "Base",
    "complementare": "Complementare"
  },
  "insuranceCompanies": {
    "select": "Seleziona la compagnia",
    "css": "CSS Assicurazione",
    "swica": "Swica",
    "helsana": "Helsana",
    "sanitas": "Sanitas",
    "concordia": "Concordia",
    "visana": "Visana",
    "groupeMutuel": "Groupe Mutuel",
    "assura": "Assura",
    "altra": "Altra"
  },
  "placeholders": {
    "notes": "Descrivi brevemente i sintomi o il motivo della visita..."
  },
  "insuranceSection": "Tipo di assicurazione",
  "success": "Richiesta inviata con successo! Ti contatteremo entro 24 ore per fissare la tua visita medica.",
  "submit": "Richiedi consulenza medica"
}
```

#### 5. **legal** (aggiungere):
```json
"legal": {
  "title": "Richiesta di consulenza legale",
  "subtitle": "Compila il modulo per richiedere una consulenza legale. I nostri avvocati esperti valuteranno il tuo caso e ti ricontatteranno al più presto.",
  "labels": {
    "consultingType": "Tipologia di consulenza"
  },
  "consultingTypes": {
    "select": "Seleziona la tipologia",
    "civile": "Civile",
    "penale": "Penale"
  },
  "placeholders": {
    "notes": "Descrivi brevemente il tuo caso o la situazione per cui necessiti consulenza legale..."
  },
  "success": "Richiesta inviata con successo! Un nostro consulente legale ti contatterà entro 24 ore.",
  "submit": "Richiedi consulenza legale"
}
```

#### 6. **tax** (aggiungere - MOLTO ESTESO):
```json
"tax": {
  "title": "Dichiarazione dei redditi",
  "subtitle": "Compila il modulo con tutti i tuoi dati anagrafici e fiscali, e allega i documenti necessari per la tua dichiarazione dei redditi. Il nostro team di esperti fiscali ti contatterà per gestire la pratica.",
  "sections": {
    "personal": "Dati Anagrafici",
    "contact": "Dati di Contatto",
    "fiscal": "Dati Fiscali",
    "documents": "Documenti"
  },
  "labels": {
    "firstName": "Nome",
    "lastName": "Cognome",
    "dateOfBirth": "Data di nascita",
    "placeOfBirth": "Luogo di nascita",
    "nationality": "Nazionalità",
    "email": "Email",
    "phone": "Telefono",
    "address": "Indirizzo",
    "postalCode": "Codice postale",
    "city": "Città",
    "canton": "Cantone",
    "taxId": "Numero AVS / Codice fiscale",
    "maritalStatus": "Stato civile",
    "employmentStatus": "Stato occupazionale",
    "annualIncome": "Reddito annuo lordo (CHF)",
    "documents": "Carica documenti"
  },
  "cantons": {
    "select": "Seleziona cantone",
    "TI": "Ticino",
    "ZH": "Zurigo",
    "BE": "Berna",
    "GE": "Ginevra",
    "VD": "Vaud",
    "VS": "Vallese",
    "GR": "Grigioni",
    "AG": "Argovia",
    "SG": "San Gallo",
    "LU": "Lucerna",
    "BS": "Basilea Città",
    "BL": "Basilea Campagna",
    "SO": "Soletta",
    "FR": "Friburgo",
    "NE": "Neuchâtel",
    "JU": "Giura",
    "SZ": "Svitto",
    "ZG": "Zugo",
    "SH": "Sciaffusa",
    "AR": "Appenzello Esterno",
    "AI": "Appenzello Interno",
    "TG": "Turgovia",
    "UR": "Uri",
    "OW": "Obvaldo",
    "NW": "Nidvaldo",
    "GL": "Glarona"
  },
  "maritalStatus": {
    "select": "Seleziona",
    "single": "Celibe/Nubile",
    "married": "Coniugato/a",
    "divorced": "Divorziato/a",
    "widowed": "Vedovo/a",
    "registeredPartnership": "Unione registrata"
  },
  "employmentStatus": {
    "select": "Seleziona",
    "employed": "Dipendente",
    "selfEmployed": "Lavoratore autonomo",
    "unemployed": "Disoccupato",
    "retired": "Pensionato",
    "student": "Studente"
  },
  "documents": {
    "description": "Allega tutti i documenti necessari per la dichiarazione dei redditi (certificati di salario, estratti conto, fatture deducibili, ecc.)",
    "uploadLabel": "Carica documenti",
    "chooseFile": "Scegli file",
    "filesSelected": "{{count}} file selezionati",
    "noFiles": "Nessun file selezionato",
    "hint": "Formato accettato: solo PDF (max 10MB per file). Puoi caricare più file contemporaneamente.",
    "removeFile": "Rimuovi file"
  },
  "placeholders": {
    "firstName": "Mario",
    "lastName": "Rossi",
    "placeOfBirth": "Lugano",
    "nationality": "Svizzera",
    "email": "mario.rossi@example.com",
    "phone": "+41 78 123 45 67",
    "address": "Via esempio 123",
    "postalCode": "6900",
    "city": "Lugano",
    "taxId": "756.xxxx.xxxx.xx",
    "annualIncome": "80000"
  },
  "success": "Dichiarazione inviata con successo! Ti contatteremo a breve per confermare la ricezione.",
  "submit": "Invia dichiarazione"
}
```

#### 7. **documentUpload** o **credit** (aggiungere):
```json
"documentUpload": {
  "title": "Richiedi il tuo credito",
  "subtitle": "Compila il modulo sottostante e allega un documento di identità valido. Il nostro team ti contatterà entro 24 ore per finalizzare la tua richiesta.",
  "labels": {
    "fullName": "Nome e Cognome",
    "email": "Email",
    "phone": "Telefono",
    "message": "Messaggio aggiuntivo",
    "identityDocument": "Documento di identità"
  },
  "fileUpload": {
    "chooseFile": "Scegli file",
    "noFile": "Nessun file selezionato",
    "hint": "Formato accettato: solo PDF (max 10MB)"
  },
  "placeholders": {
    "fullName": "Mario Rossi",
    "email": "mario.rossi@example.com",
    "phone": "+41 78 123 45 67",
    "message": "Descrivi le tue esigenze o eventuali domande..."
  },
  "success": "Richiesta inviata con successo! Ti contatteremo a breve.",
  "submit": "Invia richiesta"
}
```

---

## 🌐 TRADUZIONE LINGUE

### INGLESE (EN)

Per ogni sezione italiana sopra, tradurre in inglese. Esempio:

```json
"insurance": {
  "title": "Insurance Consultation Request",
  "subtitle": "Fill out the form to receive personalized consultation on our insurance services. We will contact you as soon as possible.",
  "success": "Request sent successfully! We will contact you within 24 hours for your insurance consultation.",
  "submit": "Request insurance consultation",
  "placeholders": {
    "notes": "Describe your insurance needs or specify if you already have an existing policy..."
  }
}
```

### FRANCESE (FR)

```json
"insurance": {
  "title": "Demande de conseil en assurance",
  "subtitle": "Remplissez le formulaire pour recevoir un conseil personnalisé sur nos services d'assurance. Nous vous contacterons dès que possible.",
  "success": "Demande envoyée avec succès ! Nous vous contacterons dans les 24 heures pour votre consultation en assurance.",
  "submit": "Demander un conseil en assurance",
  "placeholders": {
    "notes": "Décrivez vos besoins en assurance ou précisez si vous avez déjà une police existante..."
  }
}
```

### TEDESCO (DE)

```json
"insurance": {
  "title": "Anfrage für Versicherungsberatung",
  "subtitle": "Füllen Sie das Formular aus, um eine personalisierte Beratung zu unseren Versicherungsdienstleistungen zu erhalten. Wir werden uns so schnell wie möglich bei Ihnen melden.",
  "success": "Anfrage erfolgreich gesendet! Wir werden Sie innerhalb von 24 Stunden für Ihre Versicherungsberatung kontaktieren.",
  "submit": "Versicherungsberatung anfordern",
  "placeholders": {
    "notes": "Beschreiben Sie Ihre Versicherungsbedürfnisse oder geben Sie an, ob Sie bereits eine bestehende Police haben..."
  }
}
```

---

## 📊 PRIORITÀ DI INTERVENTO

### 🔴 ALTA PRIORITÀ (Form più semplici - iniziare da questi):
1. **InsuranceConsultingForm** - Semplice, pochi campi
2. **RealEstateForm** - Semplice, pochi campi
3. **LegalConsultingForm** - Semplice, pochi campi
4. **DocumentUploadForm** - Medio, file upload

### 🟡 MEDIA PRIORITÀ:
5. **MedicalConsultingForm** - Medio, dropdown con opzioni
6. **JobConsultingForm** - Medio, file upload multipli

### 🟠 BASSA PRIORITÀ (Form complesso):
7. **TaxDeclarationForm** - Complesso, molti campi, 26 cantoni, file multipli

---

## ✅ CHECKLIST PER OGNI FORM

Per ogni form da tradurre, seguire questa checklist:

- [ ] **Step 1**: Leggere il componente e identificare tutti i testi hardcoded
- [ ] **Step 2**: Creare/aggiornare le chiavi in `locales/it/forms.json`
- [ ] **Step 3**: Tradurre le chiavi in `locales/en/forms.json`
- [ ] **Step 4**: Tradurre le chiavi in `locales/fr/forms.json`
- [ ] **Step 5**: Tradurre le chiavi in `locales/de/forms.json`
- [ ] **Step 6**: Importare `useTranslation` nel componente
- [ ] **Step 7**: Sostituire tutti i testi hardcoded con `t('chiave')`
- [ ] **Step 8**: Testare il form in tutte e 4 le lingue
- [ ] **Step 9**: Verificare placeholder, label, messaggi errore/successo
- [ ] **Step 10**: Verificare che i pulsanti non mostrino nomi di funzioni

---

## 🚀 STRUMENTI RACCOMANDATI

### Script per Verifica Traduzioni

Creare uno script per verificare automaticamente:
```bash
# Cerca testi hardcoded in italiano
grep -r "Richiesta\|Compila\|Invia\|messaggio\|errore" components/*.tsx
```

### Test Manuale

1. Avviare l'app: `npm run dev`
2. Cambiare lingua dal selector
3. Navigare a ogni pagina servizio
4. Verificare che tutti i testi cambino lingua
5. Testare l'invio di ogni form
6. Verificare messaggi di successo/errore

---

## 📈 STIMA TEMPO

| Componente | Complessità | Tempo stimato |
|------------|-------------|---------------|
| InsuranceConsultingForm | Bassa | 30-45 min |
| RealEstateForm | Bassa | 30-45 min |
| LegalConsultingForm | Bassa | 30-45 min |
| DocumentUploadForm | Media | 45-60 min |
| MedicalConsultingForm | Media | 60-75 min |
| JobConsultingForm | Media | 60-90 min |
| TaxDeclarationForm | Alta | 2-3 ore |
| **TOTALE** | - | **6-8 ore** |

---

## 🎯 RISULTATO ATTESO

Al termine del lavoro, **tutti i 7 form** dovranno:

✅ Usare `useTranslation('forms')`
✅ Non contenere testi hardcoded
✅ Funzionare correttamente in IT, EN, FR, DE
✅ Mostrare pulsanti con testo leggibile (non nomi di funzioni)
✅ Avere messaggi di successo/errore tradotti
✅ Avere placeholder tradotti
✅ Avere label tradotte
✅ Avere opzioni select tradotte

---

## 📞 CONTATTO & SUPPORTO

Per domande o chiarimenti sulla traduzione:
- Verificare la documentazione i18next: https://www.i18next.com/
- Consultare ContactRequestForm.tsx come riferimento (unico form già tradotto correttamente)

---

**Fine Report** 🎉

Generato il: 10 Novembre 2025
