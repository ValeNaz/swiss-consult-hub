# AddressInputSmart - Componente Libero e Personalizzabile

## Filosofia
**L'utente ha SEMPRE il controllo completo.** Google Places è solo un aiuto opzionale, mai un vincolo.

## Caratteristiche
- ✅ Digitazione completamente libera - nessuna limitazione
- ✅ Google autocomplete opzionale e disattivabile
- ✅ Layout minimal e non invadente
- ✅ Suggerimenti discreti solo quando utili
- ✅ Supporto internazionale (non solo Svizzera)
- ✅ 100% personalizzabile

## Props

```typescript
interface AddressInputSmartProps {
    // Required
    street: string;
    streetNumber: string;
    onStreetChange: (value: string) => void;
    onStreetNumberChange: (value: string) => void;

    // Optional - Controllo totale
    enableAutocomplete?: boolean;      // Default: true - Disattiva Google se false
    restrictToCountry?: boolean;       // Default: false - Cerca ovunque
    showHelper?: boolean;              // Default: false - Mostra/nascondi hint
    placeholder?: string;              // Personalizza il placeholder
    countryCode?: string;              // Es: 'CH', 'IT', 'US' - auto-detect se omesso

    // Callbacks opzionali
    onAddressSelect?: (details: {
        street: string;
        streetNumber: string;
        city: string;
        state?: string;
        postalCode: string;
        country?: string;
        countryCode?: string;
    }) => void;

    // Errori
    errorStreet?: string;
    errorStreetNumber?: string;
}
```

## Esempi d'uso

### 1. Input completamente libero (NO Google)
```tsx
<AddressInputSmart
    street={street}
    streetNumber={streetNo}
    onStreetChange={setStreet}
    onStreetNumberChange={setStreetNo}
    enableAutocomplete={false}  // Disabilita Google
    placeholder="Inserisci il tuo indirizzo"
/>
```

### 2. Con Google assistenza opzionale (Default)
```tsx
<AddressInputSmart
    street={street}
    streetNumber={streetNo}
    onStreetChange={setStreet}
    onStreetNumberChange={setStreetNo}
    onAddressSelect={(details) => {
        // Auto-fill OPZIONALE quando l'utente sceglie un suggerimento
        setCity(details.city);
        setPostalCode(details.postalCode);
    }}
    enableAutocomplete={true}   // Abilita suggerimenti Google
    restrictToCountry={false}   // Cerca in tutto il mondo
    showHelper={false}          // Non mostrare hint
/>
```

### 3. Ristretto a un paese specifico
```tsx
<AddressInputSmart
    street={street}
    streetNumber={streetNo}
    onStreetChange={setStreet}
    onStreetNumberChange={setStreetNo}
    countryCode="CH"            // Svizzera
    restrictToCountry={true}    // Solo indirizzi svizzeri
    showHelper={true}           // Mostra hint
/>
```

### 4. Con helper visibile
```tsx
<AddressInputSmart
    street={street}
    streetNumber={streetNo}
    onStreetChange={setStreet}
    onStreetNumberChange={setStreetNo}
    showHelper={true}  // Mostra suggerimento discreto
/>
```

## Design Minimal

### Icona
- Opacity 0.5 di default
- Solo se `enableAutocomplete={true}`
- Non invadente

### Loading
- Animazione pulse sottile
- Opacity ridotta (0.3-0.6)
- Debounce aumentato a 500ms

### Suggerimenti
- Dropdown leggero (shadow 0.08)
- Animazione fade-in rapida (0.15s)
- Hover discreto (#f9f9f9)
- Font ridotti (13px/11px)

### Helper
- Background neutro (#f9f9f9)
- Border-left sottile
- Opacity 0.8
- Font 11px
- Solo se esplicitamente richiesto

## Comportamento

1. **Input sempre libero**: L'utente può digitare qualsiasi cosa
2. **Suggerimenti opzionali**: Appaiono solo dopo 3 caratteri e 500ms
3. **Auto-fill su richiesta**: Solo se l'utente clicca un suggerimento
4. **Errori silent**: Se Google fallisce, l'utente può comunque digitare
5. **Nessun vincolo**: Mai bloccare o controllare l'input dell'utente

## Accessibilità
- Placeholder chiaro
- Error messages
- Focus states
- Keyboard navigation ready
- Screen reader friendly

## Performance
- Debounce 500ms per API calls
- Session token per ottimizzazione costi Google
- Lazy initialization
- Silent failures

## Best Practices
✅ **DO**: Lasciare `enableAutocomplete={true}` per default (aiuto utile)
✅ **DO**: Usare `restrictToCountry={false}` per massima flessibilità
✅ **DO**: Gestire sia input manuale che auto-fill
❌ **DON'T**: Forzare l'utente a usare i suggerimenti
❌ **DON'T**: Bloccare il form se Google fallisce
❌ **DON'T**: Mostrare helper troppo vistosi (`showHelper={false}`)
