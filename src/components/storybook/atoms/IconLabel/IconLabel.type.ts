export interface IconLabelProps {
    /** Icon element */
    icon: React.ReactNode;
    /** Text label */
    label: string;
    /** Whether item is active — applies hoverBgColor background */
    active?: boolean;
    /** Additional CSS classes */
    className?: string;
    showHoverEffect?: boolean
}
