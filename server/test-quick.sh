#!/bin/bash

# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swissconsult.ch","password":"admin123"}' | \
  grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Login fallito"
  exit 1
fi

echo "✅ Login OK"

# Crea richiesta
REQ=$(curl -s -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_name":"Test Client",
    "client_email":"test@test.com",
    "client_phone":"+41781234567",
    "service_type":"creditizia",
    "description":"Test request"
  }')

REQ_ID=$(echo $REQ | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)

if [ -z "$REQ_ID" ]; then
  echo "❌ Creazione fallita: $REQ"
  exit 1
fi

echo "✅ Richiesta creata: $REQ_ID"

# Crea file test
echo "Test document" > /tmp/test.txt

# Upload
UP=$(curl -s -X POST "http://localhost:3001/api/requests/$REQ_ID/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.txt")

echo "$UP" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo "✅ File caricato"
  echo ""
  echo "📋 Vedi richiesta: http://localhost:3000/#/admin/requests/$REQ_ID"
else
  echo "❌ Upload fallito: $UP"
fi
