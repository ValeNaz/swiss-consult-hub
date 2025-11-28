# 🚀 Guida Upgrade UX Form - LoanRequestModal

## 📋 Panoramica

Questa guida mostra come integrare i nuovi componenti intelligenti nel `LoanRequestModal` per creare un'esperienza utente eccezionale con validazioni in tempo reale, feedback visivo e navigazione migliorata.

## 🎯 Componenti Disponibili

### 1. SmartInput
```tsx
import SmartInput from '../components/form/SmartInput';

<SmartInput
  label={t('loanRequest.fields.firstName')}
  value={formData.firstName}
  onChange={(value) => handleChange('firstName', value)}
  type="text"
  required
  placeholder="Mario"
  tooltip="Inserisci il tuo nome come appare sul documento d'identità"
  validation={(value) => ({
    valid: value.length >= 2,
    message: value.length < 2 ? 'Il nome deve contenere almeno 2 caratteri' : 'Nome valido ✓'
  })}
  error={fieldErrors.firstName}
  autoComplete="given-name"
/>
```

### 2. SmartSelect
```tsx
import SmartSelect from '../components/form/SmartSelect';

// Variante Buttons (per poche opzioni)
<SmartSelect
  label={t('loanRequest.fields.salutation')}
  value={formData.salutation}
  onChange={(value) => handleChange('salutation', value)}
  variant="buttons"
  required
  options={[
    { value: 'Mr.', label: t('loanRequest.options.salutations.mr') },
    { value: 'Ms.', label: t('loanRequest.options.salutations.ms') }
  ]}
  error={fieldErrors.salutation}
/>

// Variante Cards (per opzioni con descrizioni)
<SmartSelect
  label={t('loanRequest.fields.professionalSituation')}
  value={formData.professionalSituation}
  onChange={(value) => handleChange('professionalSituation', value)}
  variant="cards"
  required
  options={[
    {
      value: 'Employed',
      label: t('loanRequest.options.professionalSituations.employed'),
      icon: <Briefcase size={24} />,
      description: 'Contratto di lavoro dipendente'
    },
    {
      value: 'Self-employed',
      label: t('loanRequest.options.professionalSituations.selfEmployed'),
      icon: <Building size={24} />,
      description: 'Partita IVA o ditta individuale'
    }
  ]}
  error={fieldErrors.professionalSituation}
/>
```

### 3. SmartFileUpload
```tsx
import SmartFileUpload from '../components/form/SmartFileUpload';

<SmartFileUpload
  label={t('loanRequest.documents.betreibungsauszugCurrent')}
  value={formData.betreibungsauszugCurrent}
  onChange={(file) => handleChange('betreibungsauszugCurrent', file)}
  required
  tooltip="Estratto del registro delle esecuzioni del tuo comune di residenza attuale, non più vecchio di 3 mesi"
  hint="Puoi richiedere questo documento presso il tuo comune di residenza"
  accept=".pdf,application/pdf"
  maxSize={10}
  error={fileErrors.betreibungsauszugCurrent}
/>
```

### 4. ProgressStepper
```tsx
import ProgressStepper from '../components/form/ProgressStepper';

const steps = [
  { number: 1, title: t('loanRequest.steps.personalDetails'), description: 'Dati anagrafici' },
  { number: 2, title: t('loanRequest.steps.occupationIncome'), description: 'Lavoro e reddito' },
  { number: 3, title: t('loanRequest.steps.livingExpenses'), description: 'Abitazione e spese' },
  { number: 4, title: t('loanRequest.steps.additionalQuestions'), description: 'Informazioni creditizie' },
  { number: 5, title: t('loanRequest.steps.creditProtection'), description: 'Protezione e note' },
  { number: 6, title: t('loanRequest.steps.documents'), description: 'Caricamento documenti' }
];

<ProgressStepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={(step) => setCurrentStep(step)}
  allowNavigation={true}
/>
```

## 🔥 Esempio Completo: Step 1 Riprogettato

