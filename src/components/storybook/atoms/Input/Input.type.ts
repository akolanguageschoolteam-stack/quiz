import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Visual variant */
    variant?: 'default' | 'outline' | 'filled' | 'error';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Label text */
    label?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Helper text shown below the input */
    helperText?: string;
    /** Error message (replaces helperText) */
    error?: string;
    /** Icon on the left */
    leftIcon?: React.ReactNode;
    /** Icon on the right */
    rightIcon?: React.ReactNode;
    /** Makes right icon clickable */
    onRightIconClick?: () => void;
    /** Stretch to full container width */
    fullWidth?: boolean;
    /** Shows a loading spinner */
    loading?: boolean;
    fillNone?: boolean;
}
