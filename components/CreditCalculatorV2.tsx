import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/CreditCalculatorV2.css';

interface CreditCalculatorV2Props {
    onOpenLoanModal?: () => void;
}

export interface SimulatorDataV2 {
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
    withProperty: { min: 0.069, max: 0.109 },
    withoutProperty: { min: 0.069, max: 0.109 }
} as const;

const GUARANTEE_FACTORS = {
    withProperty: 0.001655,
    withoutProperty: 0.001845
} as const;

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 100000;
const MIN_DURATION = 6;
const MAX_DURATION = 84;

const formatCHF = (value: number) => value.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CreditCalculatorV2: React.FC<CreditCalculatorV2Props> = ({ onOpenLoanModal }) => {
    const { t } = useTranslation('services');
    const [amount, setAmount] = useState(10000);
    const [duration, setDuration] = useState(36);
    const [guarantee, setGuarantee] = useState<'yes' | 'no'>('yes');
    const [property, setProperty] = useState<'yes' | 'no'>('no');

    // Calculate monthly payment with annuity formula
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
        guaranteeFee,
        totalMinPayment,
        totalMaxPayment,
        totalMinRepayment,
        totalMaxRepayment
    } = simulationMetrics;

    const saveSimulatorData = useCallback(() => {
        const simulatorData: SimulatorDataV2 = {
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
            (window as any).gtag('event', 'credit_simulation_v2', {
                amount,
                duration,
                has_guarantee: guarantee === 'yes',
                has_property: property === 'yes'
            });
        }
    }, [amount, duration, guarantee, property, rates, totalMinPayment, totalMaxPayment, guaranteeFee]);

    const handleOpenModal = useCallback(() => {
        saveSimulatorData();
        onOpenLoanModal?.();
    }, [onOpenLoanModal, saveSimulatorData]);

    // Auto-save simulation data on change
    useEffect(() => {
        saveSimulatorData();
    }, [saveSimulatorData]);

    return (
        <div className="credit-calculator-v2">
            <div className="calculator-v2-grid">
                {/* Left Column: Calculator Controls */}
                <div className="calculator-v2-controls">
                    {/* Amount Slider */}
                    <div className="control-group">
                        <label className="control-label">
                            {t('detail.calculator.labels.desiredCredit')}
                        </label>
                        <div className="control-value">
                            CHF {formatCHF(amount)}
                        </div>
                        <input
                            type="range"
                            className="slider"
                            min={MIN_AMOUNT}
                            max={MAX_AMOUNT}
                            step="100"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                        />
                        <div className="slider-labels">
                            <span>{formatCHF(MIN_AMOUNT)}</span>
                            <span>{formatCHF(MAX_AMOUNT)}</span>
                        </div>
                    </div>

                    {/* Duration Slider */}
                    <div className="control-group">
                        <label className="control-label">
                            {t('detail.calculator.labels.duration')}
                        </label>
                        <div className="control-value">
                            {t('detail.calculator.values.months', { count: duration })}
                        </div>
                        <input
                            type="range"
                            className="slider"
                            min={MIN_DURATION}
                            max={MAX_DURATION}
                            step={6}
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                        />
                        <div className="slider-labels">
                            <span>{MIN_DURATION}</span>
                            <span>{MAX_DURATION}</span>
                        </div>
                    </div>

                    {/* Property Toggle */}
                    <div className="control-group">
                        <label className="control-label">
                            {t('detail.calculator.labels.ownProperty')}
                        </label>
                        <div className="toggle-group">
                            <button
                                type="button"
                                className={`toggle-btn ${property === 'no' ? 'active' : ''}`}
                                onClick={() => setProperty('no')}
                            >
                                {t('detail.calculator.values.no')}
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${property === 'yes' ? 'active' : ''}`}
                                onClick={() => setProperty('yes')}
                            >
                                {t('detail.calculator.values.yes')}
                            </button>
                        </div>
                    </div>

                    {/* Guarantee Toggle */}
                    <div className="control-group">
                        <label className="control-label">
                            {t('detail.calculator.labels.wantGuarantee')}
                        </label>
                        <div className="toggle-group">
                            <button
                                type="button"
                                className={`toggle-btn ${guarantee === 'no' ? 'active' : ''}`}
                                onClick={() => setGuarantee('no')}
                            >
                                {t('detail.calculator.values.no')}
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${guarantee === 'yes' ? 'active' : ''}`}
                                onClick={() => setGuarantee('yes')}
                            >
                                {t('detail.calculator.values.yes')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results Summary */}
                <div className="calculator-v2-results">
                    <div className="results-header">
                        <h3>{t('detail.calculator.labels.monthlyPayment')}</h3>
                    </div>

                    <div className="results-grid">
                        <div className="result-column">
                            <div className="result-label">
                                {t('detail.calculator.results.interestRateFrom', { rate: (rates.min * 100).toFixed(1) })}
                            </div>
                            <div className="result-value primary">
                                CHF {formatCHF(totalMinPayment)}
                            </div>
                            {guarantee === 'yes' && (
                                <div className="result-detail">
                                    {t('detail.calculator.results.guaranteeFee', { fee: `CHF ${formatCHF(guaranteeFee)}` })}
                                </div>
                            )}
                            <div className="result-total">
                                {t('detail.calculator.results.totalRepayment')}: CHF {formatCHF(totalMinRepayment)}
                            </div>
                        </div>

                        <div className="result-divider">
                            <span>{t('detail.calculator.values.to')}</span>
                        </div>

                        <div className="result-column">
                            <div className="result-label">
                                {(rates.max * 100).toFixed(1)}%
                            </div>
                            <div className="result-value primary">
                                CHF {formatCHF(totalMaxPayment)}
                            </div>
                            {guarantee === 'yes' && (
                                <div className="result-detail">
                                    {t('detail.calculator.results.guaranteeFee', { fee: `CHF ${formatCHF(guaranteeFee)}` })}
                                </div>
                            )}
                            <div className="result-total">
                                {t('detail.calculator.results.totalRepayment')}: CHF {formatCHF(totalMaxRepayment)}
                            </div>
                        </div>
                    </div>

                    <div className="results-disclaimer">
                        {t('detail.calculator.results.disclaimer')}
                    </div>

                    {onOpenLoanModal && (
                        <button
                            type="button"
                            className="cta-button"
                            onClick={handleOpenModal}
                        >
                            {t('detail.calculator.results.ctaButton')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreditCalculatorV2;
