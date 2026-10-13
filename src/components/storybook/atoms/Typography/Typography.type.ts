import { ReactNode } from 'react';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'desc1'
  | 'desc2'
  | 'caption'
  | 'label';

export type TypographyWeight =
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold';

export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

export interface TypographyProps {
  /** The content to be rendered */
  children: ReactNode;
  /** Typography variant that maps to different text styles */
  variant?: TypographyVariant;
  /** Font weight */
  weight?: TypographyWeight;
  /** Text alignment */
  align?: TypographyAlign;
  /** Whether to truncate text with ellipsis */
  truncate?: boolean;
  /** Number of lines to show before truncating (requires truncate=true) */
  lines?: number;
  /** Custom color class (e.g., 'text-primary-500') */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** HTML tag to render (defaults based on variant) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  /** Whether the label is required */
  required?: boolean;
}
