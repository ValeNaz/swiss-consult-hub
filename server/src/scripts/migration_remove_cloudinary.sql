-- =====================================================
-- MIGRATION: Rimozione Cloudinary dal sistema allegati
-- =====================================================

USE swiss_consult_hub;

-- Rimuovi la colonna cloudinary_public_id dalla tabella attachments
-- Usa DROP COLUMN senza IF EXISTS per compatibilità MySQL 5.7
ALTER TABLE attachments DROP COLUMN cloudinary_public_id;

-- Verifica struttura aggiornata
DESCRIBE attachments;
