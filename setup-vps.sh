#!/bin/bash

# Swiss Consult Hub - VPS Setup Script
# Esegui sulla VPS Ubuntu con: sudo bash setup-vps.sh
#
# IMPORTANTE: Esegui come root o con sudo

set -e

echo "=========================================="
echo "  Swiss Consult Hub - VPS Setup"
echo "=========================================="
echo ""

# Verificare che sia eseguito come root
if [ "$EUID" -ne 0 ]; then
    echo "Errore: Esegui questo script con sudo"
    echo "Uso: sudo bash setup-vps.sh"
    exit 1
fi

# Chiedere il dominio
read -p "Inserisci il tuo dominio (es: esempio.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "Errore: Dominio richiesto"
    exit 1
fi

# Chiedere la password MySQL
read -sp "Inserisci una password sicura per l'utente MySQL 'swissconsult': " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    echo "Errore: Password database richiesta"
    exit 1
fi

echo ""
echo "[1/10] Aggiornamento sistema..."
apt update && apt upgrade -y

echo ""
echo "[2/10] Installazione dipendenze base..."
apt install -y curl wget git build-essential

echo ""
echo "[3/10] Installazione Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js $(node -v) installato"
echo "npm $(npm -v) installato"

echo ""
echo "[4/10] Installazione MySQL..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

echo ""
echo "[5/10] Configurazione database MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS swiss_consult_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'swissconsult'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON swiss_consult_hub.* TO 'swissconsult'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "Database 'swiss_consult_hub' e utente 'swissconsult' creati"

echo ""
echo "[6/10] Installazione Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo ""
echo "[7/10] Installazione PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

echo ""
echo "[8/10] Installazione Certbot..."
apt install -y certbot python3-certbot-nginx

echo ""
echo "[9/10] Configurazione Firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "[10/10] Creazione directory..."
mkdir -p /var/www/swiss-consult-hub
mkdir -p /var/log/pm2

# Generare JWT Secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

echo ""
echo "=========================================="
echo "  Setup completato!"
echo "=========================================="
echo ""
echo "Prossimi passi:"
echo ""
echo "1. Carica il progetto in /var/www/swiss-consult-hub"
echo "   Opzione A (rsync dal tuo PC):"
echo "   rsync -avz --exclude 'node_modules' ./ root@$(curl -s ifconfig.me):/var/www/swiss-consult-hub/"
echo ""
echo "2. Configura i file .env:"
echo "   - /var/www/swiss-consult-hub/.env"
echo "   - /var/www/swiss-consult-hub/server/.env"
echo ""
echo "3. Usa queste credenziali per il database:"
echo "   DB_HOST=localhost"
echo "   DB_USER=swissconsult"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "   DB_NAME=swiss_consult_hub"
echo ""
echo "4. Usa questo JWT_SECRET:"
echo "   $JWT_SECRET"
echo ""
echo "5. Configura Nginx:"
echo "   sudo cp /var/www/swiss-consult-hub/nginx.conf.example /etc/nginx/sites-available/swiss-consult-hub"
echo "   sudo nano /etc/nginx/sites-available/swiss-consult-hub  # Cambia 'tuodominio.com' con '$DOMAIN'"
echo "   sudo ln -s /etc/nginx/sites-available/swiss-consult-hub /etc/nginx/sites-enabled/"
echo "   sudo rm /etc/nginx/sites-enabled/default"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "6. Configura DNS: Punta $DOMAIN e www.$DOMAIN a questo IP: $(curl -s ifconfig.me)"
echo ""
echo "7. Ottieni SSL:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "8. Esegui il deploy:"
echo "   cd /var/www/swiss-consult-hub && ./deploy.sh"
echo ""
echo "=========================================="
