/**
 * Nuovo Form Submission Service - Invia form tramite API REST
 */

import { requestsService, ServiceType } from './dataService.js';
import { fileUploadService } from './fileUploadService.js';

// Helper per mappare i tipi di servizio
const serviceTypeMap: Record<string, ServiceType> = {
  'creditizia': 'creditizia',
  'credit': 'creditizia',
  'loan': 'creditizia',
  'assicurativa': 'assicurativa',
  'insurance': 'assicurativa',
  'immobiliare': 'immobiliare',
  'realestate': 'immobiliare',
  'lavorativa': 'lavorativa',
  'job': 'lavorativa',
  'legale': 'legale',
  'legal': 'legale',
  'medica': 'medica',
  'medical': 'medica',
  'fiscale': 'fiscale',
  'tax': 'fiscale'
};

export interface FormSubmissionData {
  // Dati cliente
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Tipo servizio
  serviceType: string;

  // Descrizione/Note
  description?: string;
  notes?: string;

  // Altri dati opzionali
  address?: string;
  city?: string;
  postalCode?: string;
  dateOfBirth?: string;
  amount?: number;

  // Dati aggiuntivi (saranno salvati come JSON in notes)
  additionalData?: Record<string, any>;

  // File allegati
  files?: { file: File; documentType: string }[];
}

export const formSubmissionService = {
  /**
   * Invia una richiesta dal form pubblico
   */
  async submitRequest(data: FormSubmissionData): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      // Valida i dati minimi richiesti
      if (!data.firstName || !data.lastName || !data.email) {
        return {
          success: false,
          error: 'Nome, cognome e email sono obbligatori'
        };
      }

      // Mappa il tipo di servizio
      const serviceType = serviceTypeMap[data.serviceType.toLowerCase()] || 'creditizia';

      // Prepara i notes con tutti i dati aggiuntivi
      const notesData: Record<string, any> = {
        ...(data.additionalData || {}),
        submittedAt: new Date().toISOString(),
        source: 'website_form'
      };

      if (data.address) notesData.address = data.address;
      if (data.city) notesData.city = data.city;
      if (data.postalCode) notesData.postalCode = data.postalCode;
      if (data.dateOfBirth) notesData.dateOfBirth = data.dateOfBirth;

      // Crea la richiesta
      const requestData: any = {
        client_name: `${data.firstName} ${data.lastName}`,
        client_email: data.email,
        client_phone: data.phone,
        service_type: serviceType,
        status: 'nuova',
        priority: 'media',
        description: data.description || `Richiesta di consulenza ${serviceType}`,
        notes: JSON.stringify(notesData),
        ...(data.amount !== undefined && data.amount !== null && { amount: data.amount })
      };

      const requestId = await requestsService.create(requestData);

      // Upload file se presenti
      if (data.files && data.files.length > 0) {
        try {
          console.log(`📎 Uploading ${data.files.length} file(s) per richiesta ${requestId}...`);

          await fileUploadService.uploadMultipleFiles(
            data.files,
            requestId,
            (current, total, progress) => {
              console.log(`Upload ${current}/${total}: ${progress}%`);
            }
          );

          console.log(`✅ File caricati con successo`);
        } catch (uploadError) {
          console.error('Errore upload file:', uploadError);
          // Continua anche se l'upload fallisce
        }
      }

      // TODO: Inviare notifica email (da implementare nel backend)
      console.log(`📧 Email notification would be sent for request ${requestId}`);

      return {
        success: true,
        requestId
      };
    } catch (error: any) {
      console.error('Errore nell\'invio della richiesta:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'invio della richiesta'
      };
    }
  },

  /**
   * Helper per submission veloce con dati minimi
   */
  async submitQuickRequest(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    serviceType: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.submitRequest({
      firstName,
      lastName,
      email,
      phone,
      serviceType,
      description: message
    });
  }
};

export default formSubmissionService;
