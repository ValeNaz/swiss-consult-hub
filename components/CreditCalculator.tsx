import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from './Button';
import ProgressStepper from './form/ProgressStepper';
import DocumentPreparationReminder from './DocumentPreparationReminder';
import { DOCUMENT_REQUIREMENTS } from '../constants/documentRequirements';
import '../styles/CreditCalculator.css';

interface CreditCalculatorProps {
    onOpenLoanModal?: () => void;
}

export interface SimulatorData {
    amount: number;
    duration: number;
    guarantee: 'yes' | 'no';
    property: 'yes' | 'no';
    minRate: number;
    maxRate: number;
    minMonthlyPayment: number;
    maxMonthlyPayment: number;
    guaranteeFee: number;
    simulatedAt: string;
}

const BASE_RATES = {
    withProperty: { min: 0.049, max: 0.08 },
    withoutProperty: { min: 0.062, max: 0.098 }
} as const;

const GUARANTEE_FACTORS = {
    withProperty: 0.001625,
    withoutProperty: 0.001795
} as const;

const MIN_AMOUNT = 5000;
const MAX_AMOUNT = 250000;
const MIN_DURATION = 6;
const MAX_DURATION = 84;

const formatCHF = (value: number) => value.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CreditCalculator: React.FC<CreditCalculatorProps> = ({ onOpenLoanModal }) => {
    const { t } = useTranslation('services');
    const { t: tForms } = useTranslation('forms');
    const { t: tCommon } = useTranslation('common');
    const [amount, setAmount] = useState(10000);
    const [duration, setDuration] = useState(36);
    const [guarantee, setGuarantee] = useState<'yes' | 'no'>('yes');
    const [property, setProperty] = useState<'yes' | 'no'>('no');
    const [hasSimulated, setHasSimulated] = useState(false);
    const [showTooltip, setShowTooltip] = useState<string | null>(null);
    const [amountInput, setAmountInput] = useState(String(10000));
    const [durationInput, setDurationInput] = useState(String(36));
    const [currentStep, setCurrentStep] = useState(1);

    const calculatorSteps = useMemo(() => [
        {
            number: 1,
            title: t('calculator.stepsFlow.documents.title'),
            description: t('calculator.stepsFlow.documents.description')
        },
        {
            number: 2,
            title: t('calculator.stepsFlow.simulation.title'),
            description: t('calculator.stepsFlow.simulation.description')
        },
        {
            number: 3,
            title: t('calculator.stepsFlow.summary.title'),
            description: t('calculator.stepsFlow.summary.description')
        }
    ], [t]);

    const documentChecklist = useMemo(() => DOCUMENT_REQUIREMENTS.map((doc) => ({
        ...doc,
        label: tForms(doc.translationKey)
    })), [tForms]);

    const totalSteps = calculatorSteps.length;

    const nextButtonLabel = useMemo(() => {
        if (currentStep === 1) {
            return t('calculator.navigation.reviewDocuments');
        }
        if (currentStep === 2) {
            return t('calculator.navigation.viewSummary');
        }
        return null;
    }, [currentStep, t]);

    const amountRangeLabels = useMemo(() => ({
        min: `CHF ${formatCHF(MIN_AMOUNT)}`,
        max: `CHF ${formatCHF(MAX_AMOUNT)}`
    }), []);

    const durationRangeLabels = useMemo(() => ({
        min: `${MIN_DURATION} ${t('detail.calculator.values.months', { count: MIN_DURATION })}`,
        max: `${MAX_DURATION} ${t('detail.calculator.values.months', { count: MAX_DURATION })}`
    }), [t]);

    useEffect(() => {
        const savedData = sessionStorage.getItem('credit_simulator_data');
        if (savedData) {
            try {
                const parsed: SimulatorData = JSON.parse(savedData);
                setAmount(parsed.amount);
                setDuration(parsed.duration);
                setGuarantee(parsed.guarantee);
                setProperty(parsed.property);
                setAmountInput(String(parsed.amount));
                setDurationInput(String(parsed.duration));
                setHasSimulated(true);
            } catch (error) {
                console.error('Error loading simulator data:', error);
            }
        }
    }, []);

    // Base interest rates
    // Calculate monthly payment
    const calculateMonthlyPayment = (principal: number, months: number, annualRate: number) => {
        const monthlyRate = annualRate / 12;
        return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    };

    const rates = useMemo(
        () => (property === 'yes' ? BASE_RATES.withProperty : BASE_RATES.withoutProperty),
        [property]
    );

    const guaranteeFactor = useMemo(
        () => (property === 'yes' ? GUARANTEE_FACTORS.withProperty : GUARANTEE_FACTORS.withoutProperty),
        [property]
    );

    const simulationMetrics = useMemo(() => {
        const minPayment = calculateMonthlyPayment(amount, duration, rates.min);
        const maxPayment = calculateMonthlyPayment(amount, duration, rates.max);
        const guaranteeFee = guarantee === 'yes' ? amount * guaranteeFactor : 0;
        const totalMinPayment = minPayment + guaranteeFee;
        const totalMaxPayment = maxPayment + guaranteeFee;

        return {
            minPayment,
            maxPayment,
            guaranteeFee,
            totalMinPayment,
            totalMaxPayment,
            totalMinRepayment: totalMinPayment * duration,
            totalMaxRepayment: totalMaxPayment * duration
        };
    }, [amount, duration, guarantee, rates, guaranteeFactor]);

    const {
        minPayment,
        maxPayment,
        guaranteeFee,
        totalMinPayment,
        totalMaxPayment,
        totalMinRepayment,
        totalMaxRepayment
    } = simulationMetrics;

    const saveSimulatorData = useCallback(() => {
        const simulatorData: SimulatorData = {
            amount,
            duration,
            guarantee,
            property,
            minRate: rates.min,
            maxRate: rates.max,
            minMonthlyPayment: totalMinPayment,
            maxMonthlyPayment: totalMaxPayment,
            guaranteeFee,
            simulatedAt: new Date().toISOString()
        };
        sessionStorage.setItem('credit_simulator_data', JSON.stringify(simulatorData));

        // Track simulation event for analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'credit_simulation', {
                amount,
                duration,
                has_guarantee: guarantee === 'yes',
                has_property: property === 'yes'
            });
        }
    }, [amount, duration, guarantee, property, rates, totalMinPayment, totalMaxPayment, guaranteeFee]);

    const handleSimulate = useCallback(() => {
        setHasSimulated(true);
        saveSimulatorData();
    }, [saveSimulatorData]);

    const handleNextStep = useCallback(() => {
        if (currentStep === 2 && !hasSimulated) {
            handleSimulate();
        }
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }, [currentStep, hasSimulated, handleSimulate, totalSteps]);

    const handlePreviousStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    const handleOpenModal = useCallback(() => {
        saveSimulatorData();
        onOpenLoanModal?.();
    }, [onOpenLoanModal, saveSimulatorData]);

    const handleAmountChange = useCallback((value: string) => {
        const numValue = parseInt(value, 10);
        if (!Number.isNaN(numValue) && numValue >= MIN_AMOUNT && numValue <= MAX_AMOUNT) {
            setAmount(numValue);
            setAmountInput(value);
            handleSimulate();
        }
    }, [handleSimulate]);

    const handleDurationChange = useCallback((value: string) => {
        const numValue = parseInt(value, 10);
        if (!Number.isNaN(numValue) && numValue >= MIN_DURATION && numValue <= MAX_DURATION) {
            setDuration(numValue);
            setDurationInput(value);
            handleSimulate();
        }
    }, [handleSimulate]);
    
    useEffect(() => {
        if (hasSimulated) {
            saveSimulatorData();
        }
    }, [hasSimulated, saveSimulatorData]);

    return (
        <div className="credit-calculator">
            <div className="calculator-intro">
                <p>{t('detail.calculator.intro')}</p>
            </div>

            <div className="calculator-stepper">
                <ProgressStepper
                    steps={calculatorSteps}
                    currentStep={currentStep}
                    allowNavigation
                    onStepClick={(step) => setCurrentStep(step)}
                />
            </div>

            <div className="calculator-step-panel">
                {currentStep === 1 && (
                    <div className="calculator-step documents-step">
                        <div className="documents-header">
                            <FileText size={24} />
                            <div>
                                <h3>{t('detail.calculator.documents.title')}</h3>
                                <p className="documents-subtitle">
                                    {t('detail.calculator.documents.subtitle')}
                                </p>
                            </div>
                        </div>
                        <ul className="documents-list">
                            {documentChecklist.map((doc) => (
                                <li key={doc.field} className="document-item">
                                    <CheckCircle2 size={16} />
                                    <div className="document-info">
                                        <span>{doc.label}</span>
                                        {doc.optional && (
                                            <span className="document-optional-badge">{tCommon('misc.optional')}</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="documents-optional">
                            <AlertCircle size={14} />
                            {t('detail.calculator.documents.optional')}
                        </p>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="calculator-step simulation-step">
                        <div className="calculator-controls">
                            {/* Importo del credito */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="amount">
                                    {t('detail.calculator.labels.desiredCredit')}
                                    <button
                                        type="button"
                                        className="tooltip-trigger"
                                        onMouseEnter={() => setShowTooltip('amount')}
                                        onMouseLeave={() => setShowTooltip(null)}
                                        onClick={() => setShowTooltip(showTooltip === 'amount' ? null : 'amount')}
                                        aria-label="Informazioni"
                                    >
                                        <Info size={16} />
                                    </button>
                                </label>
                                {showTooltip === 'amount' && (
                                    <div className="tooltip-content">
                                        {t('detail.calculator.tooltips.amount')}
                                    </div>
                                )}
                                <div className="input-with-slider">
                                    <input
                                        type="number"
                                        className="number-input"
                                        value={amountInput}
                                        onChange={(e) => setAmountInput(e.target.value)}
                                        onBlur={(e) => handleAmountChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAmountChange(amountInput);
                                            }
                                        }}
                                        min={MIN_AMOUNT}
                                        max={MAX_AMOUNT}
                                        step="500"
                                    />
                                    <span className="input-currency">CHF</span>
                                </div>
                                <div className="slider-container">
                                    <input
                                        type="range"
                                        id="amount"
                                        min={MIN_AMOUNT}
                                        max={MAX_AMOUNT}
                                        step="500"
                                        value={amount}
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                    />
                                    <div className="slider-range-labels">
                                        <span>{amountRangeLabels.min}</span>
                                        <span>{amountRangeLabels.max}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Durata in mesi */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="duration">
                                    {t('detail.calculator.labels.duration')}
                                    <button
                                        type="button"
                                        className="tooltip-trigger"
                                        onMouseEnter={() => setShowTooltip('duration')}
                                        onMouseLeave={() => setShowTooltip(null)}
                                        onClick={() => setShowTooltip(showTooltip === 'duration' ? null : 'duration')}
                                        aria-label="Informazioni"
                                    >
                                        <Info size={16} />
                                    </button>
                                </label>
                                {showTooltip === 'duration' && (
                                    <div className="tooltip-content">
                                        {t('detail.calculator.tooltips.duration')}
                                    </div>
                                )}
                                <div className="input-with-slider">
                                    <input
                                        type="number"
                                        className="number-input"
                                        value={durationInput}
                                        onChange={(e) => setDurationInput(e.target.value)}
                                        onBlur={(e) => handleDurationChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleDurationChange(durationInput);
                                            }
                                        }}
                                        min={MIN_DURATION}
                                        max={MAX_DURATION}
                                        step={6}
                                    />
                                    <span className="input-currency">{t('detail.calculator.values.months', { count: duration })}</span>
                                </div>
                                <div className="slider-container">
                                    <input
                                        type="range"
                                        id="duration"
                                        min={MIN_DURATION}
                                        max={MAX_DURATION}
                                        step={6}
                                        value={duration}
                                        onChange={(e) => handleDurationChange(e.target.value)}
                                    />
                                    <div className="slider-range-labels">
                                        <span>{durationRangeLabels.min}</span>
                                        <span>{durationRangeLabels.max}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Garanzia del credito */}
                            <div className="form-group">
                                <label className="form-label">
                                    {t('detail.calculator.labels.wantGuarantee')}
                                    <button
                                        type="button"
                                        className="tooltip-trigger"
                                        onMouseEnter={() => setShowTooltip('guarantee')}
                                        onMouseLeave={() => setShowTooltip(null)}
                                        onClick={() => setShowTooltip(showTooltip === 'guarantee' ? null : 'guarantee')}
                                        aria-label="Informazioni"
                                    >
                                        <Info size={16} />
                                    </button>
                                </label>
                                {showTooltip === 'guarantee' && (
                                    <div className="tooltip-content">
                                        {t('detail.calculator.tooltips.guarantee')}
                                    </div>
                                )}
                                <div className="button-group">
                                    <button
                                        type="button"
                                        className={guarantee === 'yes' ? 'active' : ''}
                                        onClick={() => {
                                            setGuarantee('yes');
                                            handleSimulate();
                                        }}
                                    >
                                        {t('detail.calculator.values.yes')}
                                    </button>
                                    <button
                                        type="button"
                                        className={guarantee === 'no' ? 'active' : ''}
                                        onClick={() => {
                                            setGuarantee('no');
                                            handleSimulate();
                                        }}
                                    >
                                        {t('detail.calculator.values.no')}
                                    </button>
                                </div>
                            </div>

                            {/* Proprietà immobiliare */}
                            <div className="form-group">
                                <label className="form-label">
                                    {t('detail.calculator.labels.ownProperty')}
                                    <button
                                        type="button"
                                        className="tooltip-trigger"
                                        onMouseEnter={() => setShowTooltip('property')}
                                        onMouseLeave={() => setShowTooltip(null)}
                                        onClick={() => setShowTooltip(showTooltip === 'property' ? null : 'property')}
                                        aria-label="Informazioni"
                                    >
                                        <Info size={16} />
                                    </button>
                                </label>
                                {showTooltip === 'property' && (
                                    <div className="tooltip-content">
                                        {t('detail.calculator.tooltips.property')}
                                    </div>
                                )}
                                <div className="button-group">
                                    <button
                                        type="button"
                                        className={property === 'yes' ? 'active' : ''}
                                        onClick={() => {
                                            setProperty('yes');
                                            handleSimulate();
                                        }}
                                    >
                                        {t('detail.calculator.values.yes')}
                                    </button>
                                    <button
                                        type="button"
                                        className={property === 'no' ? 'active' : ''}
                                        onClick={() => {
                                            setProperty('no');
                                            handleSimulate();
                                        }}
                                    >
                                        {t('detail.calculator.values.no')}
                                    </button>
                                </div>
                                <p className="field-hint success">
                                    <CheckCircle2 size={14} />
                                    {t('detail.calculator.hints.betterRates')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="calculator-step summary-step">
                        <div className="calculator-results">
                            <h3>{t('detail.calculator.labels.monthlyPayment')}</h3>
                            <div className="result-row">
                                <div className="result-column">
                                    <span className="interest-rate">
                                        {t('detail.calculator.results.interestRateFrom', { rate: (rates.min * 100).toFixed(1) })}
                                    </span>
                                    <span className="monthly-payment">
                                        CHF {formatCHF(totalMinPayment)}
                                    </span>
                                    {guarantee === 'yes' && (
                                        <span className="guarantee-fee">
                                            {t('detail.calculator.results.guaranteeFee', { fee: `CHF ${formatCHF(guaranteeFee)}` })}
                                        </span>
                                    )}
                                    <span className="total-repayment">
                                        {t('detail.calculator.results.totalRepayment')}: CHF {formatCHF(totalMinRepayment)}
                                    </span>
                                </div>
                                <div className="result-column">
                                    <span className="interest-rate">
                                        {t('detail.calculator.values.to')} {(rates.max * 100).toFixed(1)} %
                                    </span>
                                    <span className="monthly-payment">
                                        CHF {formatCHF(totalMaxPayment)}
                                    </span>
                                    {guarantee === 'yes' && (
                                        <span className="guarantee-fee">
                                            {t('detail.calculator.results.guaranteeFee', { fee: `CHF ${formatCHF(guaranteeFee)}` })}
                                        </span>
                                    )}
                                    <span className="total-repayment">
                                        {t('detail.calculator.results.totalRepayment')}: CHF {formatCHF(totalMaxRepayment)}
                                    </span>
                                </div>
                            </div>
                            <p className="disclaimer">
                                <Info size={14} />
                                {t('detail.calculator.results.disclaimer')}
                            </p>
                        </div>

                        <DocumentPreparationReminder variant="compact" />

                        {hasSimulated && onOpenLoanModal && (
                            <div className="calculator-cta">
                                <Button
                                    variant="tertiary"
                                    size="lg"
                                    onClick={handleOpenModal}
                                >
                                    {t('detail.calculator.results.ctaButton')}
                                </Button>
                                <p className="cta-info">
                                    {t('detail.calculator.results.autoSaveInfo')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="calculator-step-actions">
                {currentStep > 1 && (
                    <button
                        type="button"
                        className="calculator-nav-button secondary"
                        onClick={handlePreviousStep}
                    >
                        {tCommon('buttons.back')}
                    </button>
                )}

                {currentStep < totalSteps && nextButtonLabel && (
                    <button
                        type="button"
                        className="calculator-nav-button primary"
                        onClick={handleNextStep}
                    >
                        {nextButtonLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CreditCalculator;
