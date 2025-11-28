import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, CreditCard, Home, AlertCircle } from 'lucide-react';
import '../styles/DocumentPreparationReminder.css';

interface DocumentPreparationReminderProps {
    variant?: 'default' | 'compact';
}

const DocumentPreparationReminder: React.FC<DocumentPreparationReminderProps> = ({ variant = 'default' }) => {
    const { t } = useTranslation('forms');
    const requiredDocuments = [
        {
            icon: <FileText size={20} />,
            title: t('documentReminder.documents.identity'),
            description: t('documentReminder.documents.identityDesc')
        },
        {
            icon: <CheckCircle size={20} />,
            title: t('documentReminder.documents.taxCode'),
            description: t('documentReminder.documents.taxCodeDesc')
        },
        {
            icon: <CreditCard size={20} />,
            title: t('documentReminder.documents.income'),
            description: t('documentReminder.documents.incomeDesc')
        },
        {
            icon: <Home size={20} />,
            title: t('documentReminder.documents.banking'),
            description: t('documentReminder.documents.bankingDesc')
        }
    ];

    const attachmentDocuments = t('documentReminder.attachments.items', {
        returnObjects: true
    }) as string[];

    const quickChecklist = attachmentDocuments.slice(0, 4);

    if (variant === 'compact') {
        return (
            <div className="document-reminder-compact">
                <div className="reminder-compact-header">
                    <div className="reminder-icon">📄</div>
                    <div className="reminder-content">
                        <h4 className="reminder-title">{t('documentReminder.title')}</h4>
                        <p className="reminder-description">
                            {t('documentReminder.subtitle')}
                        </p>
                    </div>
                </div>
                <ul className="reminder-compact-list">
                    {quickChecklist.map((doc) => (
                        <li key={doc}>{doc}</li>
                    ))}
                </ul>
                <p className="reminder-compact-hint">{t('documentReminder.compactHint')}</p>
            </div>
        );
    }

    return (
        <div className="document-reminder">
            <div className="reminder-header">
                <div className="reminder-icon-large">📄</div>
                <h3 className="reminder-heading">{t('documentReminder.completed')}</h3>
                <p className="reminder-intro">
                    {t('documentReminder.completedDesc')}
                </p>
            </div>

            <div className="reminder-grid">
                {requiredDocuments.map((doc, index) => (
                    <div key={index} className="reminder-card">
                        <div className="reminder-card-icon">
                            {doc.icon}
                        </div>
                        <div className="reminder-card-content">
                            <h4 className="reminder-card-title">{doc.title}</h4>
                            <p className="reminder-card-description">{doc.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="reminder-attachments-section">
                <div className="attachments-header">
                    <AlertCircle size={20} />
                    <h4 className="attachments-title">{t('documentReminder.attachments.title')}</h4>
                </div>
                <ul className="attachments-list">
                    {attachmentDocuments.map((doc, index) => (
                        <li key={index} className="attachment-item">
                            <span className="attachment-bullet">✓</span>
                            <span className="attachment-text">{doc}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="reminder-tip">
                <strong>{t('documentReminder.tip')}</strong> Avere tutti i documenti pronti riduce i tempi di elaborazione della tua richiesta e aumenta le possibilità di approvazione rapida.
            </div>
        </div>
    );
};

export default DocumentPreparationReminder;
