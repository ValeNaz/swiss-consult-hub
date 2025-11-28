import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formSubmissionService } from '../services/formSubmissionService';
import type { SimulatorDataV2 } from './CreditCalculatorV2';
import { validatePdfFile, DEFAULT_MAX_UPLOAD_MB } from '../utils/fileValidation';
import { DOCUMENT_REQUIREMENTS, DOCUMENT_UPLOAD_FIELDS, DocumentUploadField } from '../constants/documentRequirements';
import PhoneInputSmart from './form/PhoneInputSmart';
import EmailInputSmart from './form/EmailInputSmart';
import SmartInput from './form/SmartInput';
import AddressInputSmart from './form/AddressInputSmart';
import '../styles/LoanRequestModalV2.css';

interface LoanRequestModalV2Props {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    // Calculator data
    loanAmount?: number;
    duration?: number;
    monthlyPayment?: number;
    property?: string;
    guarantee?: string;

    // Step 1: Personal Details
    gender: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    maritalStatus: string;
    nationality: string;
    phone: string;
    phoneKind: string;
    email: string;
    privacyAccepted: boolean;
    country: string;
    postalCode: string;
    city: string;
    street: string;
    streetNo: string;
    ownHomePersonal: string;

    // Step 2: Occupation and Income
    employmentStatus: string;
    employerCompany: string;
    employerStreet: string;
    employerStreetNo: string;
    employerPostalCode: string;
    employerCity: string;
    contractType: string;
    tenureMonth: string;
    tenureYear: string;
    commuteMode: string;
    carNecessity: string;
    netMonthlyIncome: string;
    thirteenthSalary: string;
    bonus: string;
    hasSecondaryEmployment: string;
    hasAdditionalIncome: string;
    beneficialOwner: string;

    // Step 3: Living and Expenses
    housing: string;
    housingRent: string;
    childrenInHousehold: string;
    payAlimony: string;

    // Step 4: Additional Questions
    heavyShiftNightWork: string;
    financialObligations: string;
    financialObligationsMonthly: string;
    debtEnforcementsLast3y: string;

    // Step 5: Credit Protection
    creditGuaranteeAgreement: string;
    comments: string;

    // Step 6: Documents
    betreibungsauszugCurrent?: File | null;
    betreibungsauszugPrevious?: File | null;
    documentoPersonale?: File | null;
    permessoSoggiorno?: File | null;
    bustePaga?: File | null;
    contrattoLavoro?: File | null;
    contrattoAffitto?: File | null;
    polizzaAssicurazione?: File | null;
    autenticaPermesso?: File | null;
    contrattoCredito?: File | null;
}

type DocumentField = Extract<keyof FormData, DocumentUploadField>;
const FILE_FIELDS: DocumentField[] = DOCUMENT_UPLOAD_FIELDS as DocumentField[];

const FORM_STORAGE_KEY = 'loan_request_form_v2';
const STEP_STORAGE_KEY = 'loan_request_step_v2';

