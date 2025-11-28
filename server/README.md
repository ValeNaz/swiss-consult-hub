# Swiss Consult Hub - Backend API

Backend REST API per Swiss Consult Hub, costruito con **Node.js**, **Express**, **MySQL** e **Cloudinary**.

## 🚀 Stack Tecnologico

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Autenticazione**: JWT (JSON Web Tokens)
- **Storage File**: Cloudinary
- **Validazione**: Express Validator
- **Security**: Helmet, CORS, bcryptjs

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **npm** o **yarn**

## ⚙️ Installazione

### 1. Installa le dipendenze

```bash
cd server
npm install
```

### 2. Configura il file `.env`

Il file `.env` è già presente nella cartella `server/`. Verifica e modifica le credenziali se necessario:

```env
# Server
PORT=3001
NODE_ENV=development

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password  # ⚠️ CAMBIA QUESTA!
DB_NAME=swiss_consult_hub

# JWT Secret (cambiare in produzione!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789
JWT_EXPIRES_IN=7d

# Cloudinary (già configurato)
CLOUDINARY_CLOUD_NAME=dnbr9uouz
CLOUDINARY_API_KEY=663229887469223
CLOUDINARY_API_SECRET=w1FrygHGuzAF_d8cO3dWpPUYVMU

# CORS
CORS_ORIGIN=http://localhost:3000

# Email
ADMIN_EMAIL=valatria14@gmail.com
```

### 3. Configura MySQL

Assicurati che MySQL sia in esecuzione. Se non hai impostato una password per l'utente `root`, lascia `DB_PASSWORD` vuoto.

```bash
# Verifica che MySQL sia attivo
mysql --version

# Accedi a MySQL (se necessario)
mysql -u root -p
```

### 4. Crea il database e le tabelle

Esegui lo script di setup automatico:

```bash
npm run db:setup
```

Questo creerà:
- Database `swiss_consult_hub`
- Tutte le tabelle (users, clients, requests, attachments, etc.)
- Views, Stored Procedures e Triggers

### 5. Popola il database con dati di esempio (opzionale)

```bash
npm run db:seed
```

Questo creerà:
- 3 utenti (admin, operator, consultant)
- 3 clienti
- 5 richieste di esempio

**Credenziali di test:**
- **Admin**: admin@swissconsult.ch / admin123
- **Operator**: operator@swissconsult.ch / operator123
- **Consultant**: consultant@swissconsult.ch / consultant123

## 🏃 Avvio del Server

### Development Mode (con hot-reload)

```bash
npm run dev
```

Il server sarà disponibile su: `http://localhost:3001`

### Production Mode

```bash
# Compila TypeScript
npm run build

# Avvia server compilato
npm start
```

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Descrizione | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login utente | No |
| POST | `/api/auth/register` | Registra nuovo utente | Admin |
| GET | `/api/auth/profile` | Profilo utente corrente | Yes |
| PUT | `/api/auth/profile` | Aggiorna profilo | Yes |
| POST | `/api/auth/change-password` | Cambia password | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

### Clients (`/api/clients`)

| Method | Endpoint | Descrizione | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/clients` | Lista clienti | Yes |
| GET | `/api/clients/:id` | Dettaglio cliente | Yes |
| POST | `/api/clients` | Crea cliente | Admin/Operator |
| PUT | `/api/clients/:id` | Aggiorna cliente | Admin/Operator |
| DELETE | `/api/clients/:id` | Elimina cliente | Admin |
| GET | `/api/clients/stats` | Statistiche clienti | Yes |
| GET | `/api/clients/search?email=xxx` | Cerca per email | Yes |

### Requests (`/api/requests`)

| Method | Endpoint | Descrizione | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/requests` | Lista richieste | Yes |
| GET | `/api/requests/:id` | Dettaglio richiesta | Yes |
| POST | `/api/requests` | Crea richiesta | Admin/Operator/Consultant |
| PUT | `/api/requests/:id` | Aggiorna richiesta | Admin/Operator/Consultant |
| DELETE | `/api/requests/:id` | Elimina richiesta | Admin |
| GET | `/api/requests/stats` | Dashboard stats | Yes |
| GET | `/api/requests/:requestId/attachments` | Lista allegati | Yes |
| POST | `/api/requests/:requestId/attachments` | Upload file | Admin/Operator/Consultant |
| DELETE | `/api/requests/:requestId/attachments/:id` | Elimina allegato | Admin/Operator |

