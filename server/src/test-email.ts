import dotenv from 'dotenv';
import emailService from './services/emailService.js';

// Carica variabili ambiente
dotenv.config();

async function testEmailSetup() {
  console.log('\n📧 Test Configurazione Email\n');
  console.log('Variabili ambiente:');
  console.log('  ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  console.log('  SMTP_HOST:', process.env.SMTP_HOST);
  console.log('  SMTP_PORT:', process.env.SMTP_PORT);
  console.log('  SMTP_USER:', process.env.SMTP_USER);
  console.log('  SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✓ Configurata (nascosta)' : '✗ Mancante');
  console.log('\n');

  // Test connessione
  console.log('🔄 Test connessione SMTP...\n');
  const isConnected = await emailService.testConnection();

  if (isConnected) {
    console.log('\n✅ Connessione SMTP OK!');
    console.log('📧 Il sistema può inviare email');
  } else {
    console.log('\n❌ Connessione SMTP FALLITA');
    console.log('📝 Controlla la configurazione in server/.env');
    console.log('📖 Leggi server/EMAIL_SETUP.md per istruzioni');
  }

  process.exit(isConnected ? 0 : 1);
}

testEmailSetup().catch(error => {
  console.error('❌ Errore:', error.message);
  process.exit(1);
});
