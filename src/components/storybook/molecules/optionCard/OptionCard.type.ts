import type { ReactNode } from 'react';

export interface OptionCardProps {
    /** Option letter shown in the badge (A, B, C, D…) */
    letter: string;
    /** Option text */
    label: string;
    /** Whether this option is currently selected */
    selected?: boolean;
    /** Answer feedback from the submit response: green for correct, red for wrong */
    status?: 'correct' | 'wrong';
    /** Whether this option is the actual correct answer (used to reveal it when general_answer_mode = 3) */
    isCorrectAnswer?: boolean;
    /** Always reveal the correct-answer styling regardless of general_answer_mode/selection (answer-key review) */
    forceRevealCorrect?: boolean;
    /** Ignore general_answer_mode's suppression once an option has been picked (battle screens) — unlike forceRevealCorrect, still waits for isCorrectAnswer/status to be set post-attempt, so nothing reveals before the user answers */
    alwaysShowCorrectness?: boolean;
    /** Removed by the 50-50 lifeline — dims the option and disables selection */
    eliminated?: boolean;
    /** Audience Poll lifeline result for this option (0-100) */
    pollPercentage?: number;
    /** Render label as HTML/LaTeX (math-mania options carry inline mathEquation spans) */
    renderAsMath?: boolean;
    /** Overrides the default check icon shown in the badge while selected (e.g. a selection-order number for multi-select) */
    selectedBadge?: ReactNode;
    /** Click handler */
    onClick?: () => void;
    className?: string;
}
