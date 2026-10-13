export interface OptBoxHandle {
    focus: (index?: number) => void;
}

export interface OptBoxProps {
    /** Number of digit boxes to render */
    length: number;
    /** Controlled array of single-character digit values, one per box */
    value: string[];
    /** Called with the full next value array whenever a box changes, backspaces, or a paste is handled */
    onChange: (next: string[]) => void;
    /** Prefix used for the aria-label of each box, e.g. "OTP digit" -> "OTP digit 1" */
    ariaLabel?: string;
    /** Background utility class applied to empty boxes */
    emptyBg?: string;
    className?: string;
}
