# Swiss Consult Hub - Deployment Guide per VPS Ubuntu + Nginx

## Architettura del Deployment

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │   Nginx (80)   │
              │   SSL (443)    │
              └───────┬────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌───────────────┐
│   Frontend    │          │   Backend     │
│ Static Files  │          │ Node.js:3001  │
│   /var/www    │          │   (PM2)       │
└───────────────┘          └───────┬───────┘
                                   │
                                   ▼
                          ┌───────────────┐
                          │    MySQL      │
                          │   (3306)      │
                          └───────────────┘
```

---

## 1. Prerequisiti sulla VPS

### Connessione SSH alla VPS
```bash
ssh root@TUO_IP_VPS
# oppure
ssh username@TUO_IP_VPS
```

### Aggiornare il sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Installare le dipendenze base
```bash
sudo apt install -y curl wget git build-essential
```

---

## 2. Installare Node.js 20 LTS

```bash
# Aggiungere il repository NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installare Node.js
sudo apt install -y nodejs

# Verificare l'installazione
node -v  # deve mostrare v20.x.x
npm -v   # deve mostrare 10.x.x
```

---

## 3. Installare MySQL 8

```bash
# Installare MySQL Server
sudo apt install -y mysql-server

# Avviare e abilitare MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Eseguire la configurazione sicura
sudo mysql_secure_installation
# Rispondi:
# - VALIDATE PASSWORD: Y (consigliato)
# - Password strength: 2 (STRONG)
# - Rimuovi utenti anonimi: Y
# - Disabilita root login remoto: Y
# - Rimuovi test database: Y
# - Reload privilege tables: Y
```

### Creare il database e l'utente
```bash
sudo mysql -u root -p
```

```sql
-- Creare il database
CREATE DATABASE swiss_consult_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Creare un utente dedicato (CAMBIA LA PASSWORD!)
CREATE USER 'swissconsult'@'localhost' IDENTIFIED BY 'TUA_PASSWORD_SICURA_QUI';

-- Concedere i privilegi
GRANT ALL PRIVILEGES ON swiss_consult_hub.* TO 'swissconsult'@'localhost';
FLUSH PRIVILEGES;

-- Verificare
SHOW DATABASES;
EXIT;
```

---

## 4. Installare Nginx

```bash
# Installare Nginx
sudo apt install -y nginx

# Avviare e abilitare
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificare lo stato
sudo systemctl status nginx
```

---

## 5. Installare PM2 (Process Manager per Node.js)

```bash
# Installare PM2 globalmente
sudo npm install -g pm2

# Configurare PM2 per avviarsi al boot
pm2 startup systemd
# Eseguire il comando che viene mostrato
```

---

## 6. Installare Certbot per SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 7. Configurare il Firewall

```bash
# Abilitare UFW
sudo ufw enable

# Permettere SSH (importante!)
sudo ufw allow ssh

# Permettere HTTP e HTTPS
sudo ufw allow 'Nginx Full'

# Verificare
sudo ufw status
```

---

## 8. Caricare il Progetto sulla VPS

### Opzione A: Git Clone (Consigliato)
```bash
# Creare la directory
sudo mkdir -p /var/www/swiss-consult-hub
sudo chown $USER:$USER /var/www/swiss-consult-hub

