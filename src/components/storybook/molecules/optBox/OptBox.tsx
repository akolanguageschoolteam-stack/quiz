'use client';
import React, { forwardRef, useId, useImperativeHandle } from 'react';
import Input from '../../atoms/Input/Input';
import { OptBoxHandle, OptBoxProps } from './OptBox.type';

const OptBox = forwardRef<OptBoxHandle, OptBoxProps>(({
    length,
    value,
    onChange,
    ariaLabel = 'Digit',
    emptyBg = 'surfaceContainerLowBg',
    className = '',
}, ref) => {
    const idPrefix = useId();
    const inputId = (index: number) => `${idPrefix}-${index}`;
    const focusInput = (index: number) => {
        document.getElementById(inputId(index))?.focus();
    };

    useImperativeHandle(ref, () => ({
        focus: (index = 0) => focusInput(index),
    }));

    const handleChange = (index: number, digit: string) => {
        if (!/^\d*$/.test(digit)) return;

        const next = [...value];
        next[index] = digit.slice(-1);
        onChange(next);

        if (digit && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            focusInput(index - 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!pastedData) return;

        const next = [...value];
        pastedData.split('').forEach((char, i) => { next[i] = char; });
        onChange(next);

        focusInput(Math.min(pastedData.length, length - 1));
    };

    return (
        <div className={`flexCenter gap-2 sm:gap-3 ${className}`}>
            {Array.from({ length }, (_, index) => value[index] ?? '').map((digit, index) => (
                <Input
                    key={index}
                    id={inputId(index)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    placeholder="0"
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-11! h-11! sm:w-13! sm:h-13! md:w-14! md:h-14! p-0! rounded-2xl! text-center! text-lg! sm:text-xl! font-bold! focus:ring-2 focus:ring-(--primary-200) ${digit
                        ? 'surfaceBg! border-(--neutral-300)! onSurfaceColor'
                        : `${emptyBg}! border-transparent! onSurfaceVarColor placeholder:onSurfaceVarColor`
                        }`}
                    aria-label={`${ariaLabel} ${index + 1}`}
                />
            ))}
        </div>
    );
});

OptBox.displayName = 'OptBox';

export default OptBox;
