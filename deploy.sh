#!/bin/bash

# Swiss Consult Hub - Deploy Script
# Esegui con: ./deploy.sh

set -e

echo "=========================================="
echo "  Swiss Consult Hub - Deploy Script"
echo "=========================================="
echo ""

cd /var/www/swiss-consult-hub

# Pull delle ultime modifiche (se usi git)
if [ -d ".git" ]; then
    echo "[1/6] Pull da git..."
    git pull origin main
else
    echo "[1/6] Skip git pull (non è un repository git)"
fi

# Frontend
echo ""
echo "[2/6] Installando dipendenze frontend..."
npm install --production=false

echo ""
echo "[3/6] Building frontend..."
npm run build

# Backend
echo ""
echo "[4/6] Installando dipendenze backend..."
cd server
npm install --production=false

echo ""
echo "[5/6] Building backend..."
npm run build

# Riavviare PM2
echo ""
echo "[6/6] Riavviando il backend..."
cd ..

if pm2 list | grep -q "swiss-consult-backend"; then
    pm2 reload ecosystem.config.js --update-env
else
    pm2 start ecosystem.config.js
fi

# Salvare configurazione PM2
pm2 save

# Verificare lo stato
echo ""
echo "=========================================="
echo "  Stato del server:"
echo "=========================================="
pm2 status

echo ""
echo "=========================================="
echo "  Deploy completato con successo!"
echo "=========================================="
echo ""
echo "Comandi utili:"
echo "  pm2 logs             - Vedere i log"
echo "  pm2 monit            - Monitor in tempo reale"
echo "  pm2 restart all      - Riavviare"
echo ""