```tsx
{currentStep === 1 && (
  <div className="form-step">
    {/* Progress Indicator */}
    <ProgressStepper
      steps={steps}
      currentStep={currentStep}
      allowNavigation={false}
    />

    <h3>{t('loanRequest.steps.personalDetails')}</h3>

    {/* Simulator Summary */}
    {simulatorData && (
      <div className="simulator-summary">
        <div className="summary-header">
          <CheckCircle2 size={24} />
          <h4>{t('loanRequest.simulatorLoaded')}</h4>
        </div>
        <div className="summary-grid">
          <div>
            <span>{t('loanRequest.loanAmount')}</span>
            <strong>CHF {simulatorData.amount.toLocaleString('de-CH')}</strong>
          </div>
          <div>
            <span>{t('loanRequest.duration')}</span>
            <strong>{simulatorData.duration} {t('loanRequest.months')}</strong>
          </div>
          <div>
            <span>{t('loanRequest.estimatedPayment')}</span>
            <strong>CHF {simulatorData.minMonthlyPayment.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    )}

    {/* Section: Dati anagrafici */}
    <div className="form-section">
      <h4>{t('loanRequest.sections.personalData')}</h4>

      {/* Salutation */}
      <SmartSelect
        label={t('loanRequest.fields.salutation')}
        value={formData.salutation}
        onChange={(value) => handleChange('salutation', value)}
        variant="buttons"
        required
        options={[
          { value: 'Mr.', label: t('loanRequest.options.salutations.mr') },
          { value: 'Ms.', label: t('loanRequest.options.salutations.ms') }
        ]}
        error={fieldErrors.salutation}
      />

      {/* First Name & Last Name */}
      <div className="form-row">
        <SmartInput
          label={t('loanRequest.fields.firstName')}
          value={formData.firstName}
          onChange={(value) => handleChange('firstName', value)}
          type="text"
          required
          icon={<User size={20} />}
          placeholder="Mario"
          tooltip="Inserisci il tuo nome come appare sul documento d'identità"
          validation={(value) => ({
            valid: value.length >= 2,
            message: value.length >= 2 ? 'Nome valido ✓' : 'Minimo 2 caratteri'
          })}
          error={fieldErrors.firstName}
          autoComplete="given-name"
        />

        <SmartInput
          label={t('loanRequest.fields.lastName')}
          value={formData.lastName}
          onChange={(value) => handleChange('lastName', value)}
          type="text"
          required
          icon={<User size={20} />}
          placeholder="Rossi"
          tooltip="Inserisci il tuo cognome come appare sul documento d'identità"
          validation={(value) => ({
            valid: value.length >= 2,
            message: value.length >= 2 ? 'Cognome valido ✓' : 'Minimo 2 caratteri'
          })}
          error={fieldErrors.lastName}
          autoComplete="family-name"
        />
      </div>

      {/* Email */}
      <SmartInput
        label={t('loanRequest.fields.email')}
        value={formData.email}
        onChange={(value) => handleChange('email', value)}
        type="email"
        required
        icon={<Mail size={20} />}
        placeholder="mario.rossi@example.com"
        tooltip="Indirizzo email dove riceverai tutte le comunicazioni"
        validation={(value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return {
            valid: emailRegex.test(value),
            message: emailRegex.test(value) ? 'Email valida ✓' : 'Inserisci un indirizzo email valido'
          };
        }}
        error={fieldErrors.email}
        autoComplete="email"
      />

      {/* Phone */}
      <SmartInput
        label={t('loanRequest.fields.phone')}
        value={formData.phone}
        onChange={(value) => handleChange('phone', value)}
        type="tel"
        required
        icon={<Phone size={20} />}
        placeholder="+41 78 123 45 67"
        tooltip="Numero di telefono mobile per contattarti rapidamente"
        hint="Formato: +41 seguito dal numero"
        validation={(value) => {
          const phoneRegex = /^\+41\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
          return {
            valid: phoneRegex.test(value.replace(/\s/g, '')),
            message: phoneRegex.test(value.replace(/\s/g, '')) ? 'Numero valido ✓' : 'Formato: +41 78 123 45 67'
          };
        }}
        error={fieldErrors.phone}
        autoComplete="tel"
      />

      {/* Birth Date */}
      <SmartInput
        label={t('loanRequest.fields.birthDate')}
        value={formData.birthDate}
        onChange={(value) => handleChange('birthDate', value)}
        type="text"
        required
        icon={<Calendar size={20} />}
        placeholder="01.01.1990"
        tooltip="Data di nascita nel formato giorno.mese.anno"
        hint="Formato: GG.MM.AAAA"
        validation={(value) => {
          const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
          if (!dateRegex.test(value)) {
            return { valid: false, message: 'Formato richiesto: GG.MM.AAAA' };
          }
          const [day, month, year] = value.split('.').map(Number);
          const age = new Date().getFullYear() - year;
          return {
            valid: age >= 18 && age <= 100,
            message: age >= 18 ? 'Data valida ✓' : 'Devi avere almeno 18 anni'
          };
        }}
        error={fieldErrors.birthDate}
      />

      {/* Nationality */}
      <SmartSelect
        label={t('loanRequest.fields.nationality')}
        value={formData.nationality}
        onChange={(value) => handleChange('nationality', value)}
        variant="dropdown"
        required
        tooltip="Seleziona la tua nazionalità attuale"
        options={[
          { value: 'Swiss', label: 'Svizzera' },
          { value: 'Italian', label: 'Italiana' },
          { value: 'German', label: 'Tedesca' },
          { value: 'French', label: 'Francese' },
          { value: 'Other EU', label: 'Altra UE' },
          { value: 'Other', label: 'Altra' }
        ]}
        error={fieldErrors.nationality}
      />

      {/* Permit Type (conditional) */}
      {formData.nationality !== 'Swiss' && (
        <SmartSelect
          label={t('loanRequest.fields.permitType')}
          value={formData.permitType}
          onChange={(value) => handleChange('permitType', value)}
          variant="buttons"
          required
          tooltip="Tipo di permesso di soggiorno in Svizzera"
          options={[
            { value: 'B', label: 'Permesso B (Residenza)' },
            { value: 'C', label: 'Permesso C (Domicilio)' },
            { value: 'L', label: 'Permesso L (Breve durata)' },
            { value: 'G', label: 'Permesso G (Frontaliere)' }
          ]}
          error={fieldErrors.permitType}
        />
      )}
    </div>

    {/* Section: Indirizzo */}
    <div className="form-section">
      <h4>{t('loanRequest.sections.address')}</h4>

      <div className="form-row">
        <SmartInput
          label={t('loanRequest.fields.street')}
          value={formData.street}
          onChange={(value) => handleChange('street', value)}
          type="text"
          required
          icon={<MapPin size={20} />}
          placeholder="Via Roma"
          error={fieldErrors.street}
          autoComplete="street-address"
        />

        <SmartInput
          label={t('loanRequest.fields.houseNumber')}
          value={formData.houseNumber}
          onChange={(value) => handleChange('houseNumber', value)}
          type="text"
          required
          placeholder="15"
          error={fieldErrors.houseNumber}
        />
      </div>

      <div className="form-row">
        <SmartInput
          label={t('loanRequest.fields.postalCode')}
          value={formData.postalCode}
          onChange={(value) => handleChange('postalCode', value)}
          type="text"
          required
          placeholder="6900"
          tooltip="CAP svizzero (4 cifre)"
          validation={(value) => ({
            valid: /^\d{4}$/.test(value),
            message: /^\d{4}$/.test(value) ? 'CAP valido ✓' : '4 cifre richieste'
          })}
          error={fieldErrors.postalCode}
          autoComplete="postal-code"
        />

        <SmartInput
          label={t('loanRequest.fields.city')}
          value={formData.city}
          onChange={(value) => handleChange('city', value)}
          type="text"
          required
          icon={<MapPin size={20} />}
          placeholder="Lugano"
          error={fieldErrors.city}
          autoComplete="address-level2"
        />
      </div>

      <SmartSelect
        label={t('loanRequest.fields.canton')}
        value={formData.canton}
        onChange={(value) => handleChange('canton', value)}
        variant="dropdown"
        required
        options={[
          { value: 'TI', label: 'Ticino' },
          { value: 'ZH', label: 'Zurigo' },
          { value: 'BE', label: 'Berna' },
          { value: 'GE', label: 'Ginevra' },
          // ... altri cantoni
        ]}
        error={fieldErrors.canton}
      />
    </div>
  </div>
)}
```

