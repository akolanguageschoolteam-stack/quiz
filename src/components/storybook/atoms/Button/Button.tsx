import React from 'react';
import { ButtonProps } from './Button.type';
import FormLoader from '@/components/common/FormLoader';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  active = false,
  className = '',
  hover = false,
  glareEffect = false,
  children,
  ...props
}) => {
  // Base button classes
  const baseClasses =
    'btn_xs sm:btn_sm md:btn_md lg:btn_lg ';

  // Variant classes using CSS custom properties
  const variantClasses = {
    primary:
      'primaryBgWithBorderShadow text-white border-b-6 hover:border-white/20! transition-all duration-500',
    secondary:
      `secondaryBgWithBorderShadow text-white border-b-6 hover:border-white/20! transition-all duration-500 ${hover ? 'group-hover:primaryBg group-hover:border-white/20! dark:group-hover:text-white!' : ''}`,
    outline:
      'border border-black',
    secondaryShade:
      'inverseOnSurfaceBg border-b-6 border-(--neutral-300) hover:border-white/20! transition-all duration-500',
    shade:
      'bg-(--primary-100) primaryColor border-b-6 border-(--primary-200) hover:border-white/20! transition-all duration-500',
    nav_link: active
      ? 'primaryLightBg primaryColor justify-start font-medium rounded-lg'
      : 'bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-300 justify-start font-medium rounded-lg',
  };

  // Size classes
  const sizeClasses = {
    sm: 'btn_sm',
    md: 'btn_md',
    lg: 'btn_lg',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `${size ? `${sizeClasses[size]}` : `${baseClasses}`} ${variantClasses[variant]} ${widthClasses} ${className} ${glareEffect ? 'relative overflow-hidden after:absolute after:top-0 after:-left-[120%] after:h-[45%] after:w-[100%] after:rotate-[-65deg] after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:animate-none hover:after:animate-shimmer' : ''} transition-all flexCenter gap-2 duration-200 disabled:opacity-50 disabled:cursor-not-allowed!`;

  return (
    <div className={`${widthClasses}`}>
      <button className={buttonClasses} disabled={disabled || loading} {...props}>
        {loading && (
          <FormLoader />
        )}
        {!loading && leftIcon && (
          <span
            className={`inline-flex items-center`}
          >
            {leftIcon}
          </span>
        )}
        {
          !loading &&
          <span className={variant === 'nav_link' ? 'flex-1 text-left' : ''}>
            {children}
          </span>
        }
        {!loading && rightIcon && (
          <span
            className={`inline-flex items-center ${variant === 'nav_link' ? 'flex-shrink-0' : 'flex-shrink-0'
              }`}
          >
            {rightIcon}
          </span>
        )}
      </button>
    </div>
  );
};

export default Button;
