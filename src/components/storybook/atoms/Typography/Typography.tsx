import React from 'react';
import { TypographyProps, TypographyVariant } from './Typography.type';

const variantClasses: Record<TypographyVariant, string> = {
  h1: 'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
  h2: 'text-xl sm:text-2xl md:text-3xl font-bold tracking-tight',
  h3: 'text-lg sm:text-xl md:text-2xl font-bold tracking-tight',
  h4: 'text-base sm:text-lg md:text-xl font-bold tracking-tight',
  h5: 'text-base md:text-lg font-bold tracking-tight',
  h6: 'text-sm sm:text-sm md:text-base font-bold tracking-tight',
  subtitle1: 'text-base sm:text-lg md:text-xl font-medium leading-relaxed',
  subtitle2: 'text-base sm:text-lg md:text-lg font-medium leading-relaxed',
  desc1: 'm-0 textSecondaryColor font-medium',
  desc2: 'm-0 textSecondaryColor text-sm lg:text-base',
  caption: 'text-sm md:text-base textSecondaryColor',
  label: 'text-sm md:text-base',
};

const weightClasses = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const defaultTags: Record<
  TypographyVariant,
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'
> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  desc1: 'p',
  desc2: 'p',
  caption: 'span',
  label: 'label',
};

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'desc1',
  weight,
  align,
  truncate = false,
  lines,
  color,
  className = '',
  as,
  required = false,
  ...props
}) => {
  const resolvedTag = as || defaultTags[variant];
  if (!resolvedTag && process.env.NODE_ENV === 'development') {
    console.error(`[Typography] Invalid variant "${variant}" passed — no HTML tag mapped. Falling back to "span". Fix the caller.`);
  }
  const Component = resolvedTag || 'span';

  const classes = [
    variant === 'label' && 'flex items-center gap-1',
    variantClasses[variant],
    weight && weightClasses[weight],
    align && alignClasses[align],
    truncate && 'truncate',
    truncate && lines && `line-clamp-${lines}`,
    color,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
      {variant === 'label' && required && (
        <span className="errorColor ml-1">*</span>
      )}
    </Component>
  );
};

export default Typography;