## 🎨 Stili Necessari

Gli stili sono già pronti nei file:
- `/styles/SmartInput.css`
- `/styles/SmartSelect.css`
- `/styles/SmartFileUpload.css`
- `/styles/ProgressStepper.css`

## 📊 Validazioni Intelligenti Consigliate

### Email
```tsx
const validateEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(value),
    message: emailRegex.test(value) ? 'Email valida ✓' : 'Inserisci un indirizzo email valido'
  };
};
```

### Telefono Svizzero
```tsx
const validatePhone = (value: string) => {
  const phoneRegex = /^\+41\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
  const normalized = value.replace(/\s/g, '');
  return {
    valid: phoneRegex.test(normalized),
    message: phoneRegex.test(normalized) ? 'Numero valido ✓' : 'Formato: +41 78 123 45 67'
  };
};
```

### Data di Nascita
```tsx
const validateBirthDate = (value: string) => {
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!dateRegex.test(value)) {
    return { valid: false, message: 'Formato richiesto: GG.MM.AAAA' };
  }
  const [day, month, year] = value.split('.').map(Number);
  const age = new Date().getFullYear() - year;
  return {
    valid: age >= 18 && age <= 100,
    message: age >= 18 ? 'Data valida ✓' : 'Devi avere almeno 18 anni'
  };
};
```

