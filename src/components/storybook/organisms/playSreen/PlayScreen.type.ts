export interface PlayScreenOption {
    letter: string;
    label: string;
}

export interface PlayScreenProps {
    /** The question text to display */
    question: string;
    /** Answer options for the question */
    options: PlayScreenOption[];
    /** Total number of questions in the quiz */
    totalQuestions: number;
    showLifeLine?: boolean;
    isBattleScreen?: boolean;
}
