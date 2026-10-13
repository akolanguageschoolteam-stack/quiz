import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant - determines the visual style */
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'secondaryShade'
    | 'shade'
    | 'nav_link'
  /** Button size - determines the padding and font size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Icon to display before the button text */
  leftIcon?: React.ReactNode;
  /** Icon to display after the button text */
  rightIcon?: React.ReactNode;
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;
  /** Whether the button is in an active state (useful for nav_link variant) */
  active?: boolean;
  hover?: boolean;
  glareEffect?: boolean;
  /** Custom CSS classes to apply */
  className?: string;
  /** Button content */
  children: React.ReactNode;
}