### IBAN Svizzero
```tsx
const validateIBAN = (value: string) => {
  const ibanRegex = /^CH\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d$/;
  const normalized = value.replace(/\s/g, '');
  return {
    valid: ibanRegex.test(normalized) && normalized.startsWith('CH'),
    message: ibanRegex.test(normalized) ? 'IBAN valido ✓' : 'IBAN svizzero inizia con CH seguito da 19 cifre'
  };
};
```

### Importo CHF
```tsx
const validateAmount = (value: string, min: number, max: number) => {
  const amount = parseInt(value);
  if (isNaN(amount)) return { valid: false, message: 'Inserisci un importo valido' };
  if (amount < min) return { valid: false, message: `Minimo CHF ${min.toLocaleString('de-CH')}` };
  if (amount > max) return { valid: false, message: `Massimo CHF ${max.toLocaleString('de-CH')}` };
  return { valid: true, message: 'Importo valido ✓' };
};
```

## 🚀 Miglioramenti UX Implementati

### ✅ Feedback Visivo Immediato
- Icone di validazione (✓ verde, ⚠ rosso)
- Bordi colorati (verde = valido, rosso = errore)
- Animazioni fluide su focus e interazione

### ✅ Guida Contestuale
- Tooltip informativi su ogni campo
- Hint con esempi di formato
- Messaggi di errore specifici e utili

### ✅ Validazione Progressiva
- Validazione solo dopo il primo blur (touched)
- Feedback in tempo reale durante la digitazione
- Messaggi che guidano alla correzione

### ✅ Accessibilità
- Label sempre visibili
- aria-invalid per screen reader
- aria-describedby per errori
- Keyboard navigation completa

### ✅ Mobile-First
- Touch-friendly (44px min touch target)
- Layout responsive automatico
- Ottimizzato per digitazione mobile

## 📋 Checklist Migrazione

- [ ] Importare i nuovi componenti smart
- [ ] Sostituire input HTML con SmartInput
- [ ] Sostituire radio/select con SmartSelect
- [ ] Sostituire file input con SmartFileUpload
- [ ] Aggiungere ProgressStepper al posto dell'indicatore semplice
- [ ] Implementare validazioni intelligenti per ogni campo
- [ ] Aggiungere tooltip informativi
- [ ] Testare su mobile
- [ ] Testare con screen reader
- [ ] Verificare sincronizzazione documenti calcolatore ↔ form

## 🎯 Risultato Atteso

Con questi componenti, il form diventa:
1. **Più intuitivo** - L'utente sa sempre cosa inserire
2. **Più affidabile** - Validazione in tempo reale previene errori
3. **Più veloce** - Feedback immediato accelera la compilazione
4. **Più accessibile** - Compatibile con assistive technologies
5. **Più moderno** - UI pulita e animazioni fluide

---

**Nota**: I documenti richiesti nel calcolatore sono perfettamente sincronizzati con quelli dello Step 6 del form! ✅
