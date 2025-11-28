import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formSubmissionService } from '../services/formSubmissionService';
import DocumentPreparationReminder from './DocumentPreparationReminder';
import ProgressStepper from './form/ProgressStepper';
import SmartInput from './form/SmartInput';
import SmartSelect from './form/SmartSelect';
import SmartFileUpload from './form/SmartFileUpload';
import type { SimulatorData } from './CreditCalculator';
import '../styles/LoanRequestModal.css';
import { DEFAULT_MAX_UPLOAD_MB, validatePdfFile } from '../utils/fileValidation';
import { DOCUMENT_REQUIREMENTS, DOCUMENT_UPLOAD_FIELDS, DocumentUploadField } from '../constants/documentRequirements';

interface LoanRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    // Step 1 - Calculator (passed from CreditCalculator)
    loanAmount?: number;
    duration?: number;
    monthlyPayment?: number;

    // Step 2 - Personal details
    salutation: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    civilStatus: string;
    nationality: string;
    areaCode: string;
    telephoneNumber: string;
    telephoneType: string;
    additionalPhones: Array<{ areaCode: string; number: string; type: string }>;
    email: string;
    privacyAccepted: boolean;
    country: string;
    postalCode: string;
    city: string;
    street: string;
    houseNumber: string;
    residenceMonths: string;
    residenceYears: string;
    ownsHome: string;

    // Step 3 - Occupation and income
    professionalSituation: string;
    company: string;
    employerStreet: string;
    employerHouseNumber: string;
    employerPostalCode: string;
    employerCity: string;
    employmentRelationship: string;
    employmentMonths: string;
    employmentYears: string;
    commutingMethod: string;
    carNecessary: string;
    netMonthlyIncome: string;
    has13thSalary: string;
    hasBonus: string;
    hasSecondaryEmployment: string;
    hasAdditionalIncome: string;
    beneficialOwnership: string;

    // Step 4 - Living and expenses
    housingSituation: string;
    housingCosts: string;
    hasChildren: string;
    paysAlimony: string;

    // Step 5 - Additional questions
    heavyLabor: string;
    hasObligations: string;
    monthlyInstalments: string;
    debtEnforcements: string;

    // Step 6 - Credit protection & comments
    creditProtectionInsurance: string;
    comments: string;

    // Step 7 - Document uploads
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

const FORM_STORAGE_KEY = 'loan_request_form_draft_v2';
const STEP_STORAGE_KEY = 'loan_request_step_v2';

const STEP_FIELD_MAP: Record<number, string[]> = {
    1: [
        'salutation',
        'firstName',
        'lastName',
        'dateOfBirth',
        'civilStatus',
        'nationality',
        'areaCode',
        'telephoneNumber',
        'telephoneType',
        'email',
        'privacyAccepted',
        'country',
        'postalCode',
        'city',
        'street',
        'houseNumber',
        'residenceMonths',
        'residenceYears',
        'ownsHome',
        'additionalPhones'
    ],
    2: [
        'professionalSituation',
        'company',
        'employerStreet',
        'employerHouseNumber',
        'employerPostalCode',
        'employerCity',
        'employmentRelationship',
        'employmentMonths',
        'employmentYears',
        'commutingMethod',
        'carNecessary',
        'netMonthlyIncome',
        'has13thSalary',
        'hasBonus',
        'hasSecondaryEmployment',
        'hasAdditionalIncome',
        'beneficialOwnership'
    ],
    3: [
        'housingSituation',
        'housingCosts',
        'hasChildren',
        'paysAlimony'
    ],
    4: [
        'heavyLabor',
        'hasObligations',
        'monthlyInstalments',
        'debtEnforcements'
    ],
    5: [
        'creditProtectionInsurance'
    ],
    6: [...FILE_FIELDS]
};

const buildAdditionalPhoneKey = (
    index: number,
    field: keyof FormData['additionalPhones'][number]
) => `additionalPhones.${index}.${field}`;
const ADDITIONAL_PHONE_FIELDS: Array<keyof FormData['additionalPhones'][number]> = ['areaCode', 'number', 'type'];

const SECTION_FIELD_SETS = {
    personalData: [
        'salutation',
        'firstName',
        'lastName',
        'dateOfBirth',
        'civilStatus',
        'nationality'
    ],
    contacts: ['areaCode', 'telephoneNumber', 'telephoneType'],
    residence: ['country', 'postalCode', 'city', 'street', 'houseNumber', 'residenceMonths', 'residenceYears', 'ownsHome'],
    occupation: ['professionalSituation'],
    employer: ['company', 'employerStreet', 'employerHouseNumber', 'employerPostalCode', 'employerCity', 'employmentRelationship', 'employmentMonths', 'employmentYears'],
    income: ['commutingMethod', 'carNecessary', 'netMonthlyIncome', 'has13thSalary', 'hasBonus', 'hasSecondaryEmployment', 'hasAdditionalIncome'],
    loanRepayment: ['beneficialOwnership'],
    living: ['housingSituation', 'housingCosts', 'hasChildren', 'paysAlimony'],
    obligations: ['heavyLabor', 'hasObligations', 'monthlyInstalments', 'debtEnforcements'],
    creditProtection: ['creditProtectionInsurance'],
    documents: [...FILE_FIELDS]
};

