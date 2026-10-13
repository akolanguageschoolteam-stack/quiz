import type { ReactNode } from "react";
import type { EncryptedPayload } from "@/types/GlobalTypes";

export interface QuizOption {
    id: number;
    letter: string;
    label: string;
    is_correct?: EncryptedPayload;
    correct_sequence?: EncryptedPayload;
}

export interface LifelineItem {
    key: string;
    icon: ReactNode;
    label: string;
    disabled: boolean;
    onClick: () => void;
    /** Whether using this lifeline deducts a coin — controls the coin-reveal animation. Defaults to true. */
    costsCoin?: boolean;
}
