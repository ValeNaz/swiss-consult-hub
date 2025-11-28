import nodemailer, { type Transporter } from 'nodemailer';
import type { Request, Attachment } from '../types/index.js';

// Configurazione transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || ''
    }
  };

  console.log('📧 Configurazione Email:', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    user: emailConfig.auth.user ? '✓ Configurato' : '✗ Mancante'
  });

  transporter = nodemailer.createTransport(emailConfig);

  return transporter;
}

// Email templates
function getServiceLabel(serviceType: string): string {
  const labels: Record<string, string> = {
    creditizia: 'Consulenza Creditizia',
    assicurativa: 'Consulenza Assicurativa',
    immobiliare: 'Consulenza Immobiliare',
    lavorativa: 'Consulenza Lavorativa',
    legale: 'Consulenza Legale',
    medica: 'Consulenza Medica',
    fiscale: 'Consulenza Fiscale'
  };
  return labels[serviceType] || 'Richiesta Generale';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    nuova: '🆕 Nuova',
    in_lavorazione: '⚙️ In lavorazione',
    completata: '✅ Completata',
    archiviata: '📦 Archiviata',
    rifiutata: '❌ Rifiutata'
  };
  return labels[status] || status;
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    bassa: '🟢 Bassa',
    media: '🟡 Media',
    alta: '🟠 Alta',
    urgente: '🔴 Urgente'
  };
  return labels[priority] || priority;
}

interface EmailNotification {
  request: Request;
  attachments?: Attachment[];
}

export const emailService = {
  /**
   * Invia email di notifica per nuova richiesta
   */
  async sendNewRequestNotification(data: EmailNotification): Promise<boolean> {
    try {
      const { request, attachments = [] } = data;

      // Email destinatario (admin)
      const adminEmail = process.env.ADMIN_EMAIL || 'valatria14@gmail.com';

      // Prepara lista allegati
      const attachmentsList = attachments.length > 0
        ? attachments.map(att => `
          <li>
            <strong>${att.name}</strong> (${(att.size / 1024).toFixed(1)} KB)
            <br/>
            <a href="${att.url}" style="color: #3b82f6; text-decoration: none;">📥 Scarica</a>
          </li>
        `).join('')
        : '<li>Nessun allegato</li>';

      // Prepara dati aggiuntivi da notes
      let additionalDataHtml = '';
      if (request.notes) {
        try {
          const notesData = JSON.parse(request.notes);
          const relevantFields = Object.entries(notesData).filter(
            ([key]) => !['submittedAt', 'source'].includes(key)
          );

          if (relevantFields.length > 0) {
            additionalDataHtml = `
              <h3 style="color: #374151; margin-top: 20px;">Dati Aggiuntivi</h3>
              <ul style="list-style: none; padding: 0;">
                ${relevantFields.map(([key, value]) => `
                  <li style="padding: 5px 0;">
                    <strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}
                  </li>
                `).join('')}
              </ul>
            `;
          }
        } catch (e) {
          // Notes non è JSON valido
        }
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuova Richiesta</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔔 Nuova Richiesta</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Swiss Consult Hub</p>
          </div>

          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="color: #111827; margin-top: 0;">Informazioni Richiesta</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Tipo:</td>
                  <td style="padding: 8px 0;">${getServiceLabel(request.service_type)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Stato:</td>
                  <td style="padding: 8px 0;">${getStatusLabel(request.status)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Priorità:</td>
                  <td style="padding: 8px 0;">${getPriorityLabel(request.priority || 'media')}</td>
                </tr>
                ${request.amount ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Importo:</td>
                  <td style="padding: 8px 0;">CHF ${request.amount.toLocaleString('it-CH', { minimumFractionDigits: 2 })}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Data:</td>
                  <td style="padding: 8px 0;">${new Date(request.created_at).toLocaleString('it-IT')}</td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
              <h2 style="color: #111827; margin-top: 0;">Dati Cliente</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Nome:</td>
                  <td style="padding: 8px 0;">${request.client_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${request.client_email}" style="color: #3b82f6; text-decoration: none;">${request.client_email}</a></td>
                </tr>
                ${request.client_phone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Telefono:</td>
                  <td style="padding: 8px 0;"><a href="tel:${request.client_phone}" style="color: #3b82f6; text-decoration: none;">${request.client_phone}</a></td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${request.description ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #111827; margin-top: 0;">Descrizione</h3>
              <p style="margin: 0; color: #4b5563;">${request.description}</p>
            </div>
            ` : ''}

            ${additionalDataHtml}

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #111827; margin-top: 0;">📎 Allegati (${attachments.length})</h3>
              <ul style="list-style: none; padding: 0; margin: 10px 0;">
                ${attachmentsList}
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/#/admin/requests/${request.id}"
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Visualizza nel Pannello Admin
              </a>
            </div>
          </div>

          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">Questa è una notifica automatica da Swiss Consult Hub</p>
            <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Swiss Consult Hub - Tutti i diritti riservati</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"Swiss Consult Hub" <${process.env.SMTP_USER || 'noreply@swissconsulthub.ch'}>`,
        to: adminEmail,
        subject: `🔔 Nuova Richiesta: ${getServiceLabel(request.service_type)} - ${request.client_name}`,
        html
      };

      console.log(`📧 Invio email a ${adminEmail}...`);

      const transport = getTransporter();
      await transport.sendMail(mailOptions);

      console.log(`✅ Email inviata con successo a ${adminEmail}`);
      return true;
    } catch (error: any) {
      console.error('❌ Errore invio email:', error.message);
      return false;
    }
  },

  /**
   * Test configurazione email
   */
  async testConnection(): Promise<boolean> {
    try {
      const transport = getTransporter();
      await transport.verify();
      console.log('✅ Connessione email verificata');
      return true;
    } catch (error: any) {
      console.error('❌ Errore connessione email:', error.message);
      return false;
    }
  }
};

export default emailService;
