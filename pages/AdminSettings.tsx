/**
 * ============================================
 * ADMIN SETTINGS - PANNELLO COMPLETO FUNZIONANTE
 * ============================================
 * Gestione completa: Profilo, Sicurezza, Notifiche, Sistema
 */

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Save,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building2,
  Check,
  AlertCircle,
  X,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Briefcase
} from 'lucide-react';
import { authService } from '../services/authService';
import type { User as UserType } from '../types/admin.types';
import '../styles/AdminSettings.css';

type TabType = 'profile' | 'security' | 'notifications' | 'system';

const AdminSettingsComplete: React.FC = () => {
  const { t } = useTranslation('admin');  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone_number: '',
    department: ''
  });

  // Security Data
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notifications Data
  const [notificationsData, setNotificationsData] = useState({
    emailEnabled: true,
    newRequestNotif: true,
    assignmentNotif: true,
    completionNotif: true,
    statusChangeNotif: true,
    clientNotif: true,
    dailyDigest: false,
    weeklyReport: true
  });

  // System Data
  const [systemData, setSystemData] = useState({
    language: 'it',
    timezone: 'Europe/Zurich',
    dateFormat: 'DD/MM/YYYY',
    autoBackup: true,
    maintenanceMode: false
  });

  useEffect(() => {
    loadCurrentUser();
    loadNotificationPreferences();
    loadSystemSettings();
  }, []);

  const loadCurrentUser = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        department: user.department || ''
      });
    }
  };

  const loadNotificationPreferences = () => {
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      setNotificationsData(JSON.parse(saved));
    }
  };

  const loadSystemSettings = () => {
    const saved = localStorage.getItem('system_settings');
    if (saved) {
      setSystemData(JSON.parse(saved));
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);

    try {
      await authService.updateProfile(profileData);
      showMessage('success', 'Profilo aggiornato con successo');
      loadCurrentUser();
    } catch (error: any) {
      showMessage('error', error.message || 'Errore aggiornamento profilo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      showMessage('error', 'Compila tutti i campi');
      return;
    }

    if (securityData.newPassword.length < 6) {
      showMessage('error', 'La password deve essere di almeno 6 caratteri');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      showMessage('error', 'Le nuove password non coincidono');
      return;
    }

    setIsLoading(true);

    try {
      await authService.changePassword(securityData.currentPassword, securityData.newPassword);
      showMessage('success', 'Password cambiata con successo');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      showMessage('error', error.message || 'Errore cambio password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notification_preferences', JSON.stringify(notificationsData));
    showMessage('success', 'Preferenze notifiche salvate');
  };

  const handleSaveSystemSettings = () => {
    localStorage.setItem('system_settings', JSON.stringify(systemData));
    showMessage('success', 'Impostazioni sistema salvate');
  };

  const handleExportData = () => {
    const data = {
      profile: profileData,
      notifications: notificationsData,
      system: systemData,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage('success', 'Export impostazioni completato');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.notifications) {
          setNotificationsData(data.notifications);
          localStorage.setItem('notification_preferences', JSON.stringify(data.notifications));
        }

        if (data.system) {
          setSystemData(data.system);
          localStorage.setItem('system_settings', JSON.stringify(data.system));
        }

        showMessage('success', 'Impostazioni importate con successo');
      } catch (error) {
        showMessage('error', 'File non valido');
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (!window.confirm('Vuoi davvero cancellare la cache?')) return;

    // Clear specific cache items (mantieni auth)
    const itemsToKeep = ['auth_token', 'auth_user'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!itemsToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    showMessage('success', 'Cache cancellata con successo');
  };

  return (
    <div className="admin-settings">
      {/* Message */}
      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="page-title">{t('settings.title', { defaultValue: 'Impostazioni' })}</h1>
          <p className="page-subtitle">{t('settings.subtitle', { defaultValue: 'Gestisci le tue preferenze e configurazioni' })}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          {t('settings.tabs.profile', { defaultValue: 'Profilo' })}
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={20} />
          {t('settings.tabs.security', { defaultValue: 'Sicurezza' })}
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={20} />
          {t('settings.tabs.notifications', { defaultValue: 'Notifiche' })}
        </button>
        <button
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <Database size={20} />
          {t('settings.tabs.system', { defaultValue: 'Sistema' })}
        </button>
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>{t('settings.profile.title', { defaultValue: 'Informazioni Profilo' })}</h2>
              <p>{t('settings.profile.subtitle', { defaultValue: 'Gestisci le tue informazioni personali e di contatto' })}</p>
            </div>

            <div className="settings-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('settings.profile.fullName', { defaultValue: 'Nome Completo' })}</label>
                  <div className="input-icon">
                    <User size={20} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Mario Rossi"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('settings.profile.email', { defaultValue: 'Email' })}</label>
                  <div className="input-icon">
                    <Mail size={20} />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="mario.rossi@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('settings.profile.phone', { defaultValue: 'Telefono' })}</label>
                  <div className="input-icon">
                    <Phone size={20} />
                    <input
                      type="tel"
                      value={profileData.phone_number}
                      onChange={e => setProfileData({ ...profileData, phone_number: e.target.value })}
                      placeholder="+41 123 456 789"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('settings.profile.department', { defaultValue: 'Reparto' })}</label>
                  <div className="input-icon">
                    <Briefcase size={20} />
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={e => setProfileData({ ...profileData, department: e.target.value })}
                      placeholder="IT, Vendite, Amministrazione"
                    />
                  </div>
                </div>
              </div>

              <div className="section-footer">
                <button
                  className="btn-primary"
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                >
                  <Save size={20} />
                  {isLoading ? t('settings.saving', { defaultValue: 'Salvataggio...' }) : t('settings.profile.save', { defaultValue: 'Salva Profilo' })}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>{t('settings.security.title', { defaultValue: 'Sicurezza Account' })}</h2>
              <p>{t('settings.security.subtitle', { defaultValue: 'Gestisci la password e le impostazioni di sicurezza' })}</p>
            </div>

            <div className="settings-form">
              <div className="form-group">
                <label>{t('settings.security.currentPassword', { defaultValue: 'Password Attuale' })}</label>
                <div className="input-icon">
                  <Lock size={20} />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    placeholder={t('settings.security.currentPlaceholder', { defaultValue: 'Inserisci password attuale' })}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{t('settings.security.newPassword', { defaultValue: 'Nuova Password' })}</label>
                <div className="input-icon">
                  <Lock size={20} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder={t('settings.security.minChars', { defaultValue: 'Minimo 6 caratteri' })}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{t('settings.security.confirmPassword', { defaultValue: 'Conferma Nuova Password' })}</label>
                <div className="input-icon">
                  <Lock size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder={t('settings.security.confirmPlaceholder', { defaultValue: 'Ripeti nuova password' })}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="section-footer">
                <button
                  className="btn-primary"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                >
                  <Shield size={20} />
                  {isLoading ? t('admin.settings.changing', { defaultValue: 'Cambio...' }) : t('admin.settings.security.changePassword', { defaultValue: 'Cambia Password' })}
                </button>
              </div>
            </div>

            <div className="info-box">
              <Shield size={20} />
              <div>
                <strong>{t('admin.settings.security.tipsTitle', { defaultValue: 'Suggerimenti per la sicurezza' })}</strong>
                <ul>
                  <li>{t('admin.settings.security.tip1', { defaultValue: 'Usa almeno 6 caratteri' })}</li>
                  <li>{t('admin.settings.security.tip2', { defaultValue: 'Combina lettere maiuscole e minuscole' })}</li>
                  <li>{t('admin.settings.security.tip3', { defaultValue: 'Aggiungi numeri e simboli' })}</li>
                  <li>{t('admin.settings.security.tip4', { defaultValue: 'Non usare password facilmente indovinabili' })}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>{t('settings.notifications.title', { defaultValue: 'Preferenze Notifiche' })}</h2>
              <p>{t('settings.notifications.subtitle', { defaultValue: 'Scegli quali notifiche ricevere' })}</p>
            </div>

            <div className="settings-form">
              <div className="toggle-section">
                <h3>{t('settings.notifications.emailTitle', { defaultValue: 'Notifiche Email' })}</h3>
                
                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>{t('settings.notifications.emailEnabled', { defaultValue: 'Abilita Notifiche Email' })}</strong>
                    <p>{t('settings.notifications.emailDesc', { defaultValue: 'Ricevi notifiche tramite email' })}</p>
                  </div>
                  <button
                    className="toggle-button"
                    onClick={() => setNotificationsData({ ...notificationsData, emailEnabled: !notificationsData.emailEnabled })}
                  >
                    {notificationsData.emailEnabled ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                  </button>
                </div>

                {notificationsData.emailEnabled && (
                  <>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <strong>{t('settings.notifications.newRequests', { defaultValue: 'Nuove Richieste' })}</strong>
                        <p>{t('settings.notifications.newRequestsDesc', { defaultValue: 'Notifica quando arriva una nuova richiesta' })}</p>
                      </div>
                      <button
                        className="toggle-button"
                        onClick={() => setNotificationsData({ ...notificationsData, newRequestNotif: !notificationsData.newRequestNotif })}
                      >
                        {notificationsData.newRequestNotif ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <strong>{t('settings.notifications.assignments', { defaultValue: 'Assegnazioni' })}</strong>
                        <p>{t('settings.notifications.assignmentsDesc', { defaultValue: 'Notifica quando ti viene assegnata una richiesta' })}</p>
                      </div>
                      <button
                        className="toggle-button"
                        onClick={() => setNotificationsData({ ...notificationsData, assignmentNotif: !notificationsData.assignmentNotif })}
                      >
                        {notificationsData.assignmentNotif ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <strong>{t('settings.notifications.completions', { defaultValue: 'Completamenti' })}</strong>
                        <p>{t('settings.notifications.completionsDesc', { defaultValue: 'Notifica quando una richiesta viene completata' })}</p>
                      </div>
                      <button
                        className="toggle-button"
                        onClick={() => setNotificationsData({ ...notificationsData, completionNotif: !notificationsData.completionNotif })}
                      >
                        {notificationsData.completionNotif ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <strong>{t('settings.notifications.statusChanges', { defaultValue: 'Cambi di Stato' })}</strong>
                        <p>{t('settings.notifications.statusChangesDesc', { defaultValue: 'Notifica per ogni cambio di stato delle richieste' })}</p>
                      </div>
                      <button
                        className="toggle-button"
                        onClick={() => setNotificationsData({ ...notificationsData, statusChangeNotif: !notificationsData.statusChangeNotif })}
                      >
                        {notificationsData.statusChangeNotif ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                      </button>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <strong>{t('settings.notifications.newClients', { defaultValue: 'Nuovi Clienti' })}</strong>
                        <p>{t('settings.notifications.newClientsDesc', { defaultValue: 'Notifica quando si registra un nuovo cliente' })}</p>
                      </div>
                      <button
                        className="toggle-button"
                        onClick={() => setNotificationsData({ ...notificationsData, clientNotif: !notificationsData.clientNotif })}
                      >
                        {notificationsData.clientNotif ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="toggle-section">
                <h3>{t('settings.notifications.periodicReports', { defaultValue: 'Report Periodici' })}</h3>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>{t('settings.notifications.dailyDigest', { defaultValue: 'Riepilogo Giornaliero' })}</strong>
                    <p>{t('settings.notifications.dailyDigestDesc', { defaultValue: 'Ricevi un riepilogo giornaliero delle attività' })}</p>
                  </div>
                  <button
                    className="toggle-button"
                    onClick={() => setNotificationsData({ ...notificationsData, dailyDigest: !notificationsData.dailyDigest })}
                  >
                    {notificationsData.dailyDigest ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                  </button>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>{t('settings.notifications.weeklyReport', { defaultValue: 'Report Settimanale' })}</strong>
                    <p>{t('settings.notifications.weeklyReportDesc', { defaultValue: 'Ricevi un report settimanale completo' })}</p>
                  </div>
                  <button
                    className="toggle-button"
                    onClick={() => setNotificationsData({ ...notificationsData, weeklyReport: !notificationsData.weeklyReport })}
                  >
                    {notificationsData.weeklyReport ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                  </button>
                </div>
              </div>

              <div className="section-footer">
                <button className="btn-primary" onClick={handleSaveNotifications}>
                  <Save size={20} />
                  {t('settings.notifications.save', { defaultValue: 'Salva Preferenze' })}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>{t('settings.system.title', { defaultValue: 'Configurazioni Sistema' })}</h2>
              <p>{t('settings.system.subtitle', { defaultValue: 'Gestisci le impostazioni generali del sistema' })}</p>
            </div>

            <div className="settings-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('settings.system.language', { defaultValue: 'Lingua' })}</label>
                  <select
                    value={systemData.language}
                    onChange={e => setSystemData({ ...systemData, language: e.target.value })}
                  >
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('settings.system.timezone', { defaultValue: 'Fuso Orario' })}</label>
                  <select
                    value={systemData.timezone}
                    onChange={e => setSystemData({ ...systemData, timezone: e.target.value })}
                  >
                    <option value="Europe/Zurich">Europa/Zurigo</option>
                    <option value="Europe/Rome">Europa/Roma</option>
                    <option value="Europe/Berlin">Europa/Berlino</option>
                    <option value="Europe/Paris">Europa/Parigi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('settings.system.dateFormat', { defaultValue: 'Formato Data' })}</label>
                  <select
                    value={systemData.dateFormat}
                    onChange={e => setSystemData({ ...systemData, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">GG/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/GG/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-GG</option>
                  </select>
                </div>
              </div>

              <div className="toggle-section">
                <h3>{t('settings.system.options', { defaultValue: 'Opzioni Sistema' })}</h3>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>{t('settings.system.autoBackup', { defaultValue: 'Backup Automatico' })}</strong>
                    <p>{t('settings.system.autoBackupDesc', { defaultValue: 'Esegui backup automatici quotidiani' })}</p>
                  </div>
                  <button
                    className="toggle-button"
                    onClick={() => setSystemData({ ...systemData, autoBackup: !systemData.autoBackup })}
                  >
                    {systemData.autoBackup ? <ToggleRight size={40} color="#059669" /> : <ToggleLeft size={40} />}
                  </button>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>{t('settings.system.maintenance', { defaultValue: 'Modalità Manutenzione' })}</strong>
                    <p>{t('settings.system.maintenanceDesc', { defaultValue: "Disabilita l'accesso degli utenti non admin" })}</p>
                  </div>
                  <button
                    className="toggle-button"
                    onClick={() => setSystemData({ ...systemData, maintenanceMode: !systemData.maintenanceMode })}
                  >
                    {systemData.maintenanceMode ? <ToggleRight size={40} color="#dc143c" /> : <ToggleLeft size={40} />}
                  </button>
                </div>
              </div>

              <div className="section-footer">
                <button className="btn-primary" onClick={handleSaveSystemSettings}>
                  <Save size={20} />
                  {t('settings.system.save', { defaultValue: 'Salva Impostazioni' })}
                </button>
              </div>
            </div>

            <div className="system-actions">
              <h3>{t('settings.system.actionsTitle', { defaultValue: 'Azioni Sistema' })}</h3>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={handleExportData}>
                  <Download size={20} />
                  {t('settings.system.export', { defaultValue: 'Esporta Impostazioni' })}
                </button>

                <label className="btn-secondary">
                  <Upload size={20} />
                  {t('settings.system.import', { defaultValue: 'Importa Impostazioni' })}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                </label>

                <button className="btn-warning" onClick={handleClearCache}>
                  <Trash2 size={20} />
                  {t('settings.system.clearCache', { defaultValue: 'Cancella Cache' })}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsComplete;
