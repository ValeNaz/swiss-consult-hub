import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione storage locale organizzato per requestId
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Estrai requestId dai parametri della richiesta
    const requestId = req.params.requestId || 'temp';
    const uploadPath = path.join(__dirname, '../../uploads/requests', requestId);

    // Crea la directory se non esiste
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitizza il nome del file
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);

    // Nome file: timestamp-nomeOriginale.ext
    const timestamp = Date.now();
    const filename = `${timestamp}-${baseName}${ext}`;

    cb(null, filename);
  }
});

// Validazione file
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Solo PDF per massima sicurezza
  const allowedMimeTypes = ['application/pdf'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo file PDF sono consentiti'));
  }
};

// Configurazione upload con limiti
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

export default upload;
