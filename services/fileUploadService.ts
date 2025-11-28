/**
 * File Upload Service - Upload tramite API REST al backend (storage locale)
 */

import { DEFAULT_MAX_UPLOAD_MB, validatePdfFile } from '../utils/fileValidation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface FileUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  fileName?: string;
  error?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
  path: string;
}

export interface Attachment {
  id: string;
  request_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  document_type?: string;
  uploaded_at: string;
}

export const fileUploadService = {
  /**
   * Upload di un singolo file
   */
  async uploadFile(
    file: File,
    requestId: string,
    documentType: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      // Valida il file
      const validation = validatePdfFile(file, DEFAULT_MAX_UPLOAD_MB);
      if (!validation.valid) {
        return { success: false, error: validation.message };
      }

      // Prepara FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      // Token autenticazione
      const token = localStorage.getItem('auth_token');

      // Upload con XMLHttpRequest per progress tracking
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        // Progress handler
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = (e.loaded / e.total) * 100;
              onProgress(Math.round(progress));
            }
          });
        }

        // Success/Error handler
        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);

              if (response.success && response.data) {
                resolve({
                  success: true,
                  url: response.data.url,
                  path: response.data.path,
                  fileName: response.data.name
                });
              } else {
                resolve({
                  success: false,
                  error: response.error || 'Errore upload'
                });
              }
            } catch (e) {
              resolve({
                success: false,
                error: 'Errore parsing risposta server'
              });
            }
          } else {
            resolve({
              success: false,
              error: `Errore HTTP ${xhr.status}`
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Errore di rete durante upload'
          });
        });

        xhr.addEventListener('abort', () => {
          resolve({
            success: false,
            error: 'Upload annullato'
          });
        });

        // Invia richiesta
        const token = localStorage.getItem('auth_token');
        const path = token ? `/requests/${requestId}/attachments` : `/public/requests/${requestId}/attachments`;
        xhr.open('POST', `${API_URL}${path}`);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message || 'Errore durante l\'upload del file'
      };
    }
  },

  /**
   * Upload multiplo di file
   */
  async uploadMultipleFiles(
    files: { file: File; documentType: string }[],
    requestId: string,
    onProgress?: (current: number, total: number, fileProgress: number) => void
  ): Promise<{ results: FileUploadResult[]; metadata: FileMetadata[] }> {
    const results: FileUploadResult[] = [];
    const metadata: FileMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      const { file, documentType } = files[i];

      const result = await this.uploadFile(file, requestId, documentType, (progress) => {
        if (onProgress) {
          onProgress(i + 1, files.length, progress);
        }
      });

      results.push(result);

      if (result.success && result.url && result.path) {
        metadata.push({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          url: result.url,
          path: result.path
        });
      }
    }

    return { results, metadata };
  },

  /**
   * Elimina un file
   */
  async deleteFile(requestId: string, attachmentId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${API_URL}/requests/${requestId}/attachments/${attachmentId}`,
        {
          method: 'DELETE',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  /**
   * Ottieni allegati di una richiesta
   */
  async getAttachments(requestId: string): Promise<Attachment[]> {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${API_URL}/requests/${requestId}/attachments`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      return [];
    } catch (error) {
      console.error('Error getting attachments:', error);
      return [];
    }
  },

  /**
   * Elimina tutti i file di una richiesta (lato backend)
   */
  async deleteRequestFiles(requestId: string): Promise<void> {
    // Questa funzione viene gestita automaticamente dal backend quando si elimina una richiesta
    console.log(`Files for request ${requestId} will be deleted on server side`);
  },

  /**
   * Verifica se un file esiste (non necessario con REST API)
   */
  async fileExists(storagePath: string): Promise<boolean> {
    // Non implementato - gestito dal backend
    return true;
  }
};

export default fileUploadService;
