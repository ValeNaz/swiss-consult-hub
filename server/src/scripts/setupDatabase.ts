/**
 * Script per creare il database e le tabelle
 * Esegui con: npm run db:setup
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('🚀 Inizio setup database...\n');

    // Connessione senza specificare il database (per crearlo)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connesso a MySQL');

    // Leggi il file schema-simple.sql
    const schemaPath = path.join(__dirname, 'schema-simple.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    console.log('📄 Caricato schema-simple.sql\n');

    // Esegui lo schema
    console.log('🔨 Creazione database e tabelle...');
    await connection.query(schema);

    console.log('\n✅ Database e tabelle creati con successo!');
    console.log('\n📊 Tabelle create:');
    console.log('   - users');
    console.log('   - clients');
    console.log('   - requests');
    console.log('   - attachments');
    console.log('   - user_permissions');
    console.log('   - activity_log');
    console.log('\n📌 Views create:');
    console.log('   - vw_requests_detail');
    console.log('   - vw_client_stats\n');

    console.log('✅ Setup completato! Puoi ora eseguire "npm run db:seed" per inserire dati di esempio.\n');
  } catch (error) {
    console.error('\n❌ Errore durante setup database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