const LoanRequestModalV2: React.FC<LoanRequestModalV2Props> = ({ isOpen, onClose }) => {
    const { t } = useTranslation('forms');
    const [currentStep, setCurrentStep] = useState(1);
    const [simulatorData, setSimulatorData] = useState<SimulatorDataV2 | null>(null);
    const [formData, setFormData] = useState<FormData>({
        gender: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        maritalStatus: '',
        nationality: '',
        phone: '',
        phoneKind: 'mobile',
        email: '',
        privacyAccepted: false,
        country: '',
        postalCode: '',
        city: '',
        street: '',
        streetNo: '',
        ownHomePersonal: '',
        employmentStatus: '',
        employerCompany: '',
        employerStreet: '',
        employerStreetNo: '',
        employerPostalCode: '',
        employerCity: '',
        contractType: '',
        tenureMonth: '',
        tenureYear: '',
        commuteMode: '',
        carNecessity: '',
        netMonthlyIncome: '',
        thirteenthSalary: '',
        bonus: '',
        hasSecondaryEmployment: '',
        hasAdditionalIncome: '',
        beneficialOwner: '',
        housing: '',
        housingRent: '',
        childrenInHousehold: '',
        payAlimony: '',
        heavyShiftNightWork: '',
        financialObligations: '',
        financialObligationsMonthly: '',
        debtEnforcementsLast3y: '',
        creditGuaranteeAgreement: '',
        comments: ''
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 6;
    const stepTitles = [
        t('loanRequest.steps.personalDetails'),
        t('loanRequest.steps.occupationIncome'),
        t('loanRequest.steps.livingExpenses'),
        t('loanRequest.steps.additionalQuestions'),
        t('loanRequest.steps.creditProtection'),
        t('loanRequest.steps.documents')
    ];

    // Load simulator and form data
    useEffect(() => {
        if (!isOpen) return;

        const savedSimulator = sessionStorage.getItem('credit_simulator_data');
        if (savedSimulator) {
            try {
                const parsed: SimulatorDataV2 = JSON.parse(savedSimulator);
                setSimulatorData(parsed);
                setFormData(prev => ({
                    ...prev,
                    loanAmount: parsed.amount,
                    duration: parsed.duration,
                    monthlyPayment: parsed.minMonthlyPayment,
                    property: parsed.property,
                    guarantee: parsed.guarantee
                }));
            } catch (error) {
                console.error('Error loading simulator data:', error);
            }
        }

        const savedForm = sessionStorage.getItem(FORM_STORAGE_KEY);
        if (savedForm) {
            try {
                const parsed = JSON.parse(savedForm);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Error loading form draft:', error);
            }
        }

        const savedStep = sessionStorage.getItem(STEP_STORAGE_KEY);
        if (savedStep) {
            const parsedStep = parseInt(savedStep, 10);
            if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= totalSteps) {
                setCurrentStep(parsedStep);
            }
        }
    }, [isOpen, totalSteps]);

    // Auto-save form data
    useEffect(() => {
        if (!isOpen) return;

        const timeout = setTimeout(() => {
            try {
                const persistable: Record<string, any> = { ...formData };
                FILE_FIELDS.forEach((field) => {
                    persistable[field] = null;
                });
                sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(persistable));
                sessionStorage.setItem(STEP_STORAGE_KEY, String(currentStep));
            } catch (error) {
                console.warn('Unable to persist form data:', error);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [formData, currentStep, isOpen]);

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setFieldErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleFileChange = useCallback((field: DocumentField, file: File | null) => {
        if (file) {
            const validation = validatePdfFile(file);
            if (!validation.valid) {
                const message = t(`loanRequest.fileErrors.${validation.errorKey}`, {
                    max: validation.maxSizeMB || DEFAULT_MAX_UPLOAD_MB
                });
                setFileErrors(prev => ({ ...prev, [field]: message }));
                setFormData(prev => ({ ...prev, [field]: null }));
                return;
            }
        }

        setFileErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
        setFormData(prev => ({ ...prev, [field]: file }));
    }, [t]);

    const validateCurrentStep = (): boolean => {
        const errors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.gender) errors.gender = t('loanRequest.validation.salutationRequired');
            if (!formData.firstName) errors.firstName = t('loanRequest.validation.firstNameRequired');
            if (!formData.lastName) errors.lastName = t('loanRequest.validation.lastNameRequired');
            if (!formData.dateOfBirth) errors.dateOfBirth = t('loanRequest.validation.dobRequired');
            if (!formData.maritalStatus) errors.maritalStatus = t('loanRequest.validation.civilStatusRequired');
            if (!formData.phone) errors.phone = t('loanRequest.validation.phoneRequired');
            if (!formData.email) errors.email = t('loanRequest.validation.emailRequired');
            if (!formData.privacyAccepted) errors.privacyAccepted = t('loanRequest.validation.privacyRequired');
            if (!formData.postalCode) errors.postalCode = t('loanRequest.validation.postalCodeRequired');
            if (!formData.city) errors.city = t('loanRequest.validation.cityRequired');
            if (!formData.street) errors.street = t('loanRequest.validation.streetRequired');
            if (!formData.streetNo) errors.streetNo = t('loanRequest.validation.houseNumberRequired');
            if (!formData.ownHomePersonal) errors.ownHomePersonal = t('loanRequest.validation.ownsHomeRequired');
        }

        if (currentStep === 2) {
            if (!formData.employmentStatus) errors.employmentStatus = t('loanRequest.validation.professionalSituationRequired');
            if (formData.employmentStatus === 'Employed' || formData.employmentStatus === 'Self-employed') {
                if (!formData.employerCompany) errors.employerCompany = t('loanRequest.validation.companyRequired');
                if (!formData.contractType) errors.contractType = t('loanRequest.validation.employmentRelationshipRequired');
            }
            if (!formData.netMonthlyIncome) errors.netMonthlyIncome = t('loanRequest.validation.netMonthlyIncomeRequired');
        }

        if (currentStep === 3) {
            if (!formData.housing) errors.housing = t('loanRequest.validation.housingSituationRequired');
            if (!formData.housingRent) errors.housingRent = t('loanRequest.validation.housingCostsRequired');
            if (!formData.childrenInHousehold) errors.childrenInHousehold = t('loanRequest.validation.hasChildrenRequired');
            if (!formData.payAlimony) errors.payAlimony = t('loanRequest.validation.paysAlimonyRequired');
        }

        if (currentStep === 4) {
            if (!formData.heavyShiftNightWork) errors.heavyShiftNightWork = t('loanRequest.validation.heavyLaborRequired');
            if (!formData.financialObligations) errors.financialObligations = t('loanRequest.validation.hasObligationsRequired');
            if (!formData.debtEnforcementsLast3y) errors.debtEnforcementsLast3y = t('loanRequest.validation.debtEnforcementsRequired');
        }

        if (currentStep === 5) {
            if (!formData.creditGuaranteeAgreement) errors.creditGuaranteeAgreement = t('loanRequest.validation.creditProtectionInsuranceRequired');
        }

        if (currentStep === 6) {
            DOCUMENT_REQUIREMENTS.forEach(({ field, optional }) => {
                if (!optional && !formData[field]) {
                    errors[field] = t(`loanRequest.documents.${field}Required`);
                }
            });
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep() || isSubmitting) return;

        try {
            setIsSubmitting(true);

            const filesToUpload: { file: File; documentType: string }[] = [];
            FILE_FIELDS.forEach(field => {
                const file = formData[field];
                if (file) {
                    filesToUpload.push({ file, documentType: field });
                }
            });

            const result = await formSubmissionService.submitRequest({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                serviceType: 'creditizia',
                description: `Richiesta prestito di CHF ${formData.loanAmount || 0} per ${formData.duration || 0} mesi. ${formData.comments || ''}`,
                amount: formData.loanAmount,
                address: `${formData.street} ${formData.streetNo}`,
                city: formData.city,
                postalCode: formData.postalCode,
                dateOfBirth: formData.dateOfBirth,
                additionalData: {
                    ...formData,
                    ...(simulatorData && { simulatorData })
                },
                files: filesToUpload.length > 0 ? filesToUpload : undefined
            });

            if (result.success) {
                sessionStorage.removeItem('credit_simulator_data');
                sessionStorage.removeItem(FORM_STORAGE_KEY);
                sessionStorage.removeItem(STEP_STORAGE_KEY);
                alert('✅ Richiesta inviata con successo! Ti contatteremo presto.');
                onClose();
            } else {
                alert(`${t('loanRequest.messages.error')}: ${result.error || ''}`);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert(t('loanRequest.messages.errorGeneric'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-v2" onClick={onClose}>
            <div className="modal-content-v2" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-v2" onClick={onClose}>&times;</button>

                <div className="modal-header-v2">
                    <h2>{t('loanRequest.title')}</h2>
                    <div className="modal-progress-v2">
                        <div className="progress-bar-v2">
                            <div
                                className="progress-fill-v2"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            />
                        </div>
                        <div className="progress-text-v2">
                            {t('loanRequest.step')} {currentStep} {t('loanRequest.of')} {totalSteps}: {stepTitles[currentStep - 1]}
                        </div>
                    </div>
                </div>

                <div className="modal-body-v2">
                    {/* Show simulator summary at top of first step */}
                    {currentStep === 1 && simulatorData && (
                        <div className="simulator-summary-v2">
                            <div className="summary-title">✅ {t('loanRequest.simulatorLoaded')}</div>
                            <div className="summary-grid">
                                <div>
                                    <strong>CHF {simulatorData.amount.toLocaleString('de-CH')}</strong>
                                    <span>{t('loanRequest.loanAmount')}</span>
                                </div>
                                <div>
                                    <strong>{simulatorData.duration} {t('loanRequest.months')}</strong>
                                    <span>{t('loanRequest.duration')}</span>
                                </div>
                                <div>
                                    <strong>CHF {simulatorData.minMonthlyPayment.toFixed(2)}</strong>
                                    <span>{t('loanRequest.estimatedPayment')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error display */}
                    {Object.keys(fieldErrors).length > 0 && (
                        <div className="error-box-v2">
                            <strong>{t('loanRequest.errorTitle')}</strong>
                            <ul>
                                {Object.values(fieldErrors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Step 1: Personal Details */}
                    {currentStep === 1 && (
                        <div className="form-step-v2">
                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.salutation')} <span className="required">*</span>
                                </label>
                                <div className="button-group-v2">
                                    <button
                                        type="button"
                                        className={formData.gender === 'mr' ? 'active' : ''}
                                        onClick={() => handleChange('gender', 'mr')}
                                    >
                                        {t('loanRequest.options.salutations.mr')}
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.gender === 'ms' ? 'active' : ''}
                                        onClick={() => handleChange('gender', 'ms')}
                                    >
                                        {t('loanRequest.options.salutations.ms')}
                                    </button>
                                </div>
                            </div>

                            <div className="field-row-v2">
                                <div className="field-group-v2">
                                    <label>
                                        {t('loanRequest.fields.firstName')} <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        placeholder={t('loanRequest.placeholders.firstName')}
                                    />
                                </div>
                                <div className="field-group-v2">
                                    <label>
                                        {t('loanRequest.fields.lastName')} <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        placeholder={t('loanRequest.placeholders.lastName')}
                                    />
                                </div>
                            </div>

                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.dateOfBirth')} <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                />
                            </div>

                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.civilStatus')} <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.maritalStatus}
                                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                                >
                                    <option value="">Seleziona...</option>
                                    <option value="single">{t('loanRequest.options.civilStatus.single')}</option>
                                    <option value="married">{t('loanRequest.options.civilStatus.married')}</option>
                                    <option value="widowed">{t('loanRequest.options.civilStatus.widowed')}</option>
                                    <option value="divorced">{t('loanRequest.options.civilStatus.divorced')}</option>
                                    <option value="separated">{t('loanRequest.options.civilStatus.separated')}</option>
                                </select>
                            </div>

                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.nationality')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => handleChange('nationality', e.target.value)}
                                />
                            </div>

                            <PhoneInputSmart
                                value={formData.phone}
                                onChange={(value) => handleChange('phone', value)}
                                error={fieldErrors.phone}
                                label={t('loanRequest.fields.telephoneNumber')}
                                required
                            />

                            <EmailInputSmart
                                value={formData.email}
                                onChange={(value) => handleChange('email', value)}
                                error={fieldErrors.email}
                                label={t('loanRequest.fields.emailAddress')}
                                required
                            />

                            <div className="field-group-v2">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.privacyAccepted}
                                        onChange={(e) => handleChange('privacyAccepted', e.target.checked)}
                                    />
                                    <span>{t('loanRequest.fields.privacyStatement')}</span>
                                </label>
                            </div>

                            <h4 className="section-title-v2">{t('loanRequest.sections.residenceAddress')}</h4>

                            <AddressInputSmart
                                street={formData.street}
                                streetNumber={formData.streetNo}
                                onStreetChange={(value) => handleChange('street', value)}
                                onStreetNumberChange={(value) => handleChange('streetNo', value)}
                                onAddressSelect={(details) => {
                                    // Auto-fill opzionale dai suggerimenti Google
                                    if (details.city) handleChange('city', details.city);
                                    if (details.postalCode) handleChange('postalCode', details.postalCode);
                                    if (details.country) handleChange('country', details.country);
                                }}
                                errorStreet={fieldErrors.street}
                                errorStreetNumber={fieldErrors.streetNo}
                                enableAutocomplete={true}
                                restrictToCountry={false}
                                showHelper={false}
                                placeholder={t('loanRequest.fields.street') || 'Type your address...'}
                            />

                            <div className="field-row-v2">
                                <div className="field-group-v2">
                                    <SmartInput
                                        label={t('loanRequest.fields.postalCode') || 'Postal Code'}
                                        value={formData.postalCode}
                                        onChange={(value) => handleChange('postalCode', value)}
                                        required={true}
                                        error={fieldErrors.postalCode}
                                        placeholder="Enter postal code..."
                                        hint="Will auto-fill if you select an address suggestion above"
                                    />
                                </div>
                                <div className="field-group-v2">
                                    <SmartInput
                                        label={t('loanRequest.fields.city') || 'City'}
                                        value={formData.city}
                                        onChange={(value) => handleChange('city', value)}
                                        required={true}
                                        error={fieldErrors.city}
                                        placeholder="Enter city..."
                                        hint="Will auto-fill if you select an address suggestion above"
                                    />
                                </div>
                            </div>

                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.ownsHome')} <span className="required">*</span>
                                </label>
                                <div className="button-group-v2">
                                    <button
                                        type="button"
                                        className={formData.ownHomePersonal === 'Yes' ? 'active' : ''}
                                        onClick={() => handleChange('ownHomePersonal', 'Yes')}
                                    >
                                        {t('loanRequest.options.yesNo.yes')}
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.ownHomePersonal === 'No' ? 'active' : ''}
                                        onClick={() => handleChange('ownHomePersonal', 'No')}
                                    >
                                        {t('loanRequest.options.yesNo.no')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Occupation and Income */}
                    {currentStep === 2 && (
                        <div className="form-step-v2">
                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.professionalSituation')} <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.employmentStatus}
                                    onChange={(e) => handleChange('employmentStatus', e.target.value)}
                                >
                                    <option value="">Seleziona...</option>
                                    <option value="Employed">{t('loanRequest.options.professionalSituations.employed')}</option>
                                    <option value="Self-employed">{t('loanRequest.options.professionalSituations.selfEmployed')}</option>
                                    <option value="Pensioner OAS">{t('loanRequest.options.professionalSituations.pensionerOld')}</option>
                                    <option value="Pensioner Disability">{t('loanRequest.options.professionalSituations.pensionerDisability')}</option>
                                    <option value="Housewife">{t('loanRequest.options.professionalSituations.housewife')}</option>
                                </select>
                            </div>

                            {(formData.employmentStatus === 'Employed' || formData.employmentStatus === 'Self-employed') && (
                                <>
                                    <h4 className="section-title-v2">{t('loanRequest.sections.employerData')}</h4>

                                    <div className="field-group-v2">
                                        <label>
                                            {t('loanRequest.fields.company')} <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.employerCompany}
                                            onChange={(e) => handleChange('employerCompany', e.target.value)}
                                        />
                                    </div>

                                    <div className="field-row-v2">
                                        <div className="field-group-v2 flex-3">
                                            <label>{t('loanRequest.fields.street')}</label>
                                            <input
                                                type="text"
                                                value={formData.employerStreet}
                                                onChange={(e) => handleChange('employerStreet', e.target.value)}
                                            />
                                        </div>
                                        <div className="field-group-v2 flex-1">
                                            <label>{t('loanRequest.fields.houseNumber')}</label>
                                            <input
                                                type="text"
                                                value={formData.employerStreetNo}
                                                onChange={(e) => handleChange('employerStreetNo', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="field-row-v2">
                                        <div className="field-group-v2">
                                            <label>{t('loanRequest.fields.postalCode')}</label>
                                            <input
                                                type="text"
                                                value={formData.employerPostalCode}
                                                onChange={(e) => handleChange('employerPostalCode', e.target.value)}
                                            />
                                        </div>
                                        <div className="field-group-v2">
                                            <label>{t('loanRequest.fields.city')}</label>
                                            <input
                                                type="text"
                                                value={formData.employerCity}
                                                onChange={(e) => handleChange('employerCity', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="field-group-v2">
                                        <label>
                                            {t('loanRequest.fields.employmentRelationship')} <span className="required">*</span>
                                        </label>
                                        <select
                                            value={formData.contractType}
                                            onChange={(e) => handleChange('contractType', e.target.value)}
                                        >
                                            <option value="">Seleziona...</option>
                                            <option value="permanent">{t('loanRequest.options.employmentRelationships.permanent')}</option>
                                            <option value="temporary">{t('loanRequest.options.employmentRelationships.temporary')}</option>
                                            <option value="fixedTerm">{t('loanRequest.options.employmentRelationships.fixedTerm')}</option>
                                        </select>
                                    </div>

                                    <div className="field-row-v2">
                                        <div className="field-group-v2">
                                            <label>{t('loanRequest.fields.employmentMonths')}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="11"
                                                value={formData.tenureMonth}
                                                onChange={(e) => handleChange('tenureMonth', e.target.value)}
                                            />
                                        </div>
                                        <div className="field-group-v2">
                                            <label>{t('loanRequest.fields.employmentYears')}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.tenureYear}
                                                onChange={(e) => handleChange('tenureYear', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="field-group-v2">
                                        <label>{t('loanRequest.fields.commutingMethod')}</label>
                                        <select
                                            value={formData.commuteMode}
                                            onChange={(e) => handleChange('commuteMode', e.target.value)}
                                        >
                                            <option value="">Seleziona...</option>
                                            <option value="Car">{t('loanRequest.options.commutingMethods.car')}</option>
                                            <option value="Public">{t('loanRequest.options.commutingMethods.public')}</option>
                                            <option value="Motorcycle">{t('loanRequest.options.commutingMethods.motorcycle')}</option>
                                            <option value="Bicycle">{t('loanRequest.options.commutingMethods.bicycle')}</option>
                                            <option value="On foot">{t('loanRequest.options.commutingMethods.onFoot')}</option>
                                        </select>
                                    </div>

                                    {formData.commuteMode === 'Car' && (
                                        <div className="field-group-v2">
                                            <label>{t('loanRequest.fields.carNecessary')}</label>
                                            <div className="button-group-v2">
                                                <button
                                                    type="button"
                                                    className={formData.carNecessity === 'Yes' ? 'active' : ''}
                                                    onClick={() => handleChange('carNecessity', 'Yes')}
                                                >
                                                    {t('loanRequest.options.yesNo.yes')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className={formData.carNecessity === 'No' ? 'active' : ''}
                                                    onClick={() => handleChange('carNecessity', 'No')}
                                                >
                                                    {t('loanRequest.options.yesNo.no')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <h4 className="section-title-v2">{t('loanRequest.sections.income')}</h4>

                            <SmartInput
                                type="number"
                                value={formData.netMonthlyIncome}
                                onChange={(value) => handleChange('netMonthlyIncome', value)}
                                label={t('loanRequest.fields.netMonthlyIncome')}
                                placeholder={t('loanRequest.placeholders.netMonthlyIncome')}
                                required
                                error={fieldErrors.netMonthlyIncome}
                                icon="💰"
                                tooltip="Inserisci il tuo reddito mensile netto in CHF. Questo è l'importo che ricevi effettivamente dopo le deduzioni fiscali e contributive."
                                min={1000}
                                validate={(value) => {
                                    const num = parseFloat(value);
                                    return num >= 1000 && num <= 100000;
                                }}
                            />

                            <div className="field-row-v2">
                                <div className="field-group-v2">
                                    <label>{t('loanRequest.fields.has13thSalary')}</label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.thirteenthSalary === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('thirteenthSalary', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.thirteenthSalary === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('thirteenthSalary', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                                <div className="field-group-v2">
                                    <label>{t('loanRequest.fields.hasBonus')}</label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.bonus === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('bonus', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.bonus === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('bonus', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="field-row-v2">
                                <div className="field-group-v2">
                                    <label>{t('loanRequest.fields.hasSecondaryEmployment')}</label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.hasSecondaryEmployment === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('hasSecondaryEmployment', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.hasSecondaryEmployment === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('hasSecondaryEmployment', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                                <div className="field-group-v2">
                                    <label>{t('loanRequest.fields.hasAdditionalIncome')}</label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.hasAdditionalIncome === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('hasAdditionalIncome', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.hasAdditionalIncome === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('hasAdditionalIncome', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="field-group-v2">
                                <label>{t('loanRequest.fields.beneficialOwnership')}</label>
                                <select
                                    value={formData.beneficialOwner}
                                    onChange={(e) => handleChange('beneficialOwner', e.target.value)}
                                >
                                    <option value="">Seleziona...</option>
                                    <option value="self">{t('loanRequest.options.beneficialOwnership.mine')}</option>
                                    <option value="another">{t('loanRequest.options.beneficialOwnership.other')}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Living and Expenses */}
                    {currentStep === 3 && (
                        <div className="form-step-v2">
                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.housingSituation')} <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.housing}
                                    onChange={(e) => handleChange('housing', e.target.value)}
                                >
                                    <option value="">Seleziona...</option>
                                    <option value="partner">{t('loanRequest.options.housingSituations.partner')}</option>
                                    <option value="alone">{t('loanRequest.options.housingSituations.alone')}</option>
                                    <option value="shared">{t('loanRequest.options.housingSituations.shared')}</option>
                                    <option value="parents">{t('loanRequest.options.housingSituations.withParents')}</option>
                                    <option value="singleParent">{t('loanRequest.options.housingSituations.singleParent')}</option>
                                </select>
                            </div>

                            <SmartInput
                                type="number"
                                value={formData.housingRent}
                                onChange={(value) => handleChange('housingRent', value)}
                                label={t('loanRequest.fields.housingCosts')}
                                placeholder={t('loanRequest.placeholders.housingCosts')}
                                required
                                error={fieldErrors.housingRent}
                                icon="🏠"
                                tooltip="Inserisci le spese mensili totali per l'alloggio, incluse le spese accessorie (riscaldamento, acqua, elettricità)."
                                min={100}
                                validate={(value) => {
                                    const num = parseFloat(value);
                                    return num >= 100 && num <= 10000;
                                }}
                            />

                            <div className="field-row-v2">
                                <div className="field-group-v2">
                                    <label>
                                        {t('loanRequest.fields.hasChildren')} <span className="required">*</span>
                                    </label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.childrenInHousehold === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('childrenInHousehold', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.childrenInHousehold === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('childrenInHousehold', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                                <div className="field-group-v2">
                                    <label>
                                        {t('loanRequest.fields.paysAlimony')} <span className="required">*</span>
                                    </label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.payAlimony === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('payAlimony', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.payAlimony === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('payAlimony', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Additional Questions */}
                    {currentStep === 4 && (
                        <div className="form-step-v2">
                            <div className="field-row-v2">
                                <div className="field-group-v2">
                                    <label>
                                        {t('loanRequest.fields.heavyLabor')} <span className="required">*</span>
                                    </label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.heavyShiftNightWork === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('heavyShiftNightWork', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.heavyShiftNightWork === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('heavyShiftNightWork', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                                <div className="field-group-v2">
                                    <label>
                                        {t('loanRequest.fields.hasObligations')} <span className="required">*</span>
                                    </label>
                                    <div className="button-group-v2">
                                        <button
                                            type="button"
                                            className={formData.financialObligations === 'Yes' ? 'active' : ''}
                                            onClick={() => handleChange('financialObligations', 'Yes')}
                                        >
                                            {t('loanRequest.options.yesNo.yes')}
                                        </button>
                                        <button
                                            type="button"
                                            className={formData.financialObligations === 'No' ? 'active' : ''}
                                            onClick={() => handleChange('financialObligations', 'No')}
                                        >
                                            {t('loanRequest.options.yesNo.no')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {formData.financialObligations === 'Yes' && (
                                <div className="field-group-v2">
                                    <label>{t('loanRequest.fields.monthlyInstalments')}</label>
                                    <input
                                        type="number"
                                        value={formData.financialObligationsMonthly}
                                        onChange={(e) => handleChange('financialObligationsMonthly', e.target.value)}
                                        placeholder={t('loanRequest.placeholders.monthlyInstalments')}
                                    />
                                </div>
                            )}

                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.debtEnforcements')} <span className="required">*</span>
                                </label>
                                <div className="button-group-v2">
                                    <button
                                        type="button"
                                        className={formData.debtEnforcementsLast3y === '0' ? 'active' : ''}
                                        onClick={() => handleChange('debtEnforcementsLast3y', '0')}
                                    >
                                        {t('loanRequest.options.debtEnforcements.zero')}
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.debtEnforcementsLast3y === '1' ? 'active' : ''}
                                        onClick={() => handleChange('debtEnforcementsLast3y', '1')}
                                    >
                                        {t('loanRequest.options.debtEnforcements.one')}
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.debtEnforcementsLast3y === '2' ? 'active' : ''}
                                        onClick={() => handleChange('debtEnforcementsLast3y', '2')}
                                    >
                                        {t('loanRequest.options.debtEnforcements.two')}
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.debtEnforcementsLast3y === '3' ? 'active' : ''}
                                        onClick={() => handleChange('debtEnforcementsLast3y', '3')}
                                    >
                                        {t('loanRequest.options.debtEnforcements.three')}
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.debtEnforcementsLast3y === 'more' ? 'active' : ''}
                                        onClick={() => handleChange('debtEnforcementsLast3y', 'more')}
                                    >
                                        {t('loanRequest.options.debtEnforcements.more')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Credit Protection */}
                    {currentStep === 5 && (
                        <div className="form-step-v2">
                            <div className="field-group-v2">
                                <label>
                                    {t('loanRequest.fields.creditProtectionInsurance')} <span className="required">*</span>
                                </label>
                                <p className="field-hint">{t('loanRequest.fields.creditProtectionDescription')}</p>
                                <div className="button-group-v2">
                                    <button
                                        type="button"
                                        className={formData.creditGuaranteeAgreement === 'Yes' ? 'active' : ''}
                                        onClick={() => handleChange('creditGuaranteeAgreement', 'Yes')}
                                    >
                                        {t('loanRequest.options.yesNo.yes')}
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.creditGuaranteeAgreement === 'No' ? 'active' : ''}
                                        onClick={() => handleChange('creditGuaranteeAgreement', 'No')}
                                    >
                                        {t('loanRequest.options.yesNo.no')}
                                    </button>
                                </div>
                            </div>

                            <div className="field-group-v2">
                                <label>{t('loanRequest.fields.comments')}</label>
                                <textarea
                                    rows={5}
                                    value={formData.comments}
                                    onChange={(e) => handleChange('comments', e.target.value)}
                                    placeholder={t('loanRequest.placeholders.comments')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 6: Documents */}
                    {currentStep === 6 && (
                        <div className="form-step-v2">
                            <p className="step-description">{t('loanRequest.documents.fileNote')}</p>

                            <div className="documents-grid-v2">
                                {DOCUMENT_REQUIREMENTS.map((doc) => (
                                    <div key={doc.field} className="field-group-v2">
                                        <label>
                                            {t(doc.translationKey)}
                                            {!doc.optional && <span className="required"> *</span>}
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                handleFileChange(doc.field as DocumentField, file);
                                            }}
                                        />
                                        {formData[doc.field] && (
                                            <div className="file-selected">
                                                ✓ {(formData[doc.field] as File).name}
                                            </div>
                                        )}
                                        {fileErrors[doc.field] && (
                                            <div className="field-error">{fileErrors[doc.field]}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer-v2">
                    <button
                        type="button"
                        className="btn-secondary-v2"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                    >
                        {t('loanRequest.buttons.previous')}
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            className="btn-primary-v2"
                            onClick={handleNext}
                        >
                            {t('loanRequest.buttons.next')}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-primary-v2"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('common.submitting') : t('loanRequest.buttons.submit')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoanRequestModalV2;
