import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importa configurazioni
import { testConnection } from './config/database.js';

// Importa routes
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Importa middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Configurazione dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inizializza Express
const app: Application = express();
const PORT = process.env.PORT || 3001;

// =====================================================
// MIDDLEWARE
// =====================================================

// Security middleware
app.use(helmet());

// CORS configuration - allow multiple origins for development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging (solo in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploads folder (statico)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =====================================================
// ROUTES
// =====================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/public', publicRoutes);

// Route non trovata
app.use(notFound);

// Error handler (deve essere l'ultimo middleware)
app.use(errorHandler);

// =====================================================
// START SERVER
// =====================================================

async function startServer() {
  try {
    // Test connessione database
    console.log('🔌 Connessione al database MySQL...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Impossibile connettersi al database. Verifica le configurazioni in .env');
      process.exit(1);
    }

    // Avvia server
    app.listen(PORT, () => {
      console.log('\n==============================================');
      console.log(`✅ Server avviato su porta ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponibili su: http://localhost:${PORT}/api`);
      console.log('==============================================\n');

      // Mostra routes disponibili
      console.log('📋 API Routes:');
      console.log('   POST   /api/auth/login');
      console.log('   POST   /api/auth/register (admin only)');
      console.log('   GET    /api/auth/profile');
      console.log('   PUT    /api/auth/profile');
      console.log('   POST   /api/auth/change-password');
      console.log('   POST   /api/auth/logout');
      console.log('');
      console.log('   GET    /api/clients');
      console.log('   GET    /api/clients/:id');
      console.log('   POST   /api/clients');
      console.log('   PUT    /api/clients/:id');
      console.log('   DELETE /api/clients/:id');
      console.log('   GET    /api/clients/stats');
      console.log('');
      console.log('   GET    /api/requests');
      console.log('   GET    /api/requests/:id');
      console.log('   POST   /api/requests');
      console.log('   PUT    /api/requests/:id');
      console.log('   DELETE /api/requests/:id');
      console.log('   GET    /api/requests/stats');
      console.log('   GET    /api/requests/:requestId/attachments');
      console.log('   POST   /api/requests/:requestId/attachments');
      console.log('   DELETE /api/requests/:requestId/attachments/:attachmentId');
      console.log('');
      console.log('   POST   /api/public/requests');
      console.log('   POST   /api/public/requests/:requestId/attachments');
      console.log('\n==============================================\n');
    });
  } catch (error) {
    console.error('❌ Errore durante l\'avvio del server:', error);
    process.exit(1);
  }
}

// Gestione errori non gestiti
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Avvia il server
startServer();

export default app;
