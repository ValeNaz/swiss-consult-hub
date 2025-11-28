import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import '../../styles/ProgressStepper.css';

interface Step {
    number: number;
    title: string;
    description?: string;
}

interface ProgressStepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
    allowNavigation?: boolean;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({
    steps,
    currentStep,
    onStepClick,
    allowNavigation = false
}) => {
    return (
        <div className="progress-stepper">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                const isClickable = allowNavigation && step.number < currentStep;

                return (
                    <React.Fragment key={step.number}>
                        <div
                            className={`step-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
                            onClick={() => isClickable && onStepClick?.(step.number)}
                        >
                            <div className="step-indicator">
                                {isCompleted ? (
                                    <div className="step-icon completed">
                                        <CheckCircle2 size={24} />
                                    </div>
                                ) : (
                                    <div className="step-icon">
                                        {isCurrent ? (
                                            <div className="step-number current">{step.number}</div>
                                        ) : (
                                            <Circle size={24} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="step-content">
                                <p className="step-title">{step.title}</p>
                                {step.description && (
                                    <p className="step-description">{step.description}</p>
                                )}
                            </div>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ProgressStepper;
