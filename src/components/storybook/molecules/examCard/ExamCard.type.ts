export interface ExamCardProps {
    marks: number | string;
    marksLabel: string;
    title: string;
    date: string;
    questionsCount: number;
    className?: string;
    canPlayExam?: boolean;
    onPlayClick?: () => void;
    canReviewExam?: boolean;
    onReviewClick?: () => void;
}
