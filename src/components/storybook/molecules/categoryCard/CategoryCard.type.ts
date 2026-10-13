import { CategoryType } from "@/types/GlobalTypes";

export interface CategoryCardProps {
    category: CategoryType
    className?: string;
    horizontalCard?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
    // web-settings guest-mode key to check before showing the coin-unlock flow to a guest —
    // callers pass the key matching their own module (quiz zone / random battle / fun & learn / ...).
    guestModeKey?: string;
}