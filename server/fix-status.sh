#!/bin/bash

# =================================================
# Script per aggiungere 'rifiutata' all'ENUM status
# =================================================

echo "🔧 Fix Status ENUM - Swiss Consult Hub"
echo "========================================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Controlla se .env esiste
if [ ! -f .env ]; then
    echo -e "${RED}❌ File .env non trovato!${NC}"
    echo "Crea un file .env con le credenziali del database."
    exit 1
fi

# Carica variabili .env
export $(cat .env | grep -v '^#' | xargs)

# Verifica variabili necessarie
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo -e "${RED}❌ Variabili DB mancanti in .env${NC}"
    echo "Assicurati di avere: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    exit 1
fi

echo -e "${YELLOW}📊 Database: $DB_NAME${NC}"
echo -e "${YELLOW}🖥️  Host: $DB_HOST${NC}"
echo -e "${YELLOW}👤 User: $DB_USER${NC}"
echo ""

# Chiedi conferma
read -p "Vuoi procedere con la fix? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operazione annullata"
    exit 0
fi

echo ""
echo "🔄 Applicazione fix..."

# Esegui lo script SQL
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" "$DB_NAME" < src/scripts/fix_status_enum.sql
else
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < src/scripts/fix_status_enum.sql
fi

# Verifica risultato
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Fix applicata con successo!${NC}"
    echo ""
    echo "📋 Status ENUM aggiornato:"
    echo "   - nuova"
    echo "   - in_lavorazione"
    echo "   - completata"
    echo "   - archiviata"
    echo "   - rifiutata ⬅️ AGGIUNTO"
    echo ""
    echo -e "${GREEN}🎉 Ora puoi rifiutare le richieste dal pannello admin!${NC}"
else
    echo ""
    echo -e "${RED}❌ Errore durante l'applicazione della fix${NC}"
    echo "Controlla i log sopra per dettagli"
    exit 1
fi
