import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'red';
type ButtonSize = 'sm' | 'md' | 'lg' | 'full';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    className?: string;
}

const variantClassMap: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-tertiary',
    red: 'btn-tertiary',
};

const sizeClassMap: Record<ButtonSize, string> = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    full: 'btn-full',
};

const Button: React.FC<ButtonProps> = ({ href, variant = 'primary', size = 'md', children, className, ...props }) => {
    const classes = [variantClassMap[variant], sizeClassMap[size], className]
        .filter(Boolean)
        .join(' ')
        .trim();

    if (href) {
        return (
            <a href={href} className={classes}>
                {children}
            </a>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;