## 🔐 Autenticazione JWT

Tutte le richieste autenticate richiedono un header `Authorization`:

```
Authorization: Bearer <your-jwt-token>
```

**Esempio Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@swissconsult.ch", "password": "admin123"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@swissconsult.ch",
      "name": "Admin Swiss Consult",
      "role": "admin",
      "permissions": [...]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 📁 Upload File con Cloudinary

Gli upload file vengono gestiti automaticamente su Cloudinary.

**Esempio:**

```bash
curl -X POST http://localhost:3001/api/requests/{requestId}/attachments \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/document.pdf" \
  -F "documentType=identity_card"
```

I file vengono organizzati su Cloudinary in:
```
swiss-consult/requests/{requestId}/{documentType}/filename.pdf
```

## 🗂️ Struttura Database

### Tabelle Principali

- **users**: Utenti del sistema (admin, operator, consultant, viewer)
- **clients**: Anagrafica clienti
- **requests**: Richieste di consulenza
- **attachments**: Allegati collegati alle richieste
- **user_permissions**: Permessi granulari per utente
- **activity_log**: Log attività (opzionale)

### Views

- **vw_requests_detail**: Richieste con dettagli cliente e assegnatario
- **vw_client_stats**: Statistiche aggregate per cliente

## 🛡️ Ruoli e Permessi

| Ruolo | Descrizione | Permessi |
|-------|-------------|----------|
| **admin** | Amministratore completo | Tutti i permessi |
| **operator** | Operatore gestione richieste | Gestione richieste, clienti, documenti |
| **consultant** | Consulente | Gestione richieste e clienti limitata |
| **viewer** | Solo visualizzazione | Visualizza dashboard e report |

## 🧪 Testing API

Puoi testare le API usando:

- **Postman** (importa le routes dal codice)
- **Thunder Client** (VS Code extension)
- **curl** (command line)

**Esempio GET requests:**

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@swissconsult.ch", "password": "admin123"}' \
  | jq -r '.data.token')

# Get all requests
curl http://localhost:3001/api/requests \
  -H "Authorization: Bearer $TOKEN"

# Dashboard stats
curl http://localhost:3001/api/requests/stats \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Troubleshooting

### Errore connessione MySQL

```
❌ Errore connessione MySQL: Access denied for user 'root'@'localhost'
```

**Soluzione**: Verifica username e password in `.env`, oppure crea un nuovo utente MySQL:

```sql
CREATE USER 'swiss_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON swiss_consult_hub.* TO 'swiss_user'@'localhost';
FLUSH PRIVILEGES;
```

### Errore Cloudinary

```
❌ Errore configurazione Cloudinary
```

**Soluzione**: Verifica le credenziali Cloudinary nel file `.env` siano corrette.

### Port già in uso

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Soluzione**: Cambia la porta in `.env` o termina il processo:

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

## 📝 Logs

I log vengono stampati in console. In development mode, vengono mostrati tutti i dettagli delle richieste HTTP.

## 🚀 Deploy in Produzione

### 1. Build

```bash
npm run build
```

### 2. Configurazione Produzione

Modifica `.env` per produzione:
- Cambia `JWT_SECRET` con una chiave sicura
- Imposta `NODE_ENV=production`
- Configura database remoto
- Aggiorna `CORS_ORIGIN` con il dominio frontend

### 3. Avvia

```bash
npm start
```

## 📚 Documentazione Aggiuntiva

- [Express.js](https://expressjs.com/)
- [MySQL](https://dev.mysql.com/doc/)
- [Cloudinary](https://cloudinary.com/documentation)
- [JWT](https://jwt.io/)

## 🆘 Supporto

Per problemi o domande, consulta i log del server o verifica la configurazione del database.

---

**Creato con ❤️ per Swiss Consult Hub**
