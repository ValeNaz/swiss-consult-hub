#!/bin/bash

# Script per testare la creazione di una richiesta con allegato

echo "🧪 Test Creazione Richiesta con Allegato"
echo "=========================================="
echo ""

# 1. Login come admin
echo "1️⃣  Login come admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@swissconsult.ch",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Login fallito"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login riuscito"
echo ""

# 2. Crea una richiesta
echo "2️⃣  Creazione richiesta..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_name": "Test Cliente",
    "client_email": "test@example.com",
    "client_phone": "+41 78 123 45 67",
    "service_type": "creditizia",
    "status": "nuova",
    "priority": "alta",
    "description": "Richiesta di test con allegato",
    "amount": 50000
  }')

REQUEST_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)

if [ -z "$REQUEST_ID" ]; then
  echo "❌ Creazione richiesta fallita"
  echo "$CREATE_RESPONSE"
  exit 1
fi

echo "✅ Richiesta creata: $REQUEST_ID"
echo ""

# 3. Crea un file di test
echo "3️⃣  Creazione file di test..."
echo "Questo è un documento di test per Swiss Consult Hub" > /tmp/test-document.txt
echo "✅ File creato: /tmp/test-document.txt"
echo ""

# 4. Upload file
echo "4️⃣  Upload file..."
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:3001/api/requests/$REQUEST_ID/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-document.txt" \
  -F "documentType=test_document")

echo "$UPLOAD_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✅ File caricato con successo"
else
  echo "❌ Upload fallito"
  echo "$UPLOAD_RESPONSE"
  exit 1
fi
echo ""

# 5. Verifica allegati
echo "5️⃣  Verifica allegati..."
ATTACHMENTS_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/requests/$REQUEST_ID/attachments" \
  -H "Authorization: Bearer $TOKEN")

echo "$ATTACHMENTS_RESPONSE" | grep -q '"name":"test-document.txt"'
if [ $? -eq 0 ]; then
  echo "✅ Allegato trovato nel database"
  echo ""
  echo "📋 Dettagli allegato:"
  echo "$ATTACHMENTS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ATTACHMENTS_RESPONSE"
else
  echo "❌ Allegato non trovato"
  echo "$ATTACHMENTS_RESPONSE"
  exit 1
fi
echo ""

# 6. Ottieni richiesta completa
echo "6️⃣  Ottieni richiesta completa..."
REQUEST_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/requests/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$REQUEST_RESPONSE" | grep -q '"attachments"'
if [ $? -eq 0 ]; then
  echo "✅ Richiesta include allegati"
else
  echo "⚠️  Richiesta non include allegati"
fi
echo ""

echo "=========================================="
echo "✅ TEST COMPLETATO CON SUCCESSO!"
echo "=========================================="
echo ""
echo "📝 Puoi visualizzare la richiesta nel pannello admin:"
echo "   http://localhost:3000/#/admin/requests/$REQUEST_ID"
echo ""
