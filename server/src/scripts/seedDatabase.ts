/**
 * Script per popolare il database con dati di esempio
 * Esegui con: npm run db:seed
 */

import dotenv from 'dotenv';
import { UserModel } from '../models/User.js';
import { ClientModel } from '../models/Client.js';
import { RequestModel } from '../models/Request.js';
import { testConnection } from '../config/database.js';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Inizio seed database...\n');

    // Test connessione
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Impossibile connettersi al database');
      process.exit(1);
    }

    // =====================================================
    // CREA UTENTI
    // =====================================================
    console.log('👤 Creazione utenti...');

    const adminId = await UserModel.create({
      email: 'admin@swissconsult.ch',
      password: 'admin123',
      name: 'Admin Swiss Consult',
      role: 'admin',
      department: 'Management'
    });
    console.log('   ✅ Admin creato (admin@swissconsult.ch / admin123)');

    const operatorId = await UserModel.create({
      email: 'operator@swissconsult.ch',
      password: 'operator123',
      name: 'Maria Rossi',
      role: 'operator',
      department: 'Operations'
    });
    console.log('   ✅ Operator creato (operator@swissconsult.ch / operator123)');

    const consultantId = await UserModel.create({
      email: 'consultant@swissconsult.ch',
      password: 'consultant123',
      name: 'Giovanni Bianchi',
      role: 'consultant',
      department: 'Consulting'
    });
    console.log('   ✅ Consultant creato (consultant@swissconsult.ch / consultant123)');

    // =====================================================
    // CREA CLIENTI
    // =====================================================
    console.log('\n📋 Creazione clienti...');

    const client1Id = await ClientModel.create({
      first_name: 'Marco',
      last_name: 'Verdi',
      email: 'marco.verdi@email.ch',
      phone: '+41 79 123 4567',
      address: 'Via Principale 10',
      city: 'Lugano',
      canton: 'Ticino',
      postal_code: '6900',
      status: 'attivo'
    });
    console.log('   ✅ Cliente 1: Marco Verdi');

    const client2Id = await ClientModel.create({
      first_name: 'Laura',
      last_name: 'Neri',
      email: 'laura.neri@email.ch',
      phone: '+41 79 234 5678',
      address: 'Corso Italia 25',
      city: 'Bellinzona',
      canton: 'Ticino',
      postal_code: '6500',
      status: 'attivo'
    });
    console.log('   ✅ Cliente 2: Laura Neri');

    const client3Id = await ClientModel.create({
      first_name: 'Paolo',
      last_name: 'Gialli',
      email: 'paolo.gialli@email.ch',
      phone: '+41 79 345 6789',
      city: 'Locarno',
      canton: 'Ticino',
      postal_code: '6600',
      status: 'nuovo'
    });
    console.log('   ✅ Cliente 3: Paolo Gialli');

    // =====================================================
    // CREA RICHIESTE
    // =====================================================
    console.log('\n📝 Creazione richieste...');

    await RequestModel.create({
      client_name: 'Marco Verdi',
      client_email: 'marco.verdi@email.ch',
      client_phone: '+41 79 123 4567',
      service_type: 'creditizia',
      status: 'nuova',
      priority: 'alta',
      description: 'Richiesta finanziamento per acquisto prima casa',
      amount: 450000,
      assigned_to: operatorId,
      created_by: adminId
    });
    console.log('   ✅ Richiesta 1: Consulenza Creditizia (Marco Verdi)');

    await RequestModel.create({
      client_name: 'Laura Neri',
      client_email: 'laura.neri@email.ch',
      client_phone: '+41 79 234 5678',
      service_type: 'assicurativa',
      status: 'in_lavorazione',
      priority: 'media',
      description: 'Consulenza per assicurazione vita e malattia',
      assigned_to: consultantId,
      created_by: operatorId
    });
    console.log('   ✅ Richiesta 2: Consulenza Assicurativa (Laura Neri)');

    await RequestModel.create({
      client_name: 'Paolo Gialli',
      client_email: 'paolo.gialli@email.ch',
      client_phone: '+41 79 345 6789',
      service_type: 'fiscale',
      status: 'nuova',
      priority: 'media',
      description: 'Assistenza per dichiarazione fiscale annuale',
      created_by: adminId
    });
    console.log('   ✅ Richiesta 3: Consulenza Fiscale (Paolo Gialli)');

    await RequestModel.create({
      client_name: 'Marco Verdi',
      client_email: 'marco.verdi@email.ch',
      client_phone: '+41 79 123 4567',
      service_type: 'legale',
      status: 'completata',
      priority: 'bassa',
      description: 'Consulenza contratto di lavoro',
      assigned_to: consultantId,
      created_by: operatorId
    });
    console.log('   ✅ Richiesta 4: Consulenza Legale (Marco Verdi) [Completata]');

    await RequestModel.create({
      client_name: 'Anna Bianchi',
      client_email: 'anna.bianchi@email.ch',
      client_phone: '+41 79 456 7890',
      service_type: 'immobiliare',
      status: 'nuova',
      priority: 'urgente',
      description: 'Valutazione immobile per vendita',
      amount: 650000,
      created_by: adminId
    });
    console.log('   ✅ Richiesta 5: Consulenza Immobiliare (Anna Bianchi)');

    console.log('\n✅ Seed completato con successo!\n');
    console.log('==========================================');
    console.log('📊 Dati creati:');
    console.log('   - 3 Utenti');
    console.log('   - 3 Clienti');
    console.log('   - 5 Richieste');
    console.log('==========================================');
    console.log('\n🔐 Credenziali di accesso:');
    console.log('   Admin:      admin@swissconsult.ch / admin123');
    console.log('   Operator:   operator@swissconsult.ch / operator123');
    console.log('   Consultant: consultant@swissconsult.ch / consultant123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Errore durante seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
