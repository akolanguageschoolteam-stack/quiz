import { Typography } from "@/components/storybook/atoms/Typography";
import { Button } from "@/components/storybook/atoms/Button";
import AnswerFeedbackBanner from "./AnswerFeedbackBanner";

interface GuessWordPanelProps {
    wordSlots: string[];
    tileRows: string[][];
    usedTileKeys: Record<string, boolean>;
    roundLocked: boolean;
    answerStatus: 'correct' | 'wrong' | null;
    showCorrectness: boolean;
    isWordComplete: boolean;
    correctWord?: string;
    revealAnswer: boolean;
    isReviewMode: boolean;
    onSlotClick: (slotIdx: number) => void;
    onTileClick: (rowIdx: number, colIdx: number, letter: string) => void;
    onSubmit: () => void;
    t: (key: string) => string;
}

const GuessWordPanel = ({
    wordSlots,
    tileRows,
    usedTileKeys,
    roundLocked,
    answerStatus,
    showCorrectness,
    isWordComplete,
    correctWord,
    revealAnswer,
    isReviewMode,
    onSlotClick,
    onTileClick,
    onSubmit,
    t,
}: GuessWordPanelProps) => (
    <div className="surfaceContainerLowestBg rounded-[42px] p-4 md:p-6 flexCol gap-6 md:gap-8 shadow-[0px_8px_32px_0px_#0000000A]">
        <AnswerFeedbackBanner
            show={roundLocked && !!answerStatus && showCorrectness}
            status={answerStatus ?? 'correct'}
            label={t(answerStatus === 'correct' ? 'correct' : 'wrong')}
        />

        {roundLocked && (isReviewMode || revealAnswer) && answerStatus === 'wrong' && !!correctWord && (
            <Typography variant="h5" weight="bold" className="text-center successColor!">
                {t('correctAnswer')}: {correctWord}
            </Typography>
        )}

        {/* Answer word slots */}
        <div className="flexCenter gap-3 md:gap-4 flex-wrap">
            {wordSlots.map((letter, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={() => onSlotClick(idx)}
                    disabled={!letter}
                    className="flexCol items-center gap-1.5 w-6 md:w-8"
                >
                    <Typography variant="h3" className="font-nunito! onSurfaceColor! h-6 md:h-8 leading-none">
                        {letter}
                    </Typography>
                    <span className="w-full h-1 rounded-full primaryBg" />
                </button>
            ))}
        </div>

        {/* Letter tiles */}
        <div className="flexCol items-center gap-2.5 md:gap-3">
            {tileRows.map((row, rowIdx) => (
                <div key={rowIdx} className="flexCenter gap-2.5 md:gap-3 flex-wrap">
                    {row.map((letter, colIdx) => {
                        const tileKey = `${rowIdx}-${colIdx}`
                        const isUsed = usedTileKeys[tileKey]
                        return (
                            <button
                                key={tileKey}
                                type="button"
                                onClick={() => onTileClick(rowIdx, colIdx, letter)}
                                disabled={isUsed || roundLocked}
                                className={`w-9 h-9 md:w-11 md:h-11 rounded-[8px] flexCenter commonBorderB transition-all duration-300 ${isUsed ? 'commonBg opacity-40' : 'surfaceContainerLowBg hover:border-transparent! hover:rounded-full!'
                                    }`}
                            >
                                <Typography variant="h5" weight="bold" className="font-nunito! onSurfaceColor!">
                                    {letter}
                                </Typography>
                            </button>
                        )
                    })}
                </div>
            ))}
        </div>

        {!isReviewMode && (
            <Button
                variant="primary"
                fullWidth
                disabled={!isWordComplete || roundLocked}
                onClick={onSubmit}
            >
                {t('checkNow')}
            </Button>
        )}
    </div>
);

export default GuessWordPanel;
