import { InputProps } from "./Input.type";


const variantClasses: Record<NonNullable<InputProps['variant']>, string> = {
  default: 'border border-gray-300 surfaceBg!  placeholder-(--neutral-500) focus:border-[var(--primary)] focus:ring-[var(--primary)] focus:bg-(--primary-100)',
  outline: 'border border-black bg-white text-gray-900 placeholder:textSecondaryColor focus:border-[var(--primary)] focus:ring-[var(--primary)]',
  filled: 'border border-transparent surfaceContainerLowBg onSurfaceColor placeholder-(--neutral-500) focus:surfaceBg focus:border-[var(--primary)] focus:ring-[var(--primary)]',
  error: 'border border-[var(--error-color)] bg-white text-gray-900 placeholder-gray-400 focus:border-[var(--error-color)] focus:ring-red-500',
};

const sizeClasses: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-3 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

const Input: React.FC<InputProps> = ({
  variant = 'outline',
  size = 'md',
  label,
  required = false,
  helperText,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  fullWidth = false,
  className = '',
  disabled = false,
  loading = false,
  fillNone = false,
  ...props
}) => {
  const isReadOnly = (props as React.InputHTMLAttributes<HTMLInputElement>).readOnly ?? false;

  const inputClasses = [
    'block w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 font-nunito! font-semibold! group',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    error ? variantClasses.error : variantClasses[variant],
    sizeClasses[size],
    leftIcon ? 'pl-12 rtl:pr-12!' : '',
    rightIcon || loading ? 'pr-12 rtl:pl-12!' : '',
    isReadOnly || disabled ? 'bg-gray-100 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm md:text-base mb-1.5">
          {label}
          {required && <span className="errorColor ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {leftIcon && (
          <div className={`absolute left-3 rtl:right-3! top-1/2 -translate-y-1/2 ${fillNone ? '' : '[&_svg_path]:fill-(--neutral-500)!'}`} >
            {leftIcon}
          </div>
        )}

        <input
          className={inputClasses}
          disabled={disabled || loading}
          {...props}
        />

        {/* Right icon / clickable right icon */}
        {!loading && rightIcon && (
          onRightIconClick ? (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute ltr:right-3 rtl:left-3! top-1/2 -translate-y-1/2 textSecondaryColor focus:outline-none"
            >
              {rightIcon}
            </button>
          ) : (
            <div className="absolute ltr:right-3 rtl:left-3! top-1/2 -translate-y-1/2 textSecondaryColor pointer-events-none">
              {rightIcon}
            </div>
          )
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper / error text */}
      {error
        ? <p className="mt-1 text-xs errorColor font-nunito! font-medium!">{error}</p>
        : helperText && <p className="mt-1 text-xs textSecondaryColor">{helperText}</p>
      }
    </div>
  );
};

export default Input;