# Clonare il repository
cd /var/www
git clone TUO_REPO_GIT swiss-consult-hub
cd swiss-consult-hub
```

### Opzione B: Upload via SCP
```bash
# Dal tuo computer locale
scp -r /Users/vale/Desktop/swiss-consult-hub/* user@TUO_IP_VPS:/var/www/swiss-consult-hub/
```

### Opzione C: rsync (più efficiente per aggiornamenti)
```bash
# Dal tuo computer locale
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /Users/vale/Desktop/swiss-consult-hub/ \
  user@TUO_IP_VPS:/var/www/swiss-consult-hub/
```

---

## 9. Configurare le Variabili d'Ambiente

### Frontend (.env)
```bash
cd /var/www/swiss-consult-hub
nano .env
```

```env
# PRODUZIONE - Frontend
VITE_API_URL=https://TUO_DOMINIO.com/api
VITE_APP_NAME=Swiss Consult Hub
VITE_APP_VERSION=2.0.0
```

### Backend (server/.env)
```bash
nano server/.env
```

```env
# PRODUZIONE - Backend
PORT=3001
NODE_ENV=production

# Database (usa le credenziali create prima)
DB_HOST=localhost
DB_PORT=3306
DB_USER=swissconsult
DB_PASSWORD=TUA_PASSWORD_SICURA_QUI
DB_NAME=swiss_consult_hub

# JWT - GENERA UNA CHIAVE SICURA!
# Puoi generarla con: openssl rand -base64 64
JWT_SECRET=GENERA_UNA_CHIAVE_CASUALE_LUNGA_ALMENO_64_CARATTERI
JWT_EXPIRES_IN=7d

# CORS - il tuo dominio
CORS_ORIGIN=https://TUO_DOMINIO.com

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tua-email@gmail.com
SMTP_PASSWORD=tua-app-password
ADMIN_EMAIL=admin@tuodominio.com
ADMIN_URL=https://TUO_DOMINIO.com
```

### Generare JWT_SECRET sicuro
```bash
openssl rand -base64 64
# Copia l'output e usalo come JWT_SECRET
```

---

## 10. Installare le Dipendenze e Build

### Frontend
```bash
cd /var/www/swiss-consult-hub

# Installare dipendenze
npm install

# Build per produzione
npm run build
```

### Backend
```bash
cd /var/www/swiss-consult-hub/server

# Installare dipendenze
npm install

# Build TypeScript
npm run build

# Setup database (crea le tabelle)
npm run db:setup

# (Opzionale) Seed dati di test
# npm run db:seed
```

---

## 11. Configurare Nginx

### Creare la configurazione del sito
```bash
sudo nano /etc/nginx/sites-available/swiss-consult-hub
```

```nginx
# Configurazione Swiss Consult Hub
# Sostituisci TUO_DOMINIO.com con il tuo dominio reale

# Redirect HTTP -> HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name TUO_DOMINIO.com www.TUO_DOMINIO.com;

    # Per la verifica SSL di Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/swiss-consult-hub/dist;
    }

    # Redirect tutto il resto a HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Server HTTPS principale
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name TUO_DOMINIO.com www.TUO_DOMINIO.com;

    # SSL - i certificati saranno aggiunti da Certbot
    # ssl_certificate /etc/letsencrypt/live/TUO_DOMINIO.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/TUO_DOMINIO.com/privkey.pem;

    # SSL Optimization
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (optional, ma consigliato)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Root per i file statici del frontend
    root /var/www/swiss-consult-hub/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    gzip_comp_level 6;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API Backend - Proxy verso Node.js
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;

        # Per upload di file grandi
        client_max_body_size 50M;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # File uploads statici
    location /uploads {
        alias /var/www/swiss-consult-hub/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # Sicurezza: non eseguire script
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            return 403;
        }
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA Fallback - tutte le route vanno a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ ^/(\.env|package\.json|tsconfig\.json) {
        deny all;
    }

    # Logging
    access_log /var/log/nginx/swiss-consult-hub.access.log;
    error_log /var/log/nginx/swiss-consult-hub.error.log;
}
```

### Abilitare il sito
```bash
# Creare il symlink
sudo ln -s /etc/nginx/sites-available/swiss-consult-hub /etc/nginx/sites-enabled/

# Rimuovere il sito default (opzionale)
sudo rm /etc/nginx/sites-enabled/default

# Testare la configurazione
sudo nginx -t

# Se OK, ricaricare Nginx
sudo systemctl reload nginx
```

---

## 12. Configurare SSL con Let's Encrypt

### Prima: Configura il DNS
Assicurati che il tuo dominio punti all'IP della VPS:
- Record A: `TUO_DOMINIO.com` -> `IP_VPS`
- Record A: `www.TUO_DOMINIO.com` -> `IP_VPS`

### Ottenere il certificato SSL
```bash
sudo certbot --nginx -d TUO_DOMINIO.com -d www.TUO_DOMINIO.com
```

Certbot:
1. Chiederà la tua email
2. Chiederà di accettare i termini
3. Configurerà automaticamente Nginx con SSL

### Verificare il rinnovo automatico
```bash
sudo certbot renew --dry-run
```

---

## 13. Avviare il Backend con PM2

### Creare il file di configurazione PM2
```bash
nano /var/www/swiss-consult-hub/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'swiss-consult-backend',
    cwd: '/var/www/swiss-consult-hub/server',
    script: 'dist/server.js',
    instances: 'max', // Usa tutti i core CPU disponibili
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/swiss-consult-error.log',
    out_file: '/var/log/pm2/swiss-consult-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};
```

### Creare la directory per i log
```bash
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
```

### Avviare l'applicazione
```bash
cd /var/www/swiss-consult-hub

# Avviare con PM2
pm2 start ecosystem.config.js

# Verificare lo stato
pm2 status

# Vedere i log
pm2 logs swiss-consult-backend

# Salvare la configurazione per il riavvio automatico
pm2 save
```

---

## 14. Creare la Directory per gli Upload

```bash
# Creare la directory uploads
mkdir -p /var/www/swiss-consult-hub/server/uploads

# Impostare i permessi corretti
sudo chown -R www-data:www-data /var/www/swiss-consult-hub/server/uploads
sudo chmod -R 755 /var/www/swiss-consult-hub/server/uploads
```

---

## 15. Script di Deploy Automatico

Crea uno script per aggiornamenti futuri:

```bash
nano /var/www/swiss-consult-hub/deploy.sh
```

```bash
#!/bin/bash

# Swiss Consult Hub - Deploy Script
# Esegui con: ./deploy.sh

set -e

echo "🚀 Iniziando il deploy di Swiss Consult Hub..."

cd /var/www/swiss-consult-hub

# Pull delle ultime modifiche (se usi git)
echo "📥 Pull da git..."
git pull origin main

# Frontend
echo "📦 Installando dipendenze frontend..."
npm install

echo "🔨 Building frontend..."
npm run build

# Backend
echo "📦 Installando dipendenze backend..."
cd server
npm install

echo "🔨 Building backend..."
npm run build

# Riavviare PM2
echo "🔄 Riavviando il backend..."
cd ..
pm2 reload ecosystem.config.js

# Verificare lo stato
echo "✅ Stato del server:"
pm2 status

echo ""
echo "🎉 Deploy completato con successo!"
echo "🌐 Visita: https://TUO_DOMINIO.com"
```

```bash
chmod +x /var/www/swiss-consult-hub/deploy.sh
```

---

## 16. Comandi Utili

### PM2
```bash
pm2 status                    # Stato delle app
pm2 logs                      # Vedere i log in tempo reale
pm2 logs swiss-consult-backend --lines 100  # Ultimi 100 log
pm2 restart all               # Riavviare tutto
pm2 reload all                # Reload senza downtime
pm2 stop all                  # Fermare tutto
pm2 monit                     # Monitor in tempo reale
```

### Nginx
```bash
sudo nginx -t                 # Testare la configurazione
sudo systemctl reload nginx   # Ricaricare (senza downtime)
sudo systemctl restart nginx  # Riavviare
sudo tail -f /var/log/nginx/swiss-consult-hub.error.log  # Log errori
```

### MySQL
```bash
sudo mysql -u swissconsult -p swiss_consult_hub  # Connettersi al DB
sudo systemctl status mysql   # Stato MySQL
```

### Certbot
```bash
sudo certbot renew            # Rinnovare certificati
sudo certbot certificates     # Vedere certificati attivi
```

---

## 17. Troubleshooting

### Il sito non carica
```bash
# Verificare che Nginx sia attivo
sudo systemctl status nginx

# Verificare i log di Nginx
sudo tail -50 /var/log/nginx/swiss-consult-hub.error.log

# Verificare che il backend sia attivo
pm2 status
pm2 logs
```

### Errori 502 Bad Gateway
```bash
# Il backend potrebbe non essere attivo
pm2 status

# Verificare che la porta 3001 sia in uso
sudo lsof -i :3001

# Riavviare il backend
pm2 restart swiss-consult-backend
```

### Errori di database
```bash
# Verificare che MySQL sia attivo
sudo systemctl status mysql

# Testare la connessione
mysql -u swissconsult -p -e "SELECT 1"

# Verificare le credenziali nel .env
cat /var/www/swiss-consult-hub/server/.env | grep DB_
```

### Problemi di permessi
```bash
# Fix permessi per i file
sudo chown -R $USER:$USER /var/www/swiss-consult-hub
sudo chown -R www-data:www-data /var/www/swiss-consult-hub/server/uploads

# Fix permessi per i log PM2
sudo chown -R $USER:$USER /var/log/pm2
```

### SSL non funziona
```bash
# Verificare i certificati
sudo certbot certificates

# Rinnovare manualmente
sudo certbot renew --force-renewal

# Riavviare Nginx dopo
sudo systemctl restart nginx
```

---

## 18. Sicurezza Aggiuntiva (Opzionale ma Consigliata)

### Fail2ban (protezione brute force)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Backup automatico del database
```bash
# Creare script di backup
nano /var/www/swiss-consult-hub/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/swiss-consult-hub"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u swissconsult -pTUA_PASSWORD swiss_consult_hub > "$BACKUP_DIR/backup_$DATE.sql"

# Mantieni solo gli ultimi 7 backup
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completato: backup_$DATE.sql"
```

```bash
chmod +x /var/www/swiss-consult-hub/backup-db.sh

# Aggiungere al cron per backup giornaliero alle 2:00
crontab -e
# Aggiungere questa riga:
# 0 2 * * * /var/www/swiss-consult-hub/backup-db.sh
```

---

## 19. Checklist Finale

- [ ] Sistema Ubuntu aggiornato
- [ ] Node.js 20 installato
- [ ] MySQL 8 installato e configurato
- [ ] Database e utente creati
- [ ] Nginx installato
- [ ] PM2 installato
- [ ] Certbot installato
- [ ] Firewall configurato (UFW)
- [ ] Progetto caricato in `/var/www/swiss-consult-hub`
- [ ] File `.env` configurati (frontend e backend)
- [ ] JWT_SECRET generato e sicuro
- [ ] Frontend buildato (`npm run build`)
- [ ] Backend buildato (`npm run build` in server/)
- [ ] Database setup completato (`npm run db:setup`)
- [ ] Nginx configurato e testato
- [ ] DNS configurato (dominio -> IP VPS)
- [ ] SSL ottenuto con Certbot
- [ ] PM2 avviato e salvato
- [ ] Directory uploads creata con permessi corretti
- [ ] Sito accessibile via HTTPS
- [ ] Admin login funzionante

---

## Contatti e Supporto

Se hai problemi durante il deployment, verifica:
1. I log di PM2: `pm2 logs`
2. I log di Nginx: `sudo tail -f /var/log/nginx/swiss-consult-hub.error.log`
3. Lo stato dei servizi: `pm2 status`, `sudo systemctl status nginx mysql`
