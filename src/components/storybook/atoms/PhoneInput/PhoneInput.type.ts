export interface PhoneInputProps {
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
    /** Stretch to full container width */
    fullWidth?: boolean;
    /** Current phone value */
    value?: string;
    /** Default country code (e.g. 'in', 'us') */
    country?: string;
    /** Called when value changes */
    onChange?: (value: string, data: object, event: React.ChangeEvent<HTMLInputElement>, formattedValue: string) => void;
    /** Enable country search in dropdown */
    enableSearch?: boolean;
    /** Placeholder for country search */
    searchPlaceholder?: string;
    /** Disable input */
    disabled?: boolean;
}
