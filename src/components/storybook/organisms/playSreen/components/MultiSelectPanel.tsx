import OptionCard from "@/components/storybook/molecules/optionCard";
import { Button } from "@/components/storybook/atoms/Button";
import { Typography } from "@/components/storybook/atoms/Typography";
import AnswerFeedbackBanner from "./AnswerFeedbackBanner";
import type { QuizOption } from "./types";

interface MultiSelectPanelProps {
    options: QuizOption[];
    selectedIds: number[];
    roundLocked: boolean;
    answerStatus: 'correct' | 'wrong' | null;
    showCorrectness: boolean;
    isReviewMode: boolean;
    isMathManiaPage: boolean;
    isOptionCorrect: (option: QuizOption) => boolean;
    onToggle: (optionId: number) => void;
    onConfirm: () => void;
    t: (key: string) => string;
}

const MultiSelectPanel = ({ options, selectedIds, roundLocked, answerStatus, showCorrectness, isReviewMode, isMathManiaPage, isOptionCorrect, onToggle, onConfirm, t }: MultiSelectPanelProps) => {
    const correctOptionLetters = options.filter((opt) => isOptionCorrect(opt)).map((opt) => opt.letter).join('');

    return (
        <div className="surfaceContainerLowestBg rounded-[42px] p-4 md:p-6 flexCol gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
            <AnswerFeedbackBanner
                show={roundLocked && !!answerStatus && showCorrectness}
                status={answerStatus ?? 'correct'}
                label={t(answerStatus === 'correct' ? 'correct' : 'wrong')}
            />
            {options.map((opt) => {
                const sequence = selectedIds.indexOf(opt.id) + 1;
                return (
                    <OptionCard
                        key={opt.letter}
                        letter={opt.letter}
                        label={opt.label}
                        selected={selectedIds.includes(opt.id)}
                        selectedBadge={isReviewMode ? opt.letter : (sequence > 0 ? sequence : undefined)}
                        renderAsMath={isMathManiaPage}
                        onClick={() => onToggle(opt.id)}
                    />
                );
            })}

            {roundLocked && isReviewMode && !!correctOptionLetters && (
                <Typography variant="h5" weight="bold" className="text-center successColor!">
                    {t('correctOptions')} :- {correctOptionLetters}
                </Typography>
            )}

            {!isReviewMode && (
                <Button variant="primary" fullWidth disabled={roundLocked || selectedIds.length === 0} onClick={onConfirm}>
                    {t('checkNow')}
                </Button>
            )}
        </div>
    );
};

export default MultiSelectPanel;
