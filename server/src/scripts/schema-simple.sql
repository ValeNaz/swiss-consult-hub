-- =====================================================
-- SCHEMA DATABASE: swiss_consult_hub (Versione Semplificata)
-- Sistema di gestione richieste e clienti
-- =====================================================

CREATE DATABASE IF NOT EXISTS swiss_consult_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE swiss_consult_hub;

-- =====================================================
-- Tabella USERS (Utenti del sistema - Admin/Operatori)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'consultant', 'viewer') NOT NULL DEFAULT 'viewer',
  avatar VARCHAR(500) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  phone_number VARCHAR(50) DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabella CLIENTS (Clienti)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT NULL,
  fiscal_code VARCHAR(50) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  canton VARCHAR(50) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  status ENUM('nuovo', 'attivo', 'inattivo') NOT NULL DEFAULT 'nuovo',
  total_requests INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_full_name (last_name, first_name),
  FULLTEXT idx_search (first_name, last_name, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabella REQUESTS (Richieste)
-- =====================================================
CREATE TABLE IF NOT EXISTS requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) DEFAULT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) DEFAULT NULL,
  service_type ENUM(
    'creditizia',
    'assicurativa',
    'immobiliare',
    'lavorativa',
    'legale',
    'medica',
    'fiscale'
  ) NOT NULL,
  status ENUM('nuova', 'in_lavorazione', 'completata', 'archiviata', 'rifiutata') NOT NULL DEFAULT 'nuova',
  priority ENUM('bassa', 'media', 'alta', 'urgente') DEFAULT 'media',
  description TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  amount DECIMAL(12, 2) DEFAULT NULL,
  assigned_to VARCHAR(36) DEFAULT NULL,
  created_by VARCHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_client_id (client_id),
  INDEX idx_service_type (service_type),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_created_at (created_at),
  FULLTEXT idx_search (client_name, client_email, description, notes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabella ATTACHMENTS (Allegati)
-- =====================================================
CREATE TABLE IF NOT EXISTS attachments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  request_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  document_type VARCHAR(100) DEFAULT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  INDEX idx_request_id (request_id),
  INDEX idx_document_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabella USER_PERMISSIONS (Permessi utenti)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_permission (user_id, permission),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabella ACTIVITY_LOG (Log attività - opzionale)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VIEWS per query ottimizzate
-- =====================================================

-- Vista per richieste con dettagli cliente e assegnatario
CREATE OR REPLACE VIEW vw_requests_detail AS
SELECT
  r.*,
  c.first_name AS client_first_name,
  c.last_name AS client_last_name,
  c.phone AS client_phone_alt,
  c.status AS client_status,
  u.name AS assigned_to_name,
  u.email AS assigned_to_email,
  creator.name AS created_by_name,
  (SELECT COUNT(*) FROM attachments a WHERE a.request_id = r.id) AS attachments_count
FROM requests r
LEFT JOIN clients c ON r.client_id = c.id
LEFT JOIN users u ON r.assigned_to = u.id
LEFT JOIN users creator ON r.created_by = creator.id;

-- Vista per statistiche clienti
CREATE OR REPLACE VIEW vw_client_stats AS
SELECT
  c.*,
  COUNT(r.id) AS actual_requests_count,
  MAX(r.created_at) AS last_request_date,
  SUM(CASE WHEN r.status = 'completata' THEN 1 ELSE 0 END) AS completed_requests,
  SUM(CASE WHEN r.status = 'in_lavorazione' THEN 1 ELSE 0 END) AS in_progress_requests
FROM clients c
LEFT JOIN requests r ON c.id = r.client_id
GROUP BY c.id;
