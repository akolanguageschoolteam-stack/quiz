import { Typography } from "@/components/storybook/atoms/Typography";

interface AnswerFeedbackBannerProps {
    show: boolean;
    status: 'correct' | 'wrong';
    label: string;
}

const AnswerFeedbackBanner = ({ show, status, label }: AnswerFeedbackBannerProps) => {
    if (!show) return null;
    const isCorrect = status === 'correct';

    return (
        <div className="flexCenter w-full">
            <div className={`py-2 px-6 flexCenter gap-2 w-full rounded-xl ${isCorrect ? 'bg-[linear-gradient(90deg,#FFFFFF_0%,#ECF9F5_50%,#FFFFFF_100%)]' : 'bg-[linear-gradient(90deg,#FFFFFF_0%,#FDECEC_50%,#FFFFFF_100%)]'}`}>
                <Typography variant="h5" weight="extrabold" className={isCorrect ? 'successColor!' : 'errorColor!'}>
                    {label}
                </Typography>
                <span className="text-lg">{isCorrect ? '👍' : '👎'}</span>
            </div>
        </div>
    );
};

export default AnswerFeedbackBanner;
