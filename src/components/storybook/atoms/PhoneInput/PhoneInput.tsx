'use client';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { PhoneInputProps } from './PhoneInput.type';
import { useRef, useEffect } from 'react';

const sizeClasses: Record<NonNullable<PhoneInputProps['size']>, string> = {
    sm: 'text-base!',
    md: 'text-base!',
    lg: 'text-base!',
};

const PhoneInput: React.FC<PhoneInputProps> = ({
    variant = 'outline',
    size = 'md',
    label,
    required = false,
    helperText,
    error,
    fullWidth = false,
    value,
    country,
    onChange,
    enableSearch = true,
    searchPlaceholder = 'Search country...',
    disabled = false,
}) => {
    const hasError = !!error || variant === 'error';
    const wrapperRef = useRef<HTMLDivElement>(null);

    // const settingsData = useSelector(settingsSelector);
    const defualtCountryCode = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'in'

    useEffect(() => {
        const searchInput = wrapperRef.current?.querySelector<HTMLInputElement>('.search-box');
        if (searchInput) {
            searchInput.setAttribute('autocomplete', 'off');
        }
    });

    return (
        <div ref={wrapperRef} className={fullWidth ? 'w-full' : ''}>
            {label && (
                <label className={`block text-sm md:text-base mb-1.5 ${required ? 'requireInput' : ''}`}>
                    {label}
                </label>
            )}

            <div>
                <ReactPhoneInput
                    country={defualtCountryCode}
                    value={value}
                    onChange={onChange}
                    enableSearch={enableSearch}
                    searchPlaceholder={searchPlaceholder}
                    disabled={disabled}
                    inputClass={`w-full! ${sizeClasses[size]} font-nunito!`}
                    buttonClass="bodyBg!"
                    containerClass={`w-full! phoneCustomInput ${hasError ? 'phone-input-error' : ''}`}
                    searchClass="text-base!"
                    dropdownClass=""
                />
            </div>

            {error
                ? <p className="mt-1 text-xs errorColor">{error}</p>
                : helperText && <p className="mt-1 text-xs textSecondaryColor">{helperText}</p>
            }
        </div>
    );
};

export default PhoneInput;
