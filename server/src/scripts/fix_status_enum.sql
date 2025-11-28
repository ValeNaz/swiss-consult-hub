-- =====================================================
-- FIX: Aggiunta 'rifiutata' all'ENUM status
-- =====================================================
-- Questo script aggiunge 'rifiutata' all'ENUM di status se non presente

ALTER TABLE requests 
MODIFY COLUMN status ENUM('nuova', 'in_lavorazione', 'completata', 'archiviata', 'rifiutata') 
NOT NULL DEFAULT 'nuova';

-- Verifica che la modifica sia stata applicata
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'requests' 
  AND COLUMN_NAME = 'status'
  AND TABLE_SCHEMA = DATABASE();
