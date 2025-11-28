import React from 'react';

interface ProcessStepProps {
    number: number;
    title: string;
    description: string;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description }) => {
    return (
        <div className="process-step">
            <div className="process-step-number">{number}</div>
            <h3 className="process-step-title">{title}</h3>
            <p className="process-step-description">{description}</p>
        </div>
    );
};

export default ProcessStep;
