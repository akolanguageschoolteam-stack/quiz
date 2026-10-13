import React from 'react';

export interface ImagePreviewProps {
    /** Image source URL */
    src: string | { src: string } | null | undefined;
    /** Alt text for the image */
    alt: string;
    /** Size preset (used when no explicit width/height is applied via className) */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /** Aspect ratio for the image container */
    aspectRatio?: 'square' | '4/3' | '16/9' | '3/2' | '2/1' | 'auto';
    /** Border radius variant */
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    /** Whether to show a border */
    bordered?: boolean;
    /** Border color variant */
    borderColor?: 'gray' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    /** Shadow variant */
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    /** Object fit behavior */
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    /** Fade-in duration in milliseconds */
    fadeInDuration?: number;
    /** Custom CSS classes for the image */
    className?: string;
    /** Custom CSS classes for the container */
    containerClassName?: string;
    /** Callback when image loads successfully */
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    /** Callback when image fails to load */
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    /** Native loading attribute */
    loading?: 'lazy' | 'eager';
}
