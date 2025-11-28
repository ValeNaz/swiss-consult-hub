# Configurazione Email per Swiss Consult Hub

## Come Configurare Gmail per Inviare Email

Per permettere all'applicazione di inviare email, devi configurare Gmail con una **App Password** (non la tua password normale di Gmail).

### Passo 1: Abilita la Verifica in Due Passaggi

1. Vai su [myaccount.google.com](https://myaccount.google.com)
2. Nella sezione **Sicurezza**, trova **"Verifica in due passaggi"**
3. Segui le istruzioni per abilitarla (se non l'hai già fatto)

### Passo 2: Genera una App Password

1. Vai su [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Oppure: **Sicurezza** → **Verifica in due passaggi** → **Password per le app** (in fondo alla pagina)
2. Nel menu a tendina, seleziona **"Altro (nome personalizzato)"**
3. Scrivi: **"Swiss Consult Hub"**
4. Clicca su **Genera**
5. **Copia la password di 16 caratteri** che appare (senza spazi)

### Passo 3: Configura il File .env

Apri il file `/server/.env` e modifica queste righe:

```env
# Email Configuration
ADMIN_EMAIL=valatria14@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=valatria14@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx    # <--- Incolla qui la App Password (senza spazi!)
ADMIN_URL=http://localhost:3000
```

**IMPORTANTE:** Sostituisci `xxxx xxxx xxxx xxxx` con la App Password che hai copiato al Passo 2 (rimuovi gli spazi).

### Esempio

Se la tua App Password è: `abcd efgh ijkl mnop`

Scrivi nel .env:
```env
SMTP_PASSWORD=abcdefghijklmnop
```

### Passo 4: Riavvia il Server

Dopo aver modificato il `.env`:

```bash
# Ferma il server (Ctrl+C)
# Riavvia il server
cd server
npm run dev
```

### Test

Quando crei una nuova richiesta dal sito, dovresti:
1. ✅ Vedere la richiesta nel pannello admin
2. ✅ Vedere i file allegati caricati
3. ✅ Ricevere un'email a valatria14@gmail.com con tutti i dettagli

### Problemi Comuni

**Errore "Invalid login":**
- Verifica che la App Password sia corretta
- Assicurati di aver abilitato la Verifica in Due Passaggi

**Errore "Connection refused":**
- Controlla che SMTP_HOST sia `smtp.gmail.com`
- Controlla che SMTP_PORT sia `587`
- Controlla che SMTP_SECURE sia `false`

**Email non arrivano:**
- Controlla la cartella Spam
- Verifica che ADMIN_EMAIL sia corretto
- Controlla i log del server per errori

### Alternative a Gmail

Se preferisci usare un altro servizio email:

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_smtp_user
SMTP_PASSWORD=your_mailgun_smtp_password
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.eu-west-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_user
SMTP_PASSWORD=your_ses_smtp_password
```

---

Per supporto: controlla i log del server quando invii una richiesta per vedere eventuali errori email.
