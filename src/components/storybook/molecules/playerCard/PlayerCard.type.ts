import { StaticImageData } from "next/image";

export interface PlayerCardProps {
    avatar: StaticImageData | string;
    name: string;
    role?: string;
    attendQuestions?: number
    totalQuestions?: number
    /** Muted look for a placeholder / not-yet-joined player */
    muted?: boolean;
    horizontalCard?: boolean;
    className?: string;
    /** Quick-chat text to flash above this player's avatar; cleared by the caller after a timeout */
    bubble?: string;
}
