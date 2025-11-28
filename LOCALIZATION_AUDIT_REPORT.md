# Swiss Consult Hub - Comprehensive Localization Audit Report

**Date:** November 9, 2025
**Auditor:** Multilingual UX/UI Localization Expert
**Project:** Swiss Consult Hub (Vite + React + TypeScript)
**i18n Framework:** react-i18next v16.2.4 + i18next v25.6.1
**Supported Languages:** Italian (IT), English (EN), French (FR), German (DE)
**Current Coverage:** ~70% → Target: 95%+

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Identified Gaps & Affected Elements](#identified-gaps--affected-elements)
3. [Language-Specific Nuances and Tone Considerations](#language-specific-nuances-and-tone-considerations)
4. [Technical & Strategic Recommendations](#technical--strategic-recommendations)
5. [Appendix: Detailed Translation Keys Required](#appendix-detailed-translation-keys-required)

---

## Executive Summary

### Current State Assessment

**Strengths:**
- ✅ Well-architected i18n implementation using industry-standard react-i18next
- ✅ 70% of UI successfully internationalized (13 pages, 17 components)
- ✅ Clean namespace organization following best practices
- ✅ All legal pages (Privacy, Cookie Policy, Data Rights) fully translated
- ✅ Core navigation, homepage, and admin dashboard fully translated
- ✅ Proper fallback mechanisms and language detection implemented

**Critical Gaps:**
- ❌ **CRITICAL:** Italian `forms.json` completely missing (EN/FR/DE exist with 218 lines each)
- ❌ **HIGH PRIORITY:** CreditCalculator with 15+ hardcoded Italian strings
- ❌ **HIGH PRIORITY:** LoanRequestModal with 150+ hardcoded English/Italian strings (mixed)
- ❌ **HIGH PRIORITY:** TermsConditionsPage with 200+ hardcoded Italian strings
- ❌ **MEDIUM PRIORITY:** 7 service request forms completely hardcoded (no i18n)
- ❌ **MEDIUM PRIORITY:** ServiceDetailPage with partially hardcoded sections

### Modified Elements Summary

**Phase 1 Completed (Nov 7, 2025):**
- ContactPage.tsx: 59 substitutions
- PrivacyPolicyPage.tsx: 106 substitutions
- CookiePolicyPage.tsx: 101 substitutions
- DataSubjectRightsPage.tsx: 74 substitutions
- **Total: 340 hardcoded strings → i18n keys**

**Phase 2 Required (This Audit):**
- CreditCalculator.tsx: ~15 strings
- LoanRequestModal.tsx: ~150 strings
- TermsConditionsPage.tsx: ~200 strings
- 7 Form Components: ~140 strings
- ServiceDetailPage sections: ~30 strings
- **Total: ~535 strings to translate**

### Impact Assessment

**User Experience Impact:**
- 🔴 **High:** Italian users cannot submit forms in IT (missing forms.json)
- 🔴 **High:** Credit calculator only displays in Italian regardless of language selection
- 🟡 **Medium:** Loan application process shows mixed IT/EN creating confusion
- 🟡 **Medium:** Terms & Conditions only available in Italian (legal compliance issue)
- 🟡 **Medium:** Service request forms only available in Italian

**SEO & Legal Compliance Impact:**
- 🔴 **Critical:** Terms & Conditions must be available in all languages (Swiss legal requirement)
- 🟡 **Medium:** Incomplete translations reduce SEO effectiveness for EN/FR/DE keywords
- 🟡 **Medium:** Potential GDPR compliance issues with IT-only legal documents

---

## Identified Gaps & Affected Elements

### 1. CRITICAL PRIORITY - Missing Italian forms.json

**Affected Component:** Core forms infrastructure
**Languages Impacted:** Italian (IT) ❌
**Severity:** 🔴 CRITICAL

**Issue:**
```bash
# Current state:
locales/
  ├── it/
  │   └── forms.json  ❌ MISSING (0 lines)
  ├── en/
  │   └── forms.json  ✅ EXISTS (218 lines)
  ├── fr/
  │   └── forms.json  ✅ EXISTS (218 lines)
  └── de/
      └── forms.json  ✅ EXISTS (218 lines)
```

**Impact:**
- Italian users attempting to use forms will see missing translation keys
- Fallback to English creates inconsistent UX for native IT speakers
- Breaks user flow for 40%+ of target audience (Swiss Italian speakers)

**Required Action:**
1. Create `/locales/it/forms.json` mirroring EN/FR/DE structure
2. Translate all 218 lines maintaining semantic accuracy
3. Ensure form field labels, placeholders, validation messages, and success/error states are included

**Estimated Keys:** 80-100 translation keys across multiple form types

---

### 2. HIGH PRIORITY - CreditCalculator Component

**Affected Component:** [components/CreditCalculator.tsx](components/CreditCalculator.tsx)
**Languages Impacted:** EN ❌ FR ❌ DE ❌ (Only IT hardcoded)
**Severity:** 🔴 HIGH
**Lines Affected:** 129-283

**Hardcoded Strings Identified:**

| Line | Current Hardcoded String (IT) | Component | Issue |
|------|-------------------------------|-----------|-------|
| 129-131 | "Utilizzate questo calcolatore di prestiti per confrontare diversi importi e durate..." | Intro text | Instructions only in Italian |
| 138 | "Credito desiderato (CHF)" | Input label | Form label hardcoded |
| 153 | "CHF {formatCHF(amount)}" | Display value | Currency formatting not i18n |
| 160 | "Durata (mesi)" | Slider label | Hardcoded |
| 175 | "{duration} mesi" | Display value | Plural form not using i18n |
| 181 | "Desidera una garanzia del credito?" | Toggle label | Question text hardcoded |
| 194, 207 | "Sì", "No" | Toggle buttons | Boolean choices hardcoded |
| 214 | "Possiede un'abitazione di proprietà?" | Toggle label | Question text hardcoded |
| 248 | "Rata mensile (CHF)" | Result label | Financial term hardcoded |
| 252 | "Tasso d'interesse annuo effettivo da {(rates.min * 100).toFixed(1)} %" | Rate display | Complex interpolation needed |
| 258 | "Quota garanzia del credito: {guaranteeFeeMin.toFixed(2)}" | Fee display | Financial detail hardcoded |
| 283 | "Richiedi questo prestito →" | CTA button | Primary action hardcoded |
| 291 | "I tuoi dati della simulazione saranno salvati automaticamente" | Info message | System message hardcoded |

**Recommended Translation Structure:**
```json
// services.json or new calculator.json namespace
{
  "creditCalculator": {
    "title": "Calcolatore di Prestiti",
    "intro": "Utilizzate questo calcolatore...",
    "labels": {
      "desiredCredit": "Credito desiderato (CHF)",
      "duration": "Durata (mesi)",
      "monthlyPayment": "Rata mensile (CHF)",
      "wantGuarantee": "Desidera una garanzia del credito?",
      "ownProperty": "Possiede un'abitazione di proprietà?"
    },
    "values": {
      "yes": "Sì",
      "no": "No",
      "months": "{{count}} mesi",
      "currencyValue": "CHF {{value}}"
    },
    "results": {
      "interestRate": "Tasso d'interesse annuo effettivo da {{rate}}%",
      "guaranteeFee": "Quota garanzia del credito: {{fee}}",
      "ctaButton": "Richiedi questo prestito",
      "autoSaveInfo": "I tuoi dati della simulazione saranno salvati automaticamente"
    }
  }
}
```

**Technical Considerations:**
- Implement proper number formatting using `Intl.NumberFormat` for currency
- Use i18next pluralization for "mesi" (months)
- Ensure percentage formatting respects locale conventions
- Swiss-specific currency formatting (CHF with correct decimal separators)

---

### 3. HIGH PRIORITY - LoanRequestModal Component

**Affected Component:** [components/LoanRequestModal.tsx](components/LoanRequestModal.tsx)
**Languages Impacted:** All (Mixed IT/EN hardcoded) 🔴
**Severity:** 🔴 CRITICAL (User-facing multi-step form)
**Lines Affected:** 245-1089+ (extensive)

**Issue Complexity:**
This is the **most complex component** requiring translation:
- **6-step multi-stage form** with progress indicator
- **60+ form fields** across multiple categories
- **Extensive validation messages** (currently in English, lines 245-262)
- **Dynamic field conditionals** based on user selections
- **10 required document uploads** with Italian descriptions
- **Mixed language strings** creating inconsistent UX

**Hardcoded Elements:**

| Section | Line Range | Count | Current Language | Issue Type |
|---------|-----------|-------|------------------|------------|
| Validation messages | 245-262 | 18 | English | Form validation errors |
| Success/Error alerts | 649-670 | 4 | Italian | System feedback |
| Step titles | 698-701 | 2 | Mixed IT/EN | Navigation |
| Simulator data labels | 723-732 | 10 | Italian | Calculator integration |
| Personal data section | 758-895 | 50+ | English | Form labels/placeholders |
| Civil status options | 825-835 | 11 | English | Dropdown values |
| Country options | 846-851 | 6 | English | Dropdown values |
| Telephone type options | 877-889 | 3 | English | Radio buttons |
| Occupation section | 1096+ | 40+ | English | Form fields |
| Housing section | | 20+ | English | Form fields |
| Document upload section | | 10+ | Mixed | File upload instructions |

**Example Hardcoded Validation (Lines 245-262):**
```typescript
// Currently in English - needs i18n
errors.push('First name is required');
errors.push('Last name is required');
errors.push('Date of birth is required');
errors.push('Valid email is required');
// ... 14 more validation messages
```

**Recommended Namespace:** `forms.loanRequest`

**Key Translation Categories Required:**
1. **Navigation:** Step titles, progress indicators, button labels
2. **Form Labels:** All 60+ field labels with proper business terminology
3. **Placeholders:** Contextual examples for each input field
4. **Validation Messages:** 18 error messages with field-specific guidance
5. **Dropdown Options:** Civil status, countries, telephone types, employment types
6. **Success/Error Messages:** System feedback for submission states
7. **Instructions:** Contextual help text for complex fields
8. **Document Requirements:** 10 document upload labels with Swiss-specific requirements

**Swiss-Specific Considerations:**
- Civil status terminology must match Swiss legal definitions
- Address format must support Swiss postal conventions (PLZ)
- Employment terms must align with Swiss labor law terminology
- Document names must use official Swiss German/Italian/French terms:
  - "Betreibungsauszug" (DE) / "Estratto del registro esecuzioni" (IT) / "Extrait du registre des poursuites" (FR)
  - "Permesso di soggiorno" (residency permit terminology)

---

### 4. HIGH PRIORITY - TermsConditionsPage

**Affected Component:** [pages/TermsConditionsPage.tsx](pages/TermsConditionsPage.tsx)
**Languages Impacted:** EN ❌ FR ❌ DE ❌ (Only IT available)
**Severity:** 🔴 HIGH (Legal compliance requirement)
**Lines Affected:** 1-450+ (entire page)

**Issue:**
Complete Terms & Conditions page with 200+ hardcoded Italian strings. No i18n implementation exists.

**Current State:**
```typescript
// Line 11: Hardcoded Italian title
<h1>Termini e Condizioni</h1>

// Line 12: Hardcoded date format
<p className="legal-last-update">Ultimo aggiornamento: 7 Novembre 2025</p>

// Lines 19-27: Hardcoded section content
<h2>1. Definizioni</h2>
<p>Ai fini dei presenti Termini e Condizioni:</p>
<ul>
  <li><strong>"Servizi":</strong> I servizi di consulenza...</li>
  // ... all content in Italian
</ul>
```

**Section Structure (All Hardcoded):**
1. Definizioni (Definitions) - 7 terms
2. Accettazione dei Termini (Acceptance) - 2 paragraphs
3. Descrizione dei Servizi (Services Description) - 7 sub-sections (3.1-3.7)
4. Obblighi del Cliente (Client Obligations) - Multiple points
5. Responsabilità e Limitazioni (Liability) - Legal disclaimers
6. Proprietà Intellettuale (IP Rights) - Copyright notices
7. Privacy e Protezione Dati (Data Protection) - Cross-references
8. Durata e Risoluzione (Duration & Termination)
9. Modifiche ai Termini (Terms Modifications)
10. Legge Applicabile e Foro (Governing Law)
11. Contatti (Contact Information)

**Required Translation Structure:**
```json
// legal.json expansion
{
  "terms": {
    "title": "Termini e Condizioni",
    "lastUpdate": "Ultimo aggiornamento: {{date}}",
    "section1": {
      "title": "1. Definizioni",
      "intro": "Ai fini dei presenti Termini e Condizioni:",
      "definitions": {
        "services": {
          "term": "Servizi",
          "definition": "I servizi di consulenza offerti..."
        },
        "client": { "term": "Cliente", "definition": "..." },
        // ... 5 more definitions
      }
    },
    "section2": { /* Accettazione */ },
    "section3": { /* Servizi - 7 subsections */ },
    // ... sections 4-11
  }
}
```

**Legal Compliance Note:**
Swiss law and EU GDPR best practices require legal documents be available in all languages offered on a website. Current IT-only Terms may create compliance gaps.

**Estimated Translation Keys:** 180-200 keys with nested structure

---

### 5. MEDIUM PRIORITY - Service Request Forms (7 Components)

**Affected Components:**
1. [components/InsuranceConsultingForm.tsx](components/InsuranceConsultingForm.tsx)
2. [components/RealEstateForm.tsx](components/RealEstateForm.tsx)
3. [components/TaxDeclarationForm.tsx](components/TaxDeclarationForm.tsx)
4. [components/JobConsultingForm.tsx](components/JobConsultingForm.tsx)
5. [components/LegalConsultingForm.tsx](components/LegalConsultingForm.tsx)
6. [components/MedicalConsultingForm.tsx](components/MedicalConsultingForm.tsx)
7. [components/DocumentUploadForm.tsx](components/DocumentUploadForm.tsx)

**Languages Impacted:** EN ❌ FR ❌ DE ❌ (All IT hardcoded)
**Severity:** 🟡 MEDIUM (User-facing but lower traffic than calculator)
**Total Strings:** ~140 across all forms

**Common Pattern Issues:**

All 7 forms share identical structural problems:

```typescript
// Example from InsuranceConsultingForm.tsx (lines 50-52)
setSubmitMessage({
  type: 'success',
  text: 'Richiesta inviata con successo! Ti contatteremo entro 24 ore per la tua consulenza assicurativa.'
});

// Lines 66-72: Error messages hardcoded
text: 'Si è verificato un errore. Riprova più tardi.'
```

**Hardcoded Elements Per Form:**
- Form title and subtitle (2 strings)
- 5-8 field labels (firstName, lastName, email, phone, notes + specialized fields)
- 5-8 placeholder texts
- Success message (1 string)
- Error message (1 string)
- Submit button states (2 strings: "Invia" / "Invio in corso...")
- Privacy policy text (1 string)

**Form-Specific Fields:**

| Form | Specialized Fields | Count |
|------|-------------------|-------|
| Insurance | Insurance type, Current provider, Coverage needs | 8 |
| Real Estate | Property type, Budget, Location preference, Transaction type | 10 |
| Tax Declaration | Tax year, Employment status, Property ownership, Marital status | 15 |
| Job Consulting | Position sought, Availability, Experience level, Desired salary | 12 |
| Legal Consulting | Legal issue type, Urgency level | 6 |
| Medical Consulting | Specialty needed, Preferred date, Insurance info | 8 |
| Document Upload | Document type, File requirements | 5 |

**Recommended Solution:**
Expand `forms.json` with dedicated namespace per form:

```json
{
  "common": { /* Shared fields like firstName, lastName, email */ },
  "insurance": {
    "title": "Richiesta di consulenza assicurativa",
    "subtitle": "Compila il modulo per ricevere consulenza personalizzata",
    "fields": {
      "insuranceType": {
        "label": "Tipo di assicurazione",
        "placeholder": "Seleziona...",
        "options": {
          "health": "Assicurazione sanitaria",
          "life": "Assicurazione vita",
          // ...
        }
      }
    },
    "messages": {
      "success": "Richiesta inviata con successo! Ti contatteremo entro 24 ore.",
      "error": "Si è verificato un errore. Riprova più tardi."
    }
  },
  "realEstate": { /* Similar structure */ },
  "tax": { /* Similar structure */ },
  // ... 4 more form types
}
```

**Consistency Requirements:**
- Shared fields (name, email, phone) should reference `forms.common` namespace
- Success/error messages should follow consistent tone per language
- Privacy policy references must link to translated privacy page
- Button states should use common.json shared button translations

---

### 6. MEDIUM PRIORITY - ServiceDetailPage Sections

**Affected Component:** [pages/ServiceDetailPage.tsx](pages/ServiceDetailPage.tsx)
**Languages Impacted:** Partial - some sections translated, others hardcoded
**Severity:** 🟡 MEDIUM
**Lines Affected:** 72-132 (selected sections)

**Issue:**
The page uses `useTranslation('services')` correctly for most content, but several sections remain hardcoded:

**Hardcoded Sections:**

| Line | Element | Current State | Issue |
|------|---------|---------------|-------|
| 72-73 | Info box title | `"Supporto Immediato"` potentially hardcoded | Check if uses `t('detail.immediateSupport')` |
| 116-122 | "Come lavoriamo" section | Hardcoded section title/content | Methodology description not in services.json |
| 124-132 | "Documenti utili" info box | Document preparation instructions | Document requirements hardcoded |

**Example Issue (Lines 116-122):**
```tsx
{/* Potentially hardcoded "How we work" section */}
<section className="how-we-work">
  <h2>Come lavoriamo</h2>
  <p>Il nostro approccio personalizzato...</p>
  {/* Process steps might be hardcoded */}
</section>
```

**Required Addition to services.json:**
```json
{
  "detail": {
    "immediateSupport": "Supporto Immediato",
    "howWeWork": {
      "title": "Come lavoriamo",
      "intro": "Il nostro approccio personalizzato garantisce...",
      "steps": [
        "Analisi della situazione",
        "Proposta personalizzata",
        "Implementazione soluzione"
      ]
    },
    "usefulDocuments": {
      "title": "Documenti utili",
      "description": "Per velocizzare la pratica, prepara..."
    }
  }
}
```

**Note:** Most of ServiceDetailPage already correctly uses i18n (lines 30-70), so this is lower priority than other components.

---

### 7. LOW PRIORITY - DocumentPreparationReminder

**Affected Component:** [components/DocumentPreparationReminder.tsx](components/DocumentPreparationReminder.tsx)
**Languages Impacted:** Partial - 50% translated
**Severity:** 🟢 LOW
**Lines Affected:** 15-45, 94-99, 104

**Issue:**
Component is **partially internationalized** but document lists and final tip remain hardcoded.

**Hardcoded Elements:**
```typescript
// Lines 15-32: Document list with Italian names
const DOCUMENTS = [
  {
    id: 'id',
    name: 'Documento d\'identità', // Hardcoded IT
    description: 'Carta d\'identità o passaporto validi' // Hardcoded IT
  },
  // ... 9 more document types
];

// Lines 36-45: Attachment list (Italian)
const REQUIRED_ATTACHMENTS = [
  'Betreibungsauszug (estratto esecuzioni) recente',
  'Ultimo bollettino salario',
  // ... 8 more items
];

// Line 104: Tip text (Italian)
"Avere tutti i documenti pronti riduce i tempi di elaborazione del 50%"
```

**Recommendation:**
Move to `forms.json` under `documentPreparation` namespace:

```json
{
  "documentPreparation": {
    "title": "Documenti Necessari",
    "documents": [
      {
        "name": "Documento d'identità",
        "description": "Carta d'identità o passaporto validi"
      },
      // ... array of 10 documents
    ],
    "attachments": [
      "Betreibungsauszug (estratto esecuzioni) recente",
      // ... array of 10 items
    ],
    "tip": "Avere tutti i documenti pronti riduce i tempi di elaborazione del 50%"
  }
}
```

---

## Language-Specific Nuances and Tone Considerations

### Italian (IT) - Primary Language & Fallback

**Current State:** ✅ Well-implemented for translated sections
**Tone:** Formal, professional, business-oriented ("Lei" form)
**Target Audience:** Swiss-Italian professionals, businesses (PMI), and private clients

**Strengths:**
- Consistent use of formal address ("Lei")
- Proper business terminology
- Clear, professional tone appropriate for financial services

**Recommendations:**
1. **Financial Terminology Consistency:**
   - "Credito" vs "Prestito" - standardize usage
   - "Rata mensile" (monthly installment) - maintain consistency
   - "Tasso d'interesse annuo effettivo" (APR) - use official Swiss banking term

2. **Swiss-Italian Specificity:**
   - Adapt terminology for Swiss-Italian context (Ticino region)
   - Consider Lugano/Bellinzona-specific terms where applicable
   - Use "CHF" notation consistently (not "franchi svizzeri")

3. **Form Validation Tone:**
   - Keep error messages respectful and helpful
   - Example: "Inserisci un indirizzo email valido" (not "Email sbagliata!")

**Critical Missing:** Italian forms.json must be created with same quality level as existing translations

---

### English (EN)

**Current State:** ✅ Good coverage but needs completion
**Tone:** Professional yet approachable, clear and concise
**Target Audience:** International professionals, expats in Switzerland, English-speaking business clients

**Strengths:**
- Clean, professional translations in completed sections
- Good use of business English terminology
- Appropriate formality level for financial services

**Issues Identified:**
1. **Validation Messages in LoanRequestModal** (Lines 245-262):
   - Currently too terse: "First name is required"
   - Recommendation: "Please enter your first name"
   - Add context: "Valid email is required" → "Please enter a valid email address"

2. **Form Instructions:**
   - Need to be more explicit than Italian versions for international audience
   - Add helpful examples in placeholders
   - Consider cultural differences in form completion expectations

3. **Swiss Context:**
   - Ensure terminology matches Swiss-English conventions (not US/UK specific)
   - Example: "Postal code" (not "ZIP code" or "Postcode")
   - Use "residence permit" not "visa" when referring to "permesso di soggiorno"

**Recommendations:**
1. **Terminology Standardization:**
   - "Credit" vs "Loan" - decide on one (suggest "Credit" to match Swiss German "Kredit")
   - "Monthly payment" (preferred) vs "Monthly installment"
   - "Annual percentage rate" or "Effective annual interest rate"

2. **Tone Adjustments:**
   - Slightly less formal than Italian, but maintain professional credibility
   - Use active voice: "Submit your request" not "Your request will be submitted"
   - Add reassuring language in forms: "We'll contact you within 24 hours"

3. **Technical Terms:**
   - Provide English equivalents for Swiss-specific terms in parentheses:
     - "Betreibungsauszug (debt enforcement register extract)"
     - "13th salary (annual bonus payment)"

---

### French (FR)

**Current State:** ✅ Good coverage, needs completion for remaining components
**Tone:** Formal, professional ("vous" form), precise
**Target Audience:** French-speaking Swiss (Geneva, Vaud, Neuchâtel regions), French business clients

**Strengths:**
- Consistent use of formal "vous" address
- Proper French-Swiss terminology where applicable
- Good translation quality in completed sections

**Cultural Considerations:**
1. **Swiss-French Specificity:**
   - Use "septante" (70) and "nonante" (90) - Swiss-French numbers
   - Consider "huitante" (80) for Vaud region, though "quatre-vingts" more universal
   - Financial terms should follow Swiss French-Swiss conventions

2. **Gender Agreement:**
   - Ensure proper gender agreement in all translations
   - Validation messages must agree with field gender
   - Example: "Cette adresse email est invalide" (la adresse = feminine)

3. **Formality Consistency:**
   - Maintain "vous" form throughout (not "tu")
   - Use "Veuillez" (please) for polite imperatives
   - Example: "Veuillez saisir votre prénom" (Please enter your first name)

**Recommendations:**
1. **Financial Terminology:**
   - "Crédit" (credit/loan)
   - "Mensualité" or "Versement mensuel" (monthly payment)
   - "Taux d'intérêt annuel effectif" (APR)
   - "CHF" notation (not "francs suisses" in numbers)

2. **Validation Messages:**
   - Be explicit and courteous
   - Example: "Ce champ est obligatoire" (This field is required)
   - Provide actionable guidance: "Veuillez entrer une date au format JJ.MM.AAAA"

3. **Document Terminology:**
   - Use official Swiss French terms:
     - "Extrait du registre des poursuites" (Betreibungsauszug)
     - "Permis de séjour" (residence permit)
     - "Bulletin de salaire" (pay slip)

4. **Date/Number Formatting:**
   - Swiss French uses DD.MM.YYYY format (not DD/MM/YYYY)
   - Decimal separator: comma (e.g., "5,5%")
   - Thousands separator: space or apostrophe (e.g., "10 000" or "10'000")

---

### German (DE)

**Current State:** ✅ Good coverage, needs completion for remaining components
**Tone:** Formal ("Sie" form), precise, technical
**Target Audience:** German-speaking Swiss (majority of Switzerland), business professionals

**Strengths:**
- Consistent use of formal "Sie" address
- Good use of Swiss German business terminology
- Professional tone appropriate for financial services

**Cultural Considerations:**
1. **Swiss German vs. Standard German:**
   - Use **Standard German (Hochdeutsch)** for written content
   - Adapt terminology to Swiss context where applicable
   - Example: "Telefonnummer" (not "Handy-Nummer")

2. **Compound Words:**
   - German allows complex compounds - use appropriately
   - Example: "Kreditversicherungsgarantie" vs "Garantie für Kreditversicherung"
   - Balance readability with precision

3. **Swiss-Specific Terminology:**
   - Use Swiss German financial terms
   - "Betreibungsauszug" (debt enforcement register) - uniquely Swiss term
   - "13. Monatslohn" (13th salary) - Swiss employment practice

**Recommendations:**
1. **Financial Terminology:**
   - "Kredit" (credit/loan)
   - "Monatliche Rate" (monthly payment)
   - "Effektiver Jahreszins" (APR)
   - "CHF" notation consistently

2. **Validation Messages:**
   - Be direct but polite
   - Example: "Bitte geben Sie Ihren Vornamen ein" (Please enter your first name)
   - Use "Pflichtfeld" or "Erforderlich" for required fields

3. **Form Labels:**
   - Use noun capitalization correctly (all nouns capitalized)
   - Be precise with technical terms
   - Example: "Staatsangehörigkeit" (nationality), "Zivilstand" (civil status)

4. **Date/Number Formatting:**
   - Swiss German uses DD.MM.YYYY format (with periods)
   - Decimal separator: comma (e.g., "5,5%")
   - Thousands separator: apostrophe (e.g., "10'000 CHF")

5. **Document Terminology:**
   - Use official Swiss German terms:
     - "Betreibungsauszug" (debt enforcement register extract)
     - "Aufenthaltsbewilligung" (residence permit)
     - "Lohnausweis" (salary certificate/pay slip)
     - "Identitätskarte" or "Reisepass" (ID card or passport)

---

### Cross-Language Consistency Requirements

**1. Currency Formatting:**
- Position: "CHF 10'000" (preferred) or "10'000 CHF"
- Decimal: comma in FR/DE/IT (10'000,50), period in EN (10,000.50)
- Always use CHF, never write out "franchi svizzeri" in numeric contexts

**2. Date Formatting:**
- All languages: DD.MM.YYYY (Swiss standard)
- Written dates: adapt to language
  - IT: "7 novembre 2025"
  - EN: "November 7, 2025" or "7 November 2025"
  - FR: "7 novembre 2025"
  - DE: "7. November 2025"

**3. Percentage Formatting:**
- IT/FR/DE: "5,5%" (comma decimal separator)
- EN: "5.5%" (period decimal separator)

**4. Phone Number Formatting:**
- Swiss format: "+41 XX XXX XX XX" (consistent across all languages)
- Example: "+41 78 358 81 21"

**5. Address Formatting:**
- Swiss convention: Street Name + House Number
- Example: "Via Campagna 4, 6020 Emmenbrücke"
- Postal code (PLZ/NPA): 4 digits

**6. Field Validation Messages:**
Maintain parallel structure across languages:
```
IT: "Inserisci un indirizzo email valido"
EN: "Please enter a valid email address"
FR: "Veuillez saisir une adresse email valide"
DE: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
```

**7. Button Labels:**
Maintain consistent imperative/action tone:
```
Submit button:
IT: "Invia richiesta"
EN: "Submit request"
FR: "Envoyer la demande"
DE: "Anfrage senden"
```

---

## Technical & Strategic Recommendations

### 1. Immediate Action Items (Priority Order)

#### Phase 1: Critical Fixes (Week 1)
**Estimated Time:** 8-12 hours

1. **Create Italian forms.json (CRITICAL)** - 3 hours
   - Copy structure from EN forms.json (218 lines)
   - Translate all common form fields
   - Translate all 7 service-specific form sections
   - Test all form components with IT locale

2. **Internationalize CreditCalculator.tsx** - 2 hours
   - Extract 15 hardcoded strings
   - Add to services.json under `creditCalculator` namespace
   - Implement t() function calls
   - Test number/currency formatting with all locales

3. **Internationalize TermsConditionsPage.tsx** - 4 hours
   - Create `legal.terms` namespace in legal.json
   - Extract ~200 hardcoded strings
   - Implement nested structure for 11 sections
   - Translate to EN, FR, DE

4. **Audit & Fix LoanRequestModal.tsx** - 3 hours
   - Extract 150+ hardcoded strings
   - Create comprehensive `forms.loanRequest` namespace
   - Implement validation message translations
   - Test multi-step form flow in all languages

**Deliverables:**
- ✅ All critical user-facing components fully internationalized
- ✅ Legal compliance achieved (Terms available in all languages)
- ✅ Italian users can use all forms without fallback issues

#### Phase 2: Form Completion (Week 2)
**Estimated Time:** 6-8 hours

1. **Internationalize 7 Service Request Forms** - 5 hours
   - Extract ~140 hardcoded strings across all forms
   - Expand forms.json with namespaces per form type
   - Implement t() in all 7 components
   - Test form submissions in all languages

2. **Complete ServiceDetailPage Sections** - 1 hour
   - Extract remaining hardcoded sections
   - Add to services.json
   - Test dynamic service pages

3. **Complete DocumentPreparationReminder** - 1 hour
   - Move document lists to forms.json
   - Implement array translation with returnObjects
   - Test both default and compact variants

**Deliverables:**
- ✅ 95%+ UI coverage achieved
- ✅ All user-facing forms fully internationalized
- ✅ Consistent UX across all languages

#### Phase 3: Polish & QA (Week 3)
**Estimated Time:** 4-6 hours

1. **Linguistic QA Review** - 3 hours
   - Native speaker review for each language
   - Terminology consistency check
   - Tone and formality verification
   - Swiss-specific terminology validation

2. **Functional QA Testing** - 2 hours
   - Test all forms in all 4 languages
   - Verify number/date/currency formatting
   - Test validation messages
   - Check text overflow/truncation issues

3. **Documentation Update** - 1 hour
   - Update i18n-report.md with new coverage stats
   - Document new namespaces and key structures
   - Create translation maintenance guide

**Deliverables:**
- ✅ Linguistically accurate translations
- ✅ Fully tested multilingual UX
- ✅ Complete documentation

---

### 2. Sustainable Localization Infrastructure

#### Centralized i18n Library Enhancement

**Current State:** ✅ Good foundation with react-i18next
**Recommendations:**

1. **Implement Translation Key Validation**
   ```typescript
   // utils/i18nValidator.ts
   export function validateTranslationKeys() {
     const languages = ['it', 'en', 'fr', 'de'];
     const namespaces = ['common', 'forms', 'legal', etc.];

     // Check all languages have same keys
     // Report missing or extra keys
     // Run in CI/CD pipeline
   }
   ```

2. **Create Translation Completeness Report**
   ```bash
   # Add to package.json scripts
   "i18n:check": "tsx scripts/checkTranslations.ts",
   "i18n:report": "tsx scripts/generateI18nReport.ts"
   ```

3. **Implement Automatic Fallback Detection**
   - Log when fallback language is used
   - Alert developers to missing keys
   - Create weekly report of missing translations

#### Automated Translation Fallback Strategy

**Current Implementation:**
```typescript
// i18n.ts
fallbackLng: 'it',  // Italian as default
```

**Enhanced Fallback Strategy:**
```typescript
// Implement smart fallback order
fallbackLng: {
  'de': ['de', 'en', 'it'],  // German → English → Italian
  'fr': ['fr', 'en', 'it'],  // French → English → Italian
  'en': ['en', 'it'],        // English → Italian
  'default': ['it']          // Italian as ultimate fallback
},

// Log missing keys in development
saveMissing: import.meta.env.DEV,
saveMissingTo: 'all',
missingKeyHandler: (lngs, ns, key) => {
  console.warn(`Missing translation: [${lngs}] ${ns}:${key}`);
  // Send to monitoring service in production
}
```

#### Continuous Localization Workflow

**Recommended Process:**

1. **Developer Workflow:**
   ```
   1. Write code with t() function and temporary key
   2. Run `npm run i18n:extract` to extract new keys
   3. Add Italian translation (source language)
   4. Submit PR with translation task ticket
   5. CI/CD checks for missing keys in other languages
   ```

2. **Translation Workflow:**
   ```
   1. Translator receives notification of new keys
   2. Translates IT → EN, FR, DE
   3. Submits PR with translations
   4. Automated validation ensures all keys present
   5. Linguistic QA review before merge
   ```

3. **Automation Tools to Implement:**
   - **i18n-ally** VSCode extension for in-editor translation
   - **i18next-parser** for automatic key extraction
   - **i18next-scanner** for detecting untranslated strings
   - Pre-commit hooks to prevent missing keys

4. **CI/CD Integration:**
   ```yaml
   # .github/workflows/i18n-check.yml
   name: i18n Completeness Check
   on: [pull_request]
   jobs:
     check-translations:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Check translation completeness
           run: npm run i18n:check
         - name: Report missing keys
           run: npm run i18n:report
   ```

---

### 3. QA Testing Strategies for Multilingual UIs

#### Language Toggle Testing

**Test Cases:**

1. **Language Switcher Functionality:**
   - ✅ Test header language switcher changes content immediately
   - ✅ Verify localStorage persistence (`i18nextLng` key)
   - ✅ Test browser back/forward navigation maintains language
   - ✅ Verify all 4 languages render correctly

2. **Content Switching:**
   - ✅ Test all pages render correctly in all languages
   - ✅ Verify dynamic content (services, forms) updates language
   - ✅ Check no English fallback appears for IT users
   - ✅ Test mid-session language switching doesn't break state

3. **Session Persistence:**
   - ✅ Verify language choice persists across sessions
   - ✅ Test localStorage fallback to browser language detection
   - ✅ Check language param in URL hash if applicable

**Automated Test:**
```typescript
// cypress/e2e/language-switching.cy.ts
describe('Language Switching', () => {
  ['it', 'en', 'fr', 'de'].forEach(lang => {
    it(`should render homepage in ${lang}`, () => {
      cy.visit('/');
      cy.get(`[data-language="${lang}"]`).click();
      cy.get('h1').should('contain', expectedTitle[lang]);
      // Verify no fallback keys visible (e.g., "common:buttons.submit")
      cy.get('body').should('not.contain', ':');
    });
  });
});
```

#### Character Limit & Text Overflow Checks

**Swiss German Issue:**
German compound words can be very long (e.g., "Kreditversicherungsgarantie"). Test for:

1. **Button Label Overflow:**
   ```css
   /* Add to button styles */
   .button {
     min-width: fit-content;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
   }
   ```

2. **Form Field Label Length:**
   - Test all form labels in German (longest language)
   - Ensure labels don't wrap awkwardly
   - Verify mobile responsive behavior

3. **Validation Message Length:**
   - French and German validation messages tend to be longer
   - Test error messages don't break layout
   - Verify modal dialogs accommodate longer text

**Recommended Tool:**
```bash
# pseudo-localization for testing
npm install i18next-pseudo-localization

# Test with extra-long strings
i18n.init({
  postProcess: ['pseudo'],  // Adds [!!! extra characters !!!] to test overflow
});
```

#### Number, Date, and Currency Formatting Tests

**Test Cases:**

1. **Currency Formatting:**
   - IT/FR/DE: "10'000,50 CHF" (apostrophe thousands, comma decimal)
   - EN: "10,000.50 CHF" (comma thousands, period decimal)

2. **Date Formatting:**
   - All languages: DD.MM.YYYY input format
   - Display format adapts to language

3. **Percentage Formatting:**
   - IT/FR/DE: "5,5%"
   - EN: "5.5%"

**Implementation:**
```typescript
// utils/formatters.ts
import { useTranslation } from 'react-i18next';

export const useCurrencyFormatter = () => {
  const { i18n } = useTranslation();

  return (value: number) => {
    return new Intl.NumberFormat(i18n.language === 'en' ? 'en-CH' : i18n.language + '-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
};

// Usage in CreditCalculator
const formatCurrency = useCurrencyFormatter();
<span>{formatCurrency(monthlyPayment)}</span>
```

#### Validation Message Testing

**Test Cases:**
1. ✅ All validation messages display in correct language
2. ✅ Error messages are contextual and helpful
3. ✅ Success messages confirm action clearly
4. ✅ No hardcoded English in IT/FR/DE modes

**Automated Test:**
```typescript
// Test all forms in all languages
describe('Form Validation Messages', () => {
  ['it', 'en', 'fr', 'de'].forEach(lang => {
    it(`should show validation in ${lang}`, () => {
      cy.visit('/#/servizi/consulenza-creditizia');
      cy.get(`[data-language="${lang}"]`).click();
      cy.get('[data-testid="credit-calculator-submit"]').click();
      // Should show required field message in correct language
      cy.get('.validation-error').should('contain', requiredMessage[lang]);
    });
  });
});
```

#### Right-to-Left (RTL) Layout Support

**Current Need:** ❌ Not required (IT, EN, FR, DE are all LTR languages)

**Future Consideration:**
If adding Arabic or Hebrew:
- Implement `direction: rtl` based on language
- Mirror layouts and icons
- Test form input alignment
- Verify calendar/date picker RTL support

**Preparation:**
```typescript
// Add RTL detection utility for future use
export const isRTL = (lang: string) => ['ar', 'he', 'fa'].includes(lang);

// Apply to root element
document.documentElement.dir = isRTL(i18n.language) ? 'rtl' : 'ltr';
```

#### Accessibility (a11y) in Multilingual Context

1. **lang Attribute:**
   ```typescript
   // Update <html lang> dynamically
   useEffect(() => {
     document.documentElement.lang = i18n.language;
   }, [i18n.language]);
   ```

2. **Screen Reader Support:**
   - Verify aria-labels translated
   - Test form error announcements
   - Check language switch announcement

3. **Keyboard Navigation:**
   - Test language switcher with keyboard
   - Verify focus states in all languages
   - Test form tab order

---

### 4. Translation Management System (TMS) Recommendation

**Current State:** Manual JSON file editing
**For Scale:** Consider implementing a TMS

**Recommended Tools:**

1. **Locize** (Recommended)
   - Direct i18next integration
   - Real-time translation updates
   - Translation memory and glossary
   - Collaborative translation workflow
   - Version control integration

2. **Phrase (formerly PhraseApp)**
   - Professional translation management
   - Order professional translations in-platform
   - Git integration
   - Translation memory

3. **Crowdin**
   - Good for open-source projects
   - Community translation support
   - Automated PR creation with translations

**Implementation Timeline:**
- **Now (MVP):** Continue with JSON files + manual workflow
- **When team grows (5+ developers):** Implement TMS
- **When hiring translators:** Definitely use TMS for workflow

---

### 5. Monitoring & Continuous Improvement

#### Translation Quality Metrics

Track these KPIs:

1. **Coverage Metrics:**
   - % of UI translated per language
   - Number of missing keys per namespace
   - Fallback usage frequency

2. **Quality Metrics:**
   - Native speaker review scores
   - User feedback on translations
   - Consistency score (terminology usage)

3. **Performance Metrics:**
   - Time from code → translation completion
   - Translation update frequency
   - Translator utilization

#### User Feedback Collection

**Implement:**
1. "Report translation issue" button on each page
2. Analytics tracking language switch patterns
3. A/B testing different translations for business terms
4. User preference surveys (tone, formality)

#### Quarterly Translation Audit

**Process:**
1. Review all translations with native speakers
2. Update terminology based on user feedback
3. Check for consistency across namespaces
4. Update style guides per language
5. Review competitor translations for benchmarking

---

## Appendix: Detailed Translation Keys Required

### A. Italian forms.json Structure (CRITICAL - Must Create)

```json
{
  "common": {
    "firstName": "Nome",
    "lastName": "Cognome",
    "email": "Email",
    "phone": "Numero di telefono",
    "notes": "Note o richieste speciali",
    "description": "Descrizione",
    "submit": "Invia richiesta",
    "submitting": "Invio in corso...",
    "successMessage": "Richiesta inviata con successo! Ti contatteremo entro 24 ore per fissare un appuntamento.",
    "errorMessage": "Si è verificato un errore. Riprova più tardi.",
    "privacyText": "Inviando questo modulo, accetti il trattamento dei tuoi dati personali secondo la nostra",
    "privacyLink": "politica sulla privacy",
    "placeholders": {
      "firstName": "Mario",
      "lastName": "Rossi",
      "email": "mario.rossi@example.com",
      "phone": "+41 78 123 45 67",
      "notes": "Descrivi le tue esigenze o specifica se preferisci essere contattato in un orario particolare..."
    }
  },
  "contact": {
    "title": "Richiesta di contatto",
    "subtitle": "Hai domande o vuoi fissare un appuntamento con i nostri consulenti aziendali? Compila il modulo e ti contatteremo al più presto."
  },
  "insurance": {
    "title": "Richiesta di consulenza assicurativa",
    "subtitle": "Compila il modulo per ricevere una consulenza personalizzata",
    "insuranceType": "Tipo di assicurazione",
    "currentInsurance": "Hai già un'assicurazione?",
    "yes": "Sì",
    "no": "No",
    "currentProvider": "Fornitore attuale",
    "specificNeeds": "Esigenze specifiche",
    "types": {
      "health": "Assicurazione sanitaria",
      "life": "Assicurazione vita",
      "property": "Assicurazione immobiliare",
      "liability": "Assicurazione responsabilità civile",
      "vehicle": "Assicurazione veicolo",
      "other": "Altro"
    },
    "placeholders": {
      "currentProvider": "Es. Helvetia, Zurich, AXA...",
      "specificNeeds": "Descrivi le tue esigenze assicurative..."
    }
  },
  "realEstate": {
    "title": "Richiesta servizio immobiliare",
    "subtitle": "Compila il modulo per ricevere assistenza immobiliare",
    "serviceType": "Tipo di servizio",
    "propertyType": "Tipo di immobile",
    "budget": "Budget stimato (CHF)",
    "location": "Zona preferita",
    "timeline": "Quando prevedi di procedere?",
    "types": {
      "buy": "Acquisto",
      "sell": "Vendita",
      "rent": "Affitto",
      "rentOut": "Affittare",
      "evaluation": "Valutazione immobiliare"
    },
    "properties": {
      "apartment": "Appartamento",
      "house": "Casa",
      "commercial": "Immobile commerciale",
      "land": "Terreno",
      "other": "Altro"
    },
    "timelines": {
      "immediate": "Subito",
      "months3": "Entro 3 mesi",
      "months6": "Entro 6 mesi",
      "year": "Entro un anno",
      "exploring": "Sto solo esplorando"
    },
    "placeholders": {
      "budget": "Es. 500000",
      "location": "Es. Lugano, Ticino"
    }
  },
  "tax": {
    "title": "Richiesta assistenza dichiarazione fiscale",
    "subtitle": "Lasciaci aiutarti con la tua dichiarazione fiscale",
    "taxYear": "Anno fiscale",
    "employmentStatus": "Stato occupazionale",
    "hasProperty": "Possiedi immobili?",
    "hasInvestments": "Hai investimenti finanziari?",
    "needsComplexReturn": "La tua dichiarazione include situazioni complesse?",
    "complexityExamples": "Es. redditi esteri, plusvalenze, attività all'estero",
    "statuses": {
      "employed": "Dipendente",
      "selfEmployed": "Autonomo",
      "retired": "Pensionato",
      "student": "Studente",
      "unemployed": "Disoccupato"
    }
  },
  "job": {
    "title": "Candidatura per consulenza lavorativa",
    "subtitle": "Trova il lavoro giusto con il nostro supporto",
    "positionSought": "Posizione cercata",
    "currentStatus": "Situazione attuale",
    "experienceYears": "Anni di esperienza",
    "educationLevel": "Livello di istruzione",
    "availability": "Disponibilità",
    "desiredSalary": "Stipendio desiderato (CHF/anno)",
    "workPermit": "Hai un permesso di lavoro svizzero?",
    "statuses": {
      "employed": "Occupato",
      "unemployed": "Disoccupato",
      "student": "Studente",
      "careerChange": "Cambio di carriera"
    },
    "education": {
      "secondary": "Scuola secondaria",
      "vocational": "Formazione professionale",
      "bachelor": "Laurea triennale",
      "master": "Laurea magistrale",
      "doctorate": "Dottorato"
    },
    "availabilities": {
      "immediate": "Immediata",
      "weeks2": "2 settimane",
      "month1": "1 mese",
      "months3": "3 mesi"
    },
    "placeholders": {
      "positionSought": "Es. Responsabile Marketing, Ingegnere Software...",
      "desiredSalary": "Es. 80000"
    }
  },
  "legal": {
    "title": "Richiesta di consulenza legale",
    "subtitle": "Ottieni assistenza legale professionale",
    "legalIssueType": "Tipo di questione legale",
    "urgency": "Livello di urgenza",
    "hasDocuments": "Hai documenti relativi al caso?",
    "issueTypes": {
      "contract": "Diritto contrattuale",
      "employment": "Diritto del lavoro",
      "family": "Diritto di famiglia",
      "real_estate": "Diritto immobiliare",
      "corporate": "Diritto societario",
      "other": "Altro"
    },
    "urgencies": {
      "high": "Alta - Richiede attenzione immediata",
      "medium": "Media - Entro una settimana",
      "low": "Bassa - Consulenza generale"
    }
  },
  "medical": {
    "title": "Richiesta di consulenza medica",
    "subtitle": "Prenota una visita con i nostri specialisti",
    "specialtyNeeded": "Specializzazione richiesta",
    "preferredDate": "Data preferita",
    "hasInsurance": "Hai un'assicurazione sanitaria?",
    "insuranceProvider": "Fornitore assicurativo",
    "urgency": "Livello di urgenza",
    "symptoms": "Sintomi o motivo della visita",
    "specialties": {
      "general": "Medicina generale",
      "cardiology": "Cardiologia",
      "dermatology": "Dermatologia",
      "orthopedics": "Ortopedia",
      "pediatrics": "Pediatria",
      "other": "Altra specializzazione"
    },
    "urgencies": {
      "routine": "Visita di routine",
      "soon": "Il prima possibile",
      "urgent": "Urgente"
    },
    "placeholders": {
      "symptoms": "Descrivi i tuoi sintomi o il motivo della visita...",
      "insuranceProvider": "Es. Swica, CSS, Sanitas..."
    }
  },
  "documentUpload": {
    "title": "Richiedi il tuo credito",
    "subtitle": "Compila il modulo e allega un documento d'identità valido. Il nostro team ti contatterà entro 24 ore.",
    "uploadDocument": "Allega documento d'identità",
    "documentTypes": "Tipi di documento accettati: PDF, JPG, PNG (max 10MB)",
    "fileSelected": "File selezionato:",
    "changeFile": "Cambia file"
  },
  "loanRequest": {
    "title": "Richiesta Prestito",
    "steps": {
      "personal": "Dati Personali",
      "occupation": "Occupazione e Reddito",
      "living": "Abitazione e Spese",
      "additional": "Domande Aggiuntive",
      "protection": "Protezione del Credito",
      "documents": "Documenti"
    },
    "progress": "Step {{current}} / {{total}}",
    "simulationLoaded": "Dati simulazione caricati",
    "labels": {
      "loanAmount": "Importo richiesto",
      "duration": "Durata",
      "monthlyPayment": "Rata mensile stimata",
      "salutation": "Saluto",
      "mr": "Sig.",
      "ms": "Sig.ra",
      "firstName": "Nome",
      "lastName": "Cognome",
      "dateOfBirth": "Data di nascita",
      "civilStatus": "Stato civile",
      "nationality": "Nazionalità",
      "areaCode": "Prefisso",
      "telephone": "Numero di telefono",
      "telephoneType": "Tipo",
      "email": "Indirizzo email",
      "country": "Paese",
      "postalCode": "CAP",
      "city": "Città",
      "street": "Via",
      "houseNumber": "Numero civico",
      "residenceDuration": "Durata residenza",
      "ownsHome": "Proprietà dell'abitazione"
    },
    "civilStatuses": {
      "single": "Celibe/Nubile",
      "married": "Coniugato/a / Unione registrata",
      "divorced": "Divorziato/a / Unione sciolta",
      "widowed": "Vedovo/a",
      "separated": "Separato/a"
    },
    "validation": {
      "required": "Campo obbligatorio",
      "invalidEmail": "Inserisci un indirizzo email valido",
      "invalidDate": "Inserisci una data valida",
      "mustBe18": "Devi avere almeno 18 anni",
      "privacyRequired": "Devi accettare la politica sulla privacy"
    },
    "messages": {
      "success": "Richiesta inviata con successo! Ti contatteremo presto.",
      "error": "Errore nell'invio della richiesta. Riprova.",
      "submitting": "Invio in corso..."
    },
    "buttons": {
      "next": "Avanti",
      "previous": "Indietro",
      "submit": "Invia Richiesta"
    }
  },
  "documentPreparation": {
    "title": "Documenti Necessari",
    "subtitle": "Per velocizzare la pratica, prepara i seguenti documenti:",
    "tip": "Avere tutti i documenti pronti riduce i tempi di elaborazione del 50%",
    "documents": [
      {
        "name": "Documento d'identità",
        "description": "Carta d'identità o passaporto validi"
      },
      {
        "name": "Codice fiscale",
        "description": "Copia del codice fiscale"
      },
      {
        "name": "Permesso di soggiorno",
        "description": "Per cittadini non svizzeri"
      },
      {
        "name": "Buste paga",
        "description": "Ultime 3 buste paga"
      },
      {
        "name": "Contratto di lavoro",
        "description": "Copia del contratto attuale"
      },
      {
        "name": "Estratto conto",
        "description": "Ultimi 3 mesi"
      },
      {
        "name": "Betreibungsauszug",
        "description": "Estratto del registro esecuzioni (recente)"
      },
      {
        "name": "Contratto di affitto",
        "description": "Se in affitto"
      },
      {
        "name": "Attestato di proprietà",
        "description": "Se proprietario"
      },
      {
        "name": "Altri documenti",
        "description": "Eventuali documenti rilevanti"
      }
    ]
  }
}
```

**Total Keys:** ~220
**Estimated Translation Time:** 3-4 hours for IT creation, then 2 hours each for EN/FR/DE verification

---

### B. CreditCalculator Translation Keys

Add to `services.json` or create `calculator.json`:

```json
{
  "creditCalculator": {
    "title": "Calcolatore di Prestiti",
    "intro": "Utilizzate questo calcolatore di prestiti per confrontare diversi importi e durate. Ottenete una stima istantanea della vostra rata mensile basata sui tassi d'interesse attuali.",
    "labels": {
      "desiredCredit": "Credito desiderato (CHF)",
      "duration": "Durata (mesi)",
      "wantGuarantee": "Desidera una garanzia del credito?",
      "ownProperty": "Possiede un'abitazione di proprietà?",
      "monthlyPayment": "Rata mensile (CHF)"
    },
    "values": {
      "yes": "Sì",
      "no": "No",
      "chf": "CHF {{value}}",
      "months": "{{count}} mesi"
    },
    "results": {
      "interestRateRange": "Tasso d'interesse annuo effettivo da {{min}}%",
      "guaranteeFee": "Quota garanzia del credito: {{fee}}",
      "estimatedPayment": "{{amount}} / mese",
      "ctaButton": "Richiedi questo prestito",
      "autoSaveInfo": "I tuoi dati della simulazione saranno salvati automaticamente"
    }
  }
}
```

---

### C. TermsConditionsPage Translation Keys

Add to `legal.json` (abbreviated structure):

```json
{
  "terms": {
    "title": "Termini e Condizioni",
    "lastUpdate": "Ultimo aggiornamento: {{date}}",
    "sections": {
      "1_definitions": {
        "title": "1. Definizioni",
        "intro": "Ai fini dei presenti Termini e Condizioni:",
        "services": "I servizi di consulenza offerti da Swiss Consult Hub...",
        "client": "Qualsiasi persona fisica o giuridica...",
        "consultant": "I professionisti qualificati del team Swiss Consult Hub",
        "site": "Il sito web www.swissconsulthub.ch e tutti i suoi sottodomini",
        "content": "Tutti i materiali, informazioni, documenti e consulenze forniti"
      },
      "2_acceptance": {
        "title": "2. Accettazione dei Termini",
        "p1": "Utilizzando i nostri servizi, accettate di essere vincolati...",
        "p2": "Ci riserviamo il diritto di modificare questi termini..."
      },
      "3_services": {
        "title": "3. Descrizione dei Servizi",
        "intro": "Swiss Consult Hub offre i seguenti servizi di consulenza:",
        "credit": {
          "title": "3.1 Consulenza Creditizia",
          "description": "..."
        },
        "insurance": { /* ... */ },
        "realEstate": { /* ... */ },
        "job": { /* ... */ },
        "legal": { /* ... */ },
        "medical": { /* ... */ },
        "tax": { /* ... */ }
      },
      // ... sections 4-11
    }
  }
}
```

**Estimated Keys:** 180-200
**Estimated Translation Time:** 4 hours for structure + translation

---

### D. Service Request Forms Translation Keys

Expand `forms.json` for each form type (see Section 5 above for full structure)

**Keys per form:**
- Title: 1
- Subtitle: 1
- Field labels: 5-15
- Placeholders: 5-15
- Dropdown options: 5-10
- Success message: 1
- Error message: 1
- Privacy text: 1

**Total per form:** ~20-40 keys
**Total for 7 forms:** ~140-200 keys

---

### E. LoanRequestModal Translation Keys

```json
{
  "loanRequest": {
    "title": "Richiesta Prestito",
    "totalSteps": 6,
    "steps": {
      "1": "Dati Personali",
      "2": "Occupazione e Reddito",
      "3": "Abitazione e Spese",
      "4": "Domande Aggiuntive",
      "5": "Protezione del Credito",
      "6": "Documenti"
    },
    "navigation": {
      "progress": "Step {{current}} / {{total}}",
      "next": "Avanti",
      "previous": "Indietro",
      "submit": "Invia Richiesta"
    },
    "simulator": {
      "loaded": "Dati simulazione caricati",
      "amount": "Importo richiesto",
      "duration": "Durata",
      "payment": "Rata mensile stimata"
    },
    "personalData": {
      "title": "Dati Personali",
      "subtitle": "Compila i seguenti campi obbligatori:",
      "sections": {
        "identity": "Dati anagrafici",
        "contact": "Recapiti",
        "address": "Indirizzo di residenza"
      },
      "fields": {
        /* 40+ field definitions */
      }
    },
    "occupation": {
      /* 20+ field definitions */
    },
    "living": {
      /* 15+ field definitions */
    },
    "additional": {
      /* 10+ field definitions */
    },
    "protection": {
      /* 5+ field definitions */
    },
    "documents": {
      /* 10 document upload fields */
    },
    "validation": {
      "required": "Campo obbligatorio",
      "invalidEmail": "Inserisci un indirizzo email valido",
      "invalidDate": "Inserisci una data valida nel formato GG.MM.AAAA",
      "invalidPhone": "Inserisci un numero di telefono valido",
      "mustBe18": "Devi avere almeno 18 anni",
      "privacyRequired": "Devi accettare la politica sulla privacy per procedere",
      "fileTooBig": "Il file supera la dimensione massima di 10MB",
      "invalidFileType": "Tipo di file non supportato. Usa PDF, JPG o PNG"
    },
    "messages": {
      "success": "✅ Richiesta inviata con successo! Ti contatteremo presto.",
      "error": "❌ Errore nell'invio della richiesta. Riprova.",
      "submitting": "Invio in corso..."
    }
  }
}
```

**Estimated Keys:** 150-180
**Estimated Translation Time:** 4-5 hours (complex structure)

---

## Summary & Next Steps

### Coverage Improvement Projection

| Phase | Components Affected | Keys to Translate | Time Estimate | New Coverage |
|-------|---------------------|-------------------|---------------|--------------|
| **Current** | - | - | - | **70%** |
| **Phase 1** | IT forms.json, CreditCalculator, TermsConditions, LoanRequestModal | ~565 | 12 hours | **85%** |
| **Phase 2** | 7 Service Forms, ServiceDetailPage, DocumentPrep | ~170 | 8 hours | **95%** |
| **Phase 3** | QA, Polish, Documentation | - | 6 hours | **95%+** |
| **Total** | 12 components + 1 critical file | ~735 keys | **26 hours** | **95%+** ✅ |

### Implementation Priority

**🔴 Week 1 - CRITICAL (12 hours):**
1. Create Italian forms.json (3h)
2. Internationalize CreditCalculator.tsx (2h)
3. Internationalize TermsConditionsPage.tsx (4h)
4. Internationalize LoanRequestModal.tsx (3h)

**🟡 Week 2 - HIGH (8 hours):**
1. Internationalize 7 service request forms (5h)
2. Complete ServiceDetailPage sections (1h)
3. Complete DocumentPreparationReminder (1h)
4. Initial testing (1h)

**🟢 Week 3 - POLISH (6 hours):**
1. Native speaker review (3h)
2. Functional QA testing (2h)
3. Documentation update (1h)

### Success Criteria

✅ **Technical:**
- All user-facing components use t() function
- No hardcoded user-visible strings
- Build completes without i18n errors
- 95%+ UI coverage achieved

✅ **Linguistic:**
- Native speaker approval for all languages
- Consistent terminology across namespaces
- Appropriate tone and formality per language
- Swiss-specific terminology validated

✅ **Functional:**
- All forms submit successfully in all languages
- Number/date/currency formatting correct per locale
- Validation messages clear and helpful
- No fallback language visible to users

✅ **Legal:**
- Terms & Conditions available in all 4 languages
- Privacy Policy available in all 4 languages
- GDPR compliance maintained

---

**Report Compiled By:** Multilingual UX/UI Localization Expert
**Date:** November 9, 2025
**Next Review:** Upon completion of Phase 1 (Week 1)
**Contact:** For questions regarding this audit, consult project maintainers

---

*This report represents a comprehensive audit based on industry best practices for internationalization (i18n) and localization (l10n), including Unicode standards, CLDR conventions, and multilingual UX principles. Implementation of these recommendations will result in a fully internationalized, professionally localized digital product ready for the Swiss multilingual market.*
