#!/bin/bash

echo "🔍 Verifica stato Swiss Consult Hub"
echo "===================================="
echo ""

# Verifica server frontend
echo "📱 Frontend (Vite):"
if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ✅ Server frontend attivo su porta 3000"
else
    echo "   ❌ Server frontend NON attivo"
fi
echo ""

# Verifica server backend
echo "🔧 Backend (Express):"
if lsof -i :3001 > /dev/null 2>&1; then
    echo "   ✅ Server backend attivo su porta 3001"
    
    # Test health endpoint
    HEALTH=$(curl -s http://localhost:3001/health)
    if [ $? -eq 0 ]; then
        echo "   ✅ Health check OK: $HEALTH"
    else
        echo "   ❌ Health check FAILED"
    fi
else
    echo "   ❌ Server backend NON attivo"
fi
echo ""

# Verifica MySQL
echo "💾 Database MySQL:"
if mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
    echo "   ✅ MySQL attivo e accessibile"
    
    # Verifica database
    if mysql -u root -e "USE swiss_consult_hub; SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
        USER_COUNT=$(mysql -u root -e "USE swiss_consult_hub; SELECT COUNT(*) as count FROM users;" -N -B | tail -1)
        echo "   ✅ Database 'swiss_consult_hub' OK - $USER_COUNT utenti"
    else
        echo "   ⚠️  Database 'swiss_consult_hub' non trovato o tabelle mancanti"
    fi
else
    echo "   ❌ MySQL NON attivo o non accessibile"
fi
echo ""

# Test API endpoint
echo "🌐 Test API:"
AUTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/auth/profile)
if [ "$AUTH_TEST" = "401" ] || [ "$AUTH_TEST" = "403" ]; then
    echo "   ✅ API auth endpoint risponde (HTTP $AUTH_TEST)"
elif [ "$AUTH_TEST" = "000" ]; then
    echo "   ❌ API non raggiungibile"
else
    echo "   ⚠️  API risponde con codice inatteso: $AUTH_TEST"
fi
echo ""

echo "===================================="
echo "✨ Verifica completata"