const LoanRequestModal: React.FC<LoanRequestModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation('forms');
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<string[]>([]);
    const [simulatorData, setSimulatorData] = useState<SimulatorData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        salutation: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        civilStatus: '',
        nationality: 'Switzerland',
        areaCode: '+41',
        telephoneNumber: '',
        telephoneType: '',
        additionalPhones: [],
        email: '',
        privacyAccepted: false,
        country: 'Switzerland',
        postalCode: '',
        city: '',
        street: '',
        houseNumber: '',
        residenceMonths: '',
        residenceYears: '',
        ownsHome: '',
        professionalSituation: '',
        company: '',
        employerStreet: '',
        employerHouseNumber: '',
        employerPostalCode: '',
        employerCity: '',
        employmentRelationship: '',
        employmentMonths: '',
        employmentYears: '',
        commutingMethod: '',
        carNecessary: '',
        netMonthlyIncome: '',
        has13thSalary: '',
        hasBonus: '',
        hasSecondaryEmployment: '',
        hasAdditionalIncome: '',
        beneficialOwnership: '',
        housingSituation: '',
        housingCosts: '',
        hasChildren: '',
        paysAlimony: '',
        heavyLabor: '',
        hasObligations: '',
        monthlyInstalments: '',
        debtEnforcements: '',
        creditProtectionInsurance: '',
        comments: ''
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

    const getFieldErrorMessage = useCallback(
        (fieldKey: string) => fieldErrors[fieldKey] || fileErrors[fieldKey],
        [fieldErrors, fileErrors]
    );

    const clearFieldError = useCallback((fieldKey: string) => {
        setFieldErrors(prev => {
            if (!prev[fieldKey]) {
                return prev;
            }
            const { [fieldKey]: _removed, ...rest } = prev;
            return rest;
        });
        setFileErrors(prev => {
            if (!prev[fieldKey]) {
                return prev;
            }
            const { [fieldKey]: _removed, ...rest } = prev;
            return rest;
        });
    }, []);

    const syncStepFieldErrors = useCallback((step: number, stepSpecificErrors: Record<string, string>) => {
        const selectors = STEP_FIELD_MAP[step] || [];
        setFieldErrors(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
                const shouldCheck = selectors.some((selector) =>
                    selector === 'additionalPhones' ? key.startsWith('additionalPhones') : key === selector
                );
                if (shouldCheck && !stepSpecificErrors[key]) {
                    delete updated[key];
                }
            });
            return { ...updated, ...stepSpecificErrors };
        });
    }, []);

    const renderInput = (
        field: keyof FormData,
        props: Omit<React.ComponentProps<typeof SmartInput>, 'value' | 'onChange' | 'error'>
    ) => (
        <SmartInput
            {...props}
            value={(formData[field] as string) ?? ''}
            onChange={(value) => handleChange(field, value)}
            error={getFieldErrorMessage(field)}
        />
    );

    const renderSelect = (
        field: keyof FormData,
        props: Omit<React.ComponentProps<typeof SmartSelect>, 'value' | 'onChange' | 'error'>
    ) => (
        <SmartSelect
            {...props}
            value={(formData[field] as string) ?? ''}
            onChange={(value) => handleChange(field, value)}
            error={getFieldErrorMessage(field)}
        />
    );

    const yesNoOptions = useMemo(() => [
        { value: 'Yes', label: t('loanRequest.options.yesNo.yes') },
        { value: 'No', label: t('loanRequest.options.yesNo.no') }
    ], [t]);

    const salutationOptions = useMemo(() => [
        { value: 'Mr.', label: t('loanRequest.options.salutations.mr') },
        { value: 'Ms.', label: t('loanRequest.options.salutations.ms') }
    ], [t]);

    const phoneTypeOptions = useMemo(() => [
        { value: 'Mobile', label: t('loanRequest.options.phoneTypes.mobile') },
        { value: 'Private', label: t('loanRequest.options.phoneTypes.private') },
        { value: 'Business', label: t('loanRequest.options.phoneTypes.business') }
    ], [t]);

    const civilStatusOptions = useMemo(() => [
        { value: 'Single', label: t('loanRequest.options.civilStatus.single') },
        { value: 'Married / registered partnership', label: t('loanRequest.options.civilStatus.married') },
        { value: 'Widowed', label: t('loanRequest.options.civilStatus.widowed') },
        { value: 'Divorced', label: t('loanRequest.options.civilStatus.divorced') },
        { value: 'Legally separated', label: t('loanRequest.options.civilStatus.separated') }
    ], [t]);

    const countryOptions = useMemo(() => [
        { value: 'Switzerland', label: t('loanRequest.options.countries.switzerland') },
        { value: 'Italy', label: t('loanRequest.options.countries.italy') },
        { value: 'Germany', label: t('loanRequest.options.countries.germany') },
        { value: 'France', label: t('loanRequest.options.countries.france') },
        { value: 'Austria', label: t('loanRequest.options.countries.austria') },
        { value: 'Other', label: t('loanRequest.options.countries.other') }
    ], [t]);

    const professionalSituationOptions = useMemo(() => [
        { value: 'Employed', label: t('loanRequest.options.professionalSituations.employed') },
        { value: 'Self-employed', label: t('loanRequest.options.professionalSituations.selfEmployed') },
        { value: "Pensioner with old-age and survivors' insurance", label: t('loanRequest.options.professionalSituations.pensionerOld') },
        { value: 'Pensioner with disability insurance', label: t('loanRequest.options.professionalSituations.pensionerDisability') },
        { value: 'Housewife/househusband', label: t('loanRequest.options.professionalSituations.housewife') }
    ], [t]);

    const employmentRelationshipOptions = useMemo(() => [
        { value: 'Permanent, not under notice of termination', label: t('loanRequest.options.employmentRelationships.permanent') },
        { value: 'Temporary', label: t('loanRequest.options.employmentRelationships.temporary') },
        { value: 'Fixed-term contract', label: t('loanRequest.options.employmentRelationships.fixedTerm') }
    ], [t]);

    const commutingOptions = useMemo(() => [
        { value: 'Car', label: t('loanRequest.options.commutingMethods.car') },
        { value: 'Public', label: t('loanRequest.options.commutingMethods.public') },
        { value: 'Motorcycle', label: t('loanRequest.options.commutingMethods.motorcycle') },
        { value: 'Bicycle', label: t('loanRequest.options.commutingMethods.bicycle') },
        { value: 'On foot', label: t('loanRequest.options.commutingMethods.onFoot') }
    ], [t]);

    const beneficialOwnershipOptions = useMemo(() => [
        { value: 'The assets belong to me', label: t('loanRequest.options.beneficialOwnership.mine') },
        { value: 'The assets belong to another person', label: t('loanRequest.options.beneficialOwnership.other') }
    ], [t]);

    const housingSituationOptions = useMemo(() => [
        { value: 'Partner', label: t('loanRequest.options.housingSituations.partner') },
        { value: 'Living alone', label: t('loanRequest.options.housingSituations.alone') },
        { value: 'Shared home', label: t('loanRequest.options.housingSituations.shared') },
        { value: 'With parents', label: t('loanRequest.options.housingSituations.withParents') },
        { value: 'Single parent', label: t('loanRequest.options.housingSituations.singleParent') }
    ], [t]);

    const debtEnforcementOptions = useMemo(() => [
        { value: '0', label: t('loanRequest.options.debtEnforcements.zero') },
        { value: '1', label: t('loanRequest.options.debtEnforcements.one') },
        { value: '2', label: t('loanRequest.options.debtEnforcements.two') },
        { value: '3', label: t('loanRequest.options.debtEnforcements.three') },
        { value: 'More', label: t('loanRequest.options.debtEnforcements.more') }
    ], [t]);

    const renderSectionErrors = useCallback((fields: string[]) => {
        const entries = fields
            .map((field) => ({
                field,
                message: getFieldErrorMessage(field)
            }))
            .filter((entry): entry is { field: string; message: string } => Boolean(entry.message));

        if (entries.length === 0) {
            return null;
        }

        return (
            <ul className="section-error-list">
                {entries.map(({ field, message }) => (
                    <li key={`${field}-section-error`}>{message}</li>
                ))}
            </ul>
        );
    }, [getFieldErrorMessage]);

    // Load simulator data when modal opens
    useEffect(() => {
        if (!isOpen) {
            setHasRestoredDraft(false);
            return;
        }

        let restored = false;
        try {
            const storedDraft = sessionStorage.getItem(FORM_STORAGE_KEY);
            if (storedDraft) {
                const parsed = JSON.parse(storedDraft);
                setFormData(prev => ({
                    ...prev,
                    ...parsed
                }));
                restored = true;
            }

            const storedStep = sessionStorage.getItem(STEP_STORAGE_KEY);
            if (storedStep) {
                const parsedStep = parseInt(storedStep, 10);
                if (!Number.isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= totalSteps) {
                    setCurrentStep(parsedStep);
                    restored = true;
                }
            }
        } catch (error) {
            console.warn('Unable to restore loan form draft:', error);
        }

        setHasRestoredDraft(restored);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const savedData = sessionStorage.getItem('credit_simulator_data');
        if (savedData && !hasRestoredDraft) {
            try {
                const parsed: SimulatorData = JSON.parse(savedData);
                setSimulatorData(parsed);
                
                setFormData(prev => ({
                    ...prev,
                    loanAmount: parsed.amount,
                    duration: parsed.duration,
                    monthlyPayment: parsed.minMonthlyPayment,
                    ownsHome: parsed.property === 'yes' ? 'Yes' : 'No'
                }));

                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'loan_application_started', {
                        loan_amount: parsed.amount,
                        duration: parsed.duration,
                        has_simulator_data: true
                    });
                }
            } catch (error) {
                console.error('Error loading simulator data:', error);
            }
        } else if (!savedData) {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'loan_application_started', {
                    has_simulator_data: false
                });
            }
        }
    }, [hasRestoredDraft, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const persistTimeout = setTimeout(() => {
            try {
                const persistable: Record<string, any> = { ...formData };
                FILE_FIELDS.forEach((field) => {
                    persistable[field] = null;
                });
                sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(persistable));
                sessionStorage.setItem(STEP_STORAGE_KEY, String(currentStep));
            } catch (error) {
                console.warn('Unable to persist loan form data:', error);
            }
        }, 250);

        return () => clearTimeout(persistTimeout);
    }, [formData, currentStep, isOpen]);

    const handleFileSelection = useCallback((field: DocumentField, file: File | null) => {
        if (file) {
            const validation = validatePdfFile(file);
            if (!validation.valid) {
                const message = t(`loanRequest.fileErrors.${validation.errorKey}`, {
                    max: validation.maxSizeMB || DEFAULT_MAX_UPLOAD_MB
                });
                setFileErrors(prev => ({
                    ...prev,
                    [field]: message
                }));
                setFormData(prev => ({
                    ...prev,
                    [field]: null
                }));
                return;
            }
        }

        setFileErrors(prev => {
            if (!prev[field]) return prev;
            const { [field]: _removed, ...rest } = prev;
            return rest;
        });

        setFormData(prev => ({
            ...prev,
            [field]: file
        }));
    }, [t]);


    if (!isOpen) return null;

    const totalSteps = 6;
    const today = new Date();
    const dobMax = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
    const dobMin = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];
    const formSteps = useMemo(() => [
        {
            number: 1,
            title: t('loanRequest.steps.personalDetails'),
            description: t('loanRequest.sections.personalData')
        },
        {
            number: 2,
            title: t('loanRequest.steps.occupationIncome'),
            description: t('loanRequest.sections.professionalSituation')
        },
        {
            number: 3,
            title: t('loanRequest.steps.livingExpenses'),
            description: t('loanRequest.steps.livingExpenses')
        },
        {
            number: 4,
            title: t('loanRequest.steps.additionalQuestions'),
            description: t('loanRequest.steps.additionalQuestions')
        },
        {
            number: 5,
            title: t('loanRequest.steps.creditProtection'),
            description: t('loanRequest.fields.creditProtectionDescription')
        },
        {
            number: 6,
            title: t('loanRequest.steps.documents'),
            description: t('loanRequest.documents.fileNote')
        }
    ], [t]);

    // Helper validation functions
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone: string): boolean => {
        // Swiss phone format: allows spaces, dashes, and parentheses
        const phoneRegex = /^[\d\s\-()]+$/;
        const digitsOnly = phone.replace(/[\s\-()]/g, '');
        return phoneRegex.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
    };

    const isValidPostalCode = (code: string, country: string): boolean => {
        if (country === 'Switzerland') {
            // Swiss postal codes are 4 digits
            return /^\d{4}$/.test(code);
        }
        // For other countries, allow 3-10 alphanumeric characters
        return /^[A-Z0-9]{3,10}$/i.test(code);
    };

    const isValidDate = (dateString: string): boolean => {
        const date = new Date(dateString);
        const now = new Date();
        const minAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
        const maxAge = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());

        return date <= minAge && date >= maxAge;
    };

    const isValidName = (name: string): boolean => {
        // Names should contain only letters, spaces, hyphens, and apostrophes
        // Minimum 2 characters
        return /^[a-zA-ZÀ-ÿ\s\-']{2,}$/.test(name.trim());
    };

    const isValidAmount = (amount: string): boolean => {
        const num = parseFloat(amount);
        return !isNaN(num) && num > 0;
    };

    const isValidMonths = (months: string): boolean => {
        const num = parseInt(months);
        return !isNaN(num) && num >= 0 && num <= 11;
    };

    const isValidYears = (years: string): boolean => {
        const num = parseInt(years);
        return !isNaN(num) && num >= 0 && num <= 100;
    };

    // Validation function for each step
    const validateStep = (step: number): string[] => {
        const summaryErrors: string[] = [];
        const stepFieldErrors: Record<string, string> = {};
        const addError = (fieldKey: string, message: string) => {
            summaryErrors.push(message);
            if (!stepFieldErrors[fieldKey]) {
                stepFieldErrors[fieldKey] = message;
            }
        };

        switch (step) {
            case 1:
                if (!formData.salutation) addError('salutation', t('loanRequest.validation.salutationRequired'));

                if (!formData.firstName.trim()) {
                    addError('firstName', t('loanRequest.validation.firstNameRequired'));
                } else if (!isValidName(formData.firstName)) {
                    addError('firstName', t('loanRequest.validation.firstNameInvalid'));
                }

                if (!formData.lastName.trim()) {
                    addError('lastName', t('loanRequest.validation.lastNameRequired'));
                } else if (!isValidName(formData.lastName)) {
                    addError('lastName', t('loanRequest.validation.lastNameInvalid'));
                }

                if (!formData.dateOfBirth) {
                    addError('dateOfBirth', t('loanRequest.validation.dobRequired'));
                } else if (!isValidDate(formData.dateOfBirth)) {
                    addError('dateOfBirth', t('loanRequest.validation.dobInvalid'));
                }

                if (!formData.civilStatus) addError('civilStatus', t('loanRequest.validation.civilStatusRequired'));
                if (!formData.nationality) addError('nationality', t('loanRequest.validation.nationalityRequired'));

                if (!formData.areaCode.trim()) {
                    addError('areaCode', t('loanRequest.validation.areaCodeRequired'));
                } else if (!/^\+?\d{1,4}$/.test(formData.areaCode.trim())) {
                    addError('areaCode', t('loanRequest.validation.areaCodeInvalid'));
                }

                if (!formData.telephoneNumber.trim()) {
                    addError('telephoneNumber', t('loanRequest.validation.phoneRequired'));
                } else if (!isValidPhone(formData.telephoneNumber)) {
                    addError('telephoneNumber', t('loanRequest.validation.phoneInvalid'));
                }

                if (!formData.telephoneType) addError('telephoneType', t('loanRequest.validation.phoneTypeRequired'));

                if (!formData.email.trim()) {
                    addError('email', t('loanRequest.validation.emailRequired'));
                } else if (!isValidEmail(formData.email)) {
                    addError('email', t('loanRequest.validation.emailInvalid'));
                }

                if (!formData.privacyAccepted) addError('privacyAccepted', t('loanRequest.validation.privacyRequired'));
                if (!formData.country) addError('country', t('loanRequest.validation.countryRequired'));

                if (!formData.postalCode.trim()) {
                    addError('postalCode', t('loanRequest.validation.postalCodeRequired'));
                } else if (!isValidPostalCode(formData.postalCode, formData.country)) {
                    addError(
                        'postalCode',
                        formData.country === 'Switzerland'
                            ? t('loanRequest.validation.postalCodeInvalidCH')
                            : t('loanRequest.validation.postalCodeInvalid')
                    );
                }

                if (!formData.city.trim()) {
                    addError('city', t('loanRequest.validation.cityRequired'));
                } else if (formData.city.trim().length < 2) {
                    addError('city', t('loanRequest.validation.cityTooShort'));
                }

                if (!formData.street.trim()) {
                    addError('street', t('loanRequest.validation.streetRequired'));
                } else if (formData.street.trim().length < 3) {
                    addError('street', t('loanRequest.validation.streetTooShort'));
                }

                if (!formData.houseNumber.trim()) {
                    addError('houseNumber', t('loanRequest.validation.houseNumberRequired'));
                }

                if (!formData.residenceMonths.trim()) {
                    addError('residenceMonths', t('loanRequest.validation.residenceMonthsRequired'));
                } else if (!isValidMonths(formData.residenceMonths)) {
                    addError('residenceMonths', t('loanRequest.validation.residenceMonthsInvalid'));
                }

                if (!formData.residenceYears.trim()) {
                    addError('residenceYears', t('loanRequest.validation.residenceYearsRequired'));
                } else if (!isValidYears(formData.residenceYears)) {
                    addError('residenceYears', t('loanRequest.validation.residenceYearsInvalid'));
                }

                if (!formData.ownsHome) addError('ownsHome', t('loanRequest.validation.ownsHomeRequired'));

                formData.additionalPhones.forEach((phone, index) => {
                    const areaCodeKey = buildAdditionalPhoneKey(index, 'areaCode');
                    const numberKey = buildAdditionalPhoneKey(index, 'number');
                    const typeKey = buildAdditionalPhoneKey(index, 'type');

                    if (!phone.areaCode.trim()) {
                        addError(areaCodeKey, t('loanRequest.validation.additionalPhoneAreaCodeRequired', { index: index + 1 }));
                    } else if (!/^\+?\d{1,4}$/.test(phone.areaCode.trim())) {
                        addError(areaCodeKey, t('loanRequest.validation.additionalPhoneAreaCodeInvalid', { index: index + 1 }));
                    }

                    if (!phone.number.trim()) {
                        addError(numberKey, t('loanRequest.validation.additionalPhoneNumberRequired', { index: index + 1 }));
                    } else if (!isValidPhone(phone.number)) {
                        addError(numberKey, t('loanRequest.validation.additionalPhoneNumberInvalid', { index: index + 1 }));
                    }

                    if (!phone.type) {
                        addError(typeKey, t('loanRequest.validation.additionalPhoneTypeRequired', { index: index + 1 }));
                    }
                });
                break;

            case 2:
                if (!formData.professionalSituation) {
                    addError('professionalSituation', t('loanRequest.validation.professionalSituationRequired'));
                }

                if (formData.professionalSituation === 'Employed' || formData.professionalSituation === 'Self-employed') {
                    if (!formData.company.trim()) {
                        addError('company', t('loanRequest.validation.companyRequired'));
                    } else if (formData.company.trim().length < 2) {
                        addError('company', t('loanRequest.validation.companyTooShort'));
                    }

                    if (!formData.employerStreet.trim()) {
                        addError('employerStreet', t('loanRequest.validation.employerStreetRequired'));
                    } else if (formData.employerStreet.trim().length < 3) {
                        addError('employerStreet', t('loanRequest.validation.employerStreetTooShort'));
                    }

                    if (!formData.employerHouseNumber.trim()) {
                        addError('employerHouseNumber', t('loanRequest.validation.employerHouseNumberRequired'));
                    }

                    if (!formData.employerPostalCode.trim()) {
                        addError('employerPostalCode', t('loanRequest.validation.employerPostalCodeRequired'));
                    } else if (!isValidPostalCode(formData.employerPostalCode, 'Switzerland')) {
                        addError('employerPostalCode', t('loanRequest.validation.employerPostalCodeInvalid'));
                    }

                    if (!formData.employerCity.trim()) {
                        addError('employerCity', t('loanRequest.validation.employerCityRequired'));
                    } else if (formData.employerCity.trim().length < 2) {
                        addError('employerCity', t('loanRequest.validation.employerCityTooShort'));
                    }

                    if (!formData.employmentRelationship) {
                        addError('employmentRelationship', t('loanRequest.validation.employmentRelationshipRequired'));
                    }

                    if (!formData.employmentMonths.trim()) {
                        addError('employmentMonths', t('loanRequest.validation.employmentMonthsRequired'));
                    } else if (!isValidMonths(formData.employmentMonths)) {
                        addError('employmentMonths', t('loanRequest.validation.employmentMonthsInvalid'));
                    }

                    if (!formData.employmentYears.trim()) {
                        addError('employmentYears', t('loanRequest.validation.employmentYearsRequired'));
                    } else if (!isValidYears(formData.employmentYears)) {
                        addError('employmentYears', t('loanRequest.validation.employmentYearsInvalid'));
                    }

                    if (!formData.commutingMethod) {
                        addError('commutingMethod', t('loanRequest.validation.commutingMethodRequired'));
                    }
                    if (formData.commutingMethod === 'Car' && !formData.carNecessary) {
                        addError('carNecessary', t('loanRequest.validation.carNecessaryRequired'));
                    }
                }

                if (!formData.netMonthlyIncome.trim()) {
                    addError('netMonthlyIncome', t('loanRequest.validation.netMonthlyIncomeRequired'));
                } else if (!isValidAmount(formData.netMonthlyIncome)) {
                    addError('netMonthlyIncome', t('loanRequest.validation.netMonthlyIncomeInvalid'));
                } else if (parseFloat(formData.netMonthlyIncome) < 1000) {
                    addError('netMonthlyIncome', t('loanRequest.validation.netMonthlyIncomeTooLow'));
                } else if (parseFloat(formData.netMonthlyIncome) > 1000000) {
                    addError('netMonthlyIncome', t('loanRequest.validation.netMonthlyIncomeTooHigh'));
                }

                if (!formData.has13thSalary) addError('has13thSalary', t('loanRequest.validation.has13thSalaryRequired'));
                if (!formData.hasBonus) addError('hasBonus', t('loanRequest.validation.hasBonusRequired'));
                if (!formData.hasSecondaryEmployment) addError('hasSecondaryEmployment', t('loanRequest.validation.hasSecondaryEmploymentRequired'));
                if (!formData.hasAdditionalIncome) addError('hasAdditionalIncome', t('loanRequest.validation.hasAdditionalIncomeRequired'));
                if (!formData.beneficialOwnership) addError('beneficialOwnership', t('loanRequest.validation.beneficialOwnershipRequired'));
                break;

            case 3:
                if (!formData.housingSituation) addError('housingSituation', t('loanRequest.validation.housingSituationRequired'));

                if (!formData.housingCosts.trim()) {
                    addError('housingCosts', t('loanRequest.validation.housingCostsRequired'));
                } else if (!isValidAmount(formData.housingCosts)) {
                    addError('housingCosts', t('loanRequest.validation.housingCostsInvalid'));
                } else if (parseFloat(formData.housingCosts) < 100) {
                    addError('housingCosts', t('loanRequest.validation.housingCostsTooLow'));
                } else if (parseFloat(formData.housingCosts) > 50000) {
                    addError('housingCosts', t('loanRequest.validation.housingCostsTooHigh'));
                }

                if (!formData.hasChildren) addError('hasChildren', t('loanRequest.validation.hasChildrenRequired'));
                if (!formData.paysAlimony) addError('paysAlimony', t('loanRequest.validation.paysAlimonyRequired'));
                break;

            case 4:
                if (!formData.heavyLabor) addError('heavyLabor', t('loanRequest.validation.heavyLaborRequired'));
                if (!formData.hasObligations) addError('hasObligations', t('loanRequest.validation.hasObligationsRequired'));

                if (formData.hasObligations === 'Yes') {
                    if (!formData.monthlyInstalments.trim()) {
                        addError('monthlyInstalments', t('loanRequest.validation.monthlyInstalmentsRequired'));
                    } else if (!isValidAmount(formData.monthlyInstalments)) {
                        addError('monthlyInstalments', t('loanRequest.validation.monthlyInstalmentsInvalid'));
                    } else if (parseFloat(formData.monthlyInstalments) > 100000) {
                        addError('monthlyInstalments', t('loanRequest.validation.monthlyInstalmentsTooHigh'));
                    }
                }

                if (!formData.debtEnforcements) addError('debtEnforcements', t('loanRequest.validation.debtEnforcementsRequired'));
                break;

            case 5:
                if (!formData.creditProtectionInsurance) {
                    addError('creditProtectionInsurance', t('loanRequest.validation.creditProtectionInsuranceRequired'));
                }
                break;

            case 6:
                DOCUMENT_REQUIREMENTS.forEach(({ field, optional }) => {
                    if (!optional && !formData[field]) {
                        addError(field, t(`loanRequest.documents.${field}Required`));
                    }
                });
                break;
        }

        setErrors(summaryErrors);
        syncStepFieldErrors(step, stepFieldErrors);
        return summaryErrors;
    };

    const handleNext = () => {
        const validationErrors = validateStep(currentStep);
        if (validationErrors.length === 0) {
            setErrors([]);
            if (currentStep < totalSteps) {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'loan_form_step_completed', {
                        step: currentStep,
                        total_steps: totalSteps
                    });
                }
                setCurrentStep(currentStep + 1);
            }
        } else {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'loan_form_validation_error', {
                    step: currentStep,
                    error_count: validationErrors.length
                });
            }
            document.querySelector('.modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        setErrors([]);
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData({ ...formData, [field]: value });
        clearFieldError(field);
    };

    const addPhoneNumber = () => {
        setFormData({
            ...formData,
            additionalPhones: [...formData.additionalPhones, { areaCode: '+41', number: '', type: '' }]
        });
    };

    const removePhoneNumber = (index: number) => {
        const newPhones = formData.additionalPhones.filter((_, i) => i !== index);
        setFormData({ ...formData, additionalPhones: newPhones });
        ADDITIONAL_PHONE_FIELDS.forEach((field) => clearFieldError(buildAdditionalPhoneKey(index, field)));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const validationErrors = validateStep(currentStep);
        if (validationErrors.length === 0) {
            try {
                setIsSubmitting(true);
                // Prepara i file per l'upload
                const filesToUpload: { file: File; documentType: string }[] = [];

                // Mappa tutti i file caricati con il loro tipo
                if (formData.betreibungsauszugCurrent) {
                    filesToUpload.push({ file: formData.betreibungsauszugCurrent, documentType: 'betreibungsauszug_current' });
                }
                if (formData.betreibungsauszugPrevious) {
                    filesToUpload.push({ file: formData.betreibungsauszugPrevious, documentType: 'betreibungsauszug_previous' });
                }
                if (formData.documentoPersonale) {
                    filesToUpload.push({ file: formData.documentoPersonale, documentType: 'documento_personale' });
                }
                if (formData.permessoSoggiorno) {
                    filesToUpload.push({ file: formData.permessoSoggiorno, documentType: 'permesso_soggiorno' });
                }
                if (formData.bustePaga) {
                    filesToUpload.push({ file: formData.bustePaga, documentType: 'buste_paga' });
                }
                if (formData.contrattoLavoro) {
                    filesToUpload.push({ file: formData.contrattoLavoro, documentType: 'contratto_lavoro' });
                }
                if (formData.contrattoAffitto) {
                    filesToUpload.push({ file: formData.contrattoAffitto, documentType: 'contratto_affitto' });
                }
                if (formData.polizzaAssicurazione) {
                    filesToUpload.push({ file: formData.polizzaAssicurazione, documentType: 'polizza_assicurazione' });
                }
                if (formData.autenticaPermesso) {
                    filesToUpload.push({ file: formData.autenticaPermesso, documentType: 'autentica_permesso' });
                }
                if (formData.contrattoCredito) {
                    filesToUpload.push({ file: formData.contrattoCredito, documentType: 'contratto_credito' });
                }

                // Salva su Firebase usando il servizio (con file e dati simulatore)
                const result = await formSubmissionService.submitRequest({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: `${formData.areaCode}${formData.telephoneNumber}`,
                    serviceType: 'creditizia',
                    description: `Richiesta prestito di CHF ${formData.loanAmount || 0} per ${formData.duration || 0} mesi. ${formData.comments || ''}`,
                    amount: formData.loanAmount,
                    address: `${formData.street} ${formData.houseNumber}`,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    dateOfBirth: formData.dateOfBirth,
                    additionalData: {
                        // Personal data
                        civilStatus: formData.civilStatus,
                        nationality: formData.nationality,
                        salutation: formData.salutation,
                        telephoneType: formData.telephoneType,
                        country: formData.country,
                        residenceDuration: `${formData.residenceYears} anni, ${formData.residenceMonths} mesi`,
                        ownsHome: formData.ownsHome,
                        
                        // Employment data
                        occupation: formData.professionalSituation,
                        company: formData.company,
                        employmentDuration: `${formData.employmentYears} anni, ${formData.employmentMonths} mesi`,
                        employmentRelationship: formData.employmentRelationship,
                        commutingMethod: formData.commutingMethod,
                        
                        // Financial data
                        monthlyIncome: formData.netMonthlyIncome,
                        has13thSalary: formData.has13thSalary,
                        hasBonus: formData.hasBonus,
                        hasSecondaryEmployment: formData.hasSecondaryEmployment,
                        hasAdditionalIncome: formData.hasAdditionalIncome,
                        housingCosts: formData.housingCosts,
                        housingSituation: formData.housingSituation,
                        hasChildren: formData.hasChildren,
                        paysAlimony: formData.paysAlimony,
                        hasObligations: formData.hasObligations,
                        monthlyInstalments: formData.monthlyInstalments,
                        debtEnforcements: formData.debtEnforcements,
                        
                        // Loan data
                        loanDuration: formData.duration,
                        monthlyPayment: formData.monthlyPayment,
                        creditProtectionInsurance: formData.creditProtectionInsurance,
                        
                        // Simulator metadata (if available)
                        ...(simulatorData && {
                            simulatorData: {
                                amount: simulatorData.amount,
                                duration: simulatorData.duration,
                                guarantee: simulatorData.guarantee,
                                property: simulatorData.property,
                                minRate: simulatorData.minRate,
                                maxRate: simulatorData.maxRate,
                                minMonthlyPayment: simulatorData.minMonthlyPayment,
                                maxMonthlyPayment: simulatorData.maxMonthlyPayment,
                                guaranteeFee: simulatorData.guaranteeFee,
                                simulatedAt: simulatorData.simulatedAt
                            }
                        })
                    },
                    files: filesToUpload.length > 0 ? filesToUpload : undefined
                });

                if (result.success) {
                    // Track successful submission
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'loan_application_completed', {
                            loan_amount: formData.loanAmount,
                            duration: formData.duration,
                            has_simulator_data: !!simulatorData,
                            files_uploaded: filesToUpload.length
                        });
                    }
                    
                    // Clear simulator data after successful submission
                    sessionStorage.removeItem('credit_simulator_data');
                    sessionStorage.removeItem(FORM_STORAGE_KEY);
                    sessionStorage.removeItem(STEP_STORAGE_KEY);
                    
                    alert('✅ Richiesta inviata con successo! Ti contatteremo presto.');
                    onClose();
                } else {
                    // Track submission error
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'loan_application_error', {
                            error: result.error,
                            step: currentStep
                        });
                    }
                    alert(`${t('loanRequest.messages.error')}: ${result.error || ''}`);
                }
            } catch (error) {
                console.error('Errore invio richiesta:', error);
                // Track exception
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'exception', {
                        description: 'loan_application_exception',
                        fatal: false
                    });
                }
                alert(t('loanRequest.messages.errorGeneric'));
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // Scroll to top to show errors
            document.querySelector('.modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleClose = () => {
        // Track abandonment if not completed
        if (currentStep < totalSteps) {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'loan_application_abandoned', {
                    step: currentStep,
                    total_steps: totalSteps,
                    completion_percentage: ((currentStep / totalSteps) * 100).toFixed(0)
                });
            }
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>×</button>

                <div className="modal-header">
                    <h2>{t('loanRequest.title')}</h2>
                </div>

                <div className="modal-progress">
                    <ProgressStepper
                        steps={formSteps}
                        currentStep={currentStep}
                        allowNavigation
                        onStepClick={(step) => step < currentStep && setCurrentStep(step)}
                    />
                </div>

                <div className="modal-body">
                    {/* Simulator Data Summary - Show at top of first step */}
                    {currentStep === 1 && simulatorData && (
                        <div className="simulator-summary-card">
                            <div className="simulator-summary-header">
                                <span className="simulator-summary-emoji" aria-hidden="true">✅</span>
                                <h4>{t('loanRequest.simulatorLoaded')}</h4>
                            </div>
                            <div className="simulator-summary-grid">
                                <div className="simulator-summary-item">
                                    <span className="simulator-summary-label">{t('loanRequest.loanAmount')}</span>
                                    <strong>CHF {simulatorData.amount.toLocaleString('de-CH')}</strong>
                                </div>
                                <div className="simulator-summary-item">
                                    <span className="simulator-summary-label">{t('loanRequest.duration')}</span>
                                    <strong>{simulatorData.duration} {t('loanRequest.months')}</strong>
                                </div>
                                <div className="simulator-summary-item">
                                    <span className="simulator-summary-label">{t('loanRequest.estimatedPayment')}</span>
                                    <strong>CHF {simulatorData.minMonthlyPayment.toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Document Preparation Reminder */}
                    {currentStep === 1 && (
                        <DocumentPreparationReminder variant="compact" />
                    )}

                    {/* Error Messages */}
                    {errors.length > 0 && (
                        <div className="error-box">
                            <h4>{t('loanRequest.errorTitle')}</h4>
                            <ul>
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Step 1 - Personal details */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h3>{t('loanRequest.steps.personalDetails')}</h3>
                            <p className="step-description">{t('loanRequest.sections.personalData')}</p>

                            <div className="form-section">
                                <h4>{t('loanRequest.sections.personalData')}</h4>
                                {renderSectionErrors(SECTION_FIELD_SETS.personalData)}

                                {renderSelect('salutation', {
                                    label: t('loanRequest.fields.salutation'),
                                    required: true,
                                    options: salutationOptions,
                                    variant: 'buttons'
                                })}

                                <div className="smart-grid two-columns">
                                    {renderInput('firstName', {
                                        label: t('loanRequest.fields.firstName'),
                                        placeholder: t('loanRequest.placeholders.firstName'),
                                        required: true,
                                        autoComplete: 'given-name'
                                    })}
                                    {renderInput('lastName', {
                                        label: t('loanRequest.fields.lastName'),
                                        placeholder: t('loanRequest.placeholders.lastName'),
                                        required: true,
                                        autoComplete: 'family-name'
                                    })}
                                </div>

                                {renderInput('dateOfBirth', {
                                    label: t('loanRequest.fields.dateOfBirth'),
                                    type: 'date',
                                    required: true,
                                    min: dobMin,
                                    max: dobMax
                                })}

                                <div className="smart-grid two-columns">
                                    {renderSelect('civilStatus', {
                                        label: t('loanRequest.fields.civilStatus'),
                                        required: true,
                                        options: civilStatusOptions,
                                        variant: 'buttons'
                                    })}
                                    {renderSelect('nationality', {
                                        label: t('loanRequest.fields.nationality'),
                                        required: true,
                                        variant: 'dropdown',
                                        options: countryOptions
                                    })}
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>{t('loanRequest.sections.contacts')}</h4>
                                {renderSectionErrors(SECTION_FIELD_SETS.contacts)}

                                <div className="smart-grid two-columns">
                                    {renderInput('areaCode', {
                                        label: t('loanRequest.fields.areaCode'),
                                        type: 'tel',
                                        required: true,
                                        placeholder: t('loanRequest.placeholders.areaCode'),
                                        autoComplete: 'tel-country-code'
                                    })}
                                    {renderInput('telephoneNumber', {
                                        label: t('loanRequest.fields.telephoneNumber'),
                                        type: 'tel',
                                        required: true,
                                        placeholder: t('loanRequest.placeholders.telephoneNumber'),
                                        autoComplete: 'tel'
                                    })}
                                </div>

                                {renderSelect('telephoneType', {
                                    label: t('loanRequest.fields.telephoneType'),
                                    required: true,
                                    variant: 'buttons',
                                    options: phoneTypeOptions
                                })}

                                {formData.additionalPhones.map((phone, index) => {
                                    const areaCodeKey = buildAdditionalPhoneKey(index, 'areaCode');
                                    const numberKey = buildAdditionalPhoneKey(index, 'number');
                                    const typeKey = buildAdditionalPhoneKey(index, 'type');
                                    return (
                                        <div key={`additional-phone-${index}`} className="additional-phone-card">
                                            <div className="smart-grid two-columns">
                                                <SmartInput
                                                    label={`${t('loanRequest.fields.areaCode')} ${index + 2}`}
                                                    type="tel"
                                                    value={phone.areaCode}
                                                    onChange={(value) => {
                                                        const newPhones = [...formData.additionalPhones];
                                                        newPhones[index].areaCode = value;
                                                        setFormData({ ...formData, additionalPhones: newPhones });
                                                        clearFieldError(areaCodeKey);
                                                    }}
                                                    error={getFieldErrorMessage(areaCodeKey)}
                                                />
                                                <SmartInput
                                                    label={`${t('loanRequest.fields.telephoneNumber')} ${index + 2}`}
                                                    type="tel"
                                                    value={phone.number}
                                                    onChange={(value) => {
                                                        const newPhones = [...formData.additionalPhones];
                                                        newPhones[index].number = value;
                                                        setFormData({ ...formData, additionalPhones: newPhones });
                                                        clearFieldError(numberKey);
                                                    }}
                                                    error={getFieldErrorMessage(numberKey)}
                                                />
                                            </div>
                                            <SmartSelect
                                                label={t('loanRequest.fields.telephoneType')}
                                                value={phone.type}
                                                onChange={(value) => {
                                                    const newPhones = [...formData.additionalPhones];
                                                    newPhones[index].type = value;
                                                    setFormData({ ...formData, additionalPhones: newPhones });
                                                    clearFieldError(typeKey);
                                                }}
                                                options={phoneTypeOptions}
                                                error={getFieldErrorMessage(typeKey)}
                                                variant="buttons"
                                            />
                                            <button type="button" className="btn-remove" onClick={() => removePhoneNumber(index)}>
                                                {t('loanRequest.fields.removePhone')}
                                            </button>
                                        </div>
                                    );
                                })}

                                <button type="button" className="btn-add" onClick={addPhoneNumber}>
                                    {t('loanRequest.fields.addPhone')}
                                </button>

                                {renderInput('email', {
                                    label: t('loanRequest.fields.emailAddress'),
                                    type: 'email',
                                    placeholder: t('loanRequest.placeholders.emailAddress'),
                                    required: true,
                                    autoComplete: 'email'
                                })}

                                <label className="smart-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.privacyAccepted}
                                        onChange={(e) => handleChange('privacyAccepted', e.target.checked)}
                                    />
                                    <span>{t('loanRequest.fields.privacyStatement')}</span>
                                </label>
                            </div>

                            <div className="form-section">
                                <h4>{t('loanRequest.sections.residenceAddress')}</h4>
                                {renderSectionErrors(SECTION_FIELD_SETS.residence)}

                                {renderSelect('country', {
                                    label: t('loanRequest.fields.country'),
                                    variant: 'dropdown',
                                    required: true,
                                    options: countryOptions
                                })}

                                <div className="smart-grid two-columns">
                                    {renderInput('postalCode', {
                                        label: t('loanRequest.fields.postalCode'),
                                        placeholder: t('loanRequest.placeholders.postalCodeCH'),
                                        required: true,
                                        type: 'text'
                                    })}
                                    {renderInput('city', {
                                        label: t('loanRequest.fields.city'),
                                        placeholder: t('loanRequest.placeholders.city'),
                                        required: true
                                    })}
                                </div>

                                <div className="smart-grid two-columns">
                                    {renderInput('street', {
                                        label: t('loanRequest.fields.street'),
                                        placeholder: t('loanRequest.placeholders.street'),
                                        required: true
                                    })}
                                    {renderInput('houseNumber', {
                                        label: t('loanRequest.fields.houseNumber'),
                                        placeholder: t('loanRequest.placeholders.houseNumber'),
                                        required: true
                                    })}
                                </div>

                                <div className="smart-grid two-columns">
                                    {renderInput('residenceMonths', {
                                        label: t('loanRequest.fields.residenceMonths'),
                                        type: 'number',
                                        min: 0,
                                        max: 11,
                                        required: true
                                    })}
                                    {renderInput('residenceYears', {
                                        label: t('loanRequest.fields.residenceYears'),
                                        type: 'number',
                                        min: 0,
                                        max: 100,
                                        required: true
                                    })}
                                </div>

                                {renderSelect('ownsHome', {
                                    label: t('loanRequest.fields.ownsHome'),
                                    required: true,
                                    variant: 'buttons',
                                    options: yesNoOptions
                                })}
                            </div>
                        </div>
                    )}
                    {/* Step 2 - Occupation and income */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h3>{t('loanRequest.steps.occupationIncome')}</h3>
                            <p className="step-description">{t('loanRequest.sections.professionalSituation')}</p>

                            <div className="form-section">
                                <h4>{t('loanRequest.sections.professionalSituation')}</h4>
                                {renderSectionErrors(SECTION_FIELD_SETS.occupation)}

                                {renderSelect('professionalSituation', {
                                    label: t('loanRequest.fields.professionalSituation'),
                                    required: true,
                                    options: professionalSituationOptions,
                                    variant: 'cards'
                                })}
                            </div>

                            {(formData.professionalSituation === 'Employed' || formData.professionalSituation === 'Self-employed') && (
                                <div className="form-section">
                                    <h4>{t('loanRequest.sections.employerData')}</h4>
                                    {renderSectionErrors(SECTION_FIELD_SETS.employer)}

                                    {renderInput('company', {
                                        label: t('loanRequest.fields.company'),
                                        required: true
                                    })}

                                    <div className="smart-grid two-columns">
                                        {renderInput('employerStreet', {
                                            label: t('loanRequest.fields.street'),
                                            required: true
                                        })}
                                        {renderInput('employerHouseNumber', {
                                            label: t('loanRequest.fields.houseNumber'),
                                            required: true
                                        })}
                                    </div>

                                    <div className="smart-grid two-columns">
                                        {renderInput('employerPostalCode', {
                                            label: t('loanRequest.fields.postalCode'),
                                            required: true
                                        })}
                                        {renderInput('employerCity', {
                                            label: t('loanRequest.fields.city'),
                                            required: true
                                        })}
                                    </div>

                                    {renderSelect('employmentRelationship', {
                                        label: t('loanRequest.fields.employmentRelationship'),
                                        required: true,
                                        variant: 'buttons',
                                        options: employmentRelationshipOptions
                                    })}

                                    <div className="smart-grid two-columns">
                                        {renderInput('employmentMonths', {
                                            label: t('loanRequest.fields.employmentMonths'),
                                            type: 'number',
                                            min: 0,
                                            max: 11,
                                            required: true
                                        })}
                                        {renderInput('employmentYears', {
                                            label: t('loanRequest.fields.employmentYears'),
                                            type: 'number',
                                            min: 0,
                                            max: 60,
                                            required: true
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="form-section">
                                <h4>{t('loanRequest.sections.income')}</h4>
                                {renderSectionErrors(SECTION_FIELD_SETS.income)}

                                {renderSelect('commutingMethod', {
                                    label: t('loanRequest.fields.commutingMethod'),
                                    required: true,
                                    variant: 'buttons',
                                    options: commutingOptions
                                })}

                                {formData.commutingMethod === 'Car' && renderSelect('carNecessary', {
                                    label: t('loanRequest.fields.carNecessary'),
                                    required: true,
                                    options: yesNoOptions,
                                    variant: 'buttons'
                                })}

                                {renderInput('netMonthlyIncome', {
                                    label: t('loanRequest.fields.netMonthlyIncome'),
                                    type: 'number',
                                    required: true,
                                    currency: 'CHF'
                                })}

                                <div className="smart-grid two-columns">
                                    {renderSelect('has13thSalary', {
                                        label: t('loanRequest.fields.has13thSalary'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                    {renderSelect('hasBonus', {
                                        label: t('loanRequest.fields.hasBonus'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                </div>

                                <div className="smart-grid two-columns">
                                    {renderSelect('hasSecondaryEmployment', {
                                        label: t('loanRequest.fields.hasSecondaryEmployment'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                    {renderSelect('hasAdditionalIncome', {
                                        label: t('loanRequest.fields.hasAdditionalIncome'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                </div>

                                {renderSectionErrors(SECTION_FIELD_SETS.loanRepayment)}
                                {renderSelect('beneficialOwnership', {
                                    label: t('loanRequest.fields.beneficialOwnership'),
                                    required: true,
                                    options: beneficialOwnershipOptions,
                                    variant: 'cards'
                                })}
                            </div>
                        </div>
                    )}
                    {/* Step 3 - Living and expenses */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h3>{t('loanRequest.steps.livingExpenses')}</h3>
                            <p className="step-description">{t('loanRequest.steps.livingExpenses')}</p>

                            <div className="form-section">
                                {renderSectionErrors(SECTION_FIELD_SETS.living)}

                                {renderSelect('housingSituation', {
                                    label: t('loanRequest.fields.housingSituation'),
                                    required: true,
                                    variant: 'cards',
                                    options: housingSituationOptions
                                })}

                                {renderInput('housingCosts', {
                                    label: t('loanRequest.fields.housingCosts'),
                                    type: 'number',
                                    currency: 'CHF',
                                    placeholder: t('loanRequest.placeholders.housingCosts'),
                                    required: true
                                })}

                                <div className="smart-grid two-columns">
                                    {renderSelect('hasChildren', {
                                        label: t('loanRequest.fields.hasChildren'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                    {renderSelect('paysAlimony', {
                                        label: t('loanRequest.fields.paysAlimony'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Step 4 - Additional questions and credit information */}
                    {currentStep === 4 && (
                        <div className="form-step">
                            <h3>{t('loanRequest.steps.additionalQuestions')}</h3>

                            <div className="form-section">
                                {renderSectionErrors(SECTION_FIELD_SETS.obligations)}

                                <div className="smart-grid two-columns">
                                    {renderSelect('heavyLabor', {
                                        label: t('loanRequest.fields.heavyLabor'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                    {renderSelect('hasObligations', {
                                        label: t('loanRequest.fields.hasObligations'),
                                        required: true,
                                        options: yesNoOptions,
                                        variant: 'buttons'
                                    })}
                                </div>

                                {formData.hasObligations === 'Yes' && renderInput('monthlyInstalments', {
                                    label: t('loanRequest.fields.monthlyInstalments'),
                                    type: 'number',
                                    currency: 'CHF',
                                    placeholder: t('loanRequest.placeholders.monthlyInstalments'),
                                    required: true
                                })}

                                {renderSelect('debtEnforcements', {
                                    label: t('loanRequest.fields.debtEnforcements'),
                                    required: true,
                                    options: debtEnforcementOptions,
                                    variant: 'buttons'
                                })}
                            </div>
                        </div>
                    )}
                    {/* Step 5 - Credit protection insurance & invio */}
                    {currentStep === 5 && (
                        <div className="form-step">
                            <h3>{t('loanRequest.steps.creditProtection')}</h3>

                            <div className="form-section">
                                {renderSectionErrors(SECTION_FIELD_SETS.creditProtection)}

                                {renderSelect('creditProtectionInsurance', {
                                    label: t('loanRequest.fields.creditProtectionInsurance'),
                                    required: true,
                                    options: yesNoOptions,
                                    variant: 'buttons',
                                    hint: t('loanRequest.fields.creditProtectionDescription')
                                })}

                                <label className="smart-textarea">
                                    <span>{t('loanRequest.fields.comments')}</span>
                                    <textarea
                                        rows={5}
                                        value={formData.comments}
                                        onChange={(e) => handleChange('comments', e.target.value)}
                                        placeholder={t('loanRequest.placeholders.comments')}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                    {/* Step 6 - Document uploads */}
                    {currentStep === 6 && (
                        <div className="form-step">
                            <h3>{t('loanRequest.steps.documents')}</h3>
                            {renderSectionErrors(SECTION_FIELD_SETS.documents)}

                            <div className="form-section document-grid smart-upload-grid">
                                {DOCUMENT_REQUIREMENTS.map((doc) => (
                                    <SmartFileUpload
                                        key={doc.field}
                                        label={t(doc.translationKey)}
                                        value={(formData[doc.field] as File | null) ?? null}
                                        onChange={(file) => handleFileSelection(doc.field as DocumentField, file)}
                                        required={!doc.optional}
                                        error={fileErrors[doc.field]}
                                        hint={t('loanRequest.documents.fileNote')}
                                        maxSize={DEFAULT_MAX_UPLOAD_MB}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-nav btn-prev" onClick={handlePrevious} disabled={currentStep === 1}>
                        {t('loanRequest.buttons.previous')}
                    </button>

                    {currentStep < totalSteps ? (
                        <button type="button" className="btn-nav btn-next" onClick={handleNext}>
                            {t('loanRequest.buttons.next')}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-nav btn-submit"
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

export default LoanRequestModal;
