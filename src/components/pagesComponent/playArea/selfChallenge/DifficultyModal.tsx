'use client'
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/storybook/atoms/Button"
import { Typography } from "@/components/storybook/atoms/Typography"

const QUESTION_COUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 90]
const QUIZ_DURATIONS = [10, 15, 30, 60, 120, 150, 180, 200, 250]

interface DifficultyModalProps {
    open: boolean,
    onClose: (open: boolean) => void,
    onStart: (params: { questionCount: number; quizDuration: number }) => void
}

const DifficultyModal = ({ open, onClose, onStart }: DifficultyModalProps) => {

    const { t } = useTranslation();

    const [questionCount, setQuestionCount] = useState<number>(QUESTION_COUNTS[3]);
    const [quizDuration, setQuizDuration] = useState<number>(QUIZ_DURATIONS[1]);

    const handleStartQuiz = () => {
        onStart({ questionCount, quizDuration });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol">
                    <DialogHeader>
                        <DialogTitle>
                            <Typography variant='h2' weight='extrabold' className='line-clamp-1'>
                                {t('chooseChallengeDifficulty')}
                            </Typography>
                        </DialogTitle>
                        <DialogDescription>
                            <Typography variant='subtitle2' weight='regular' className='onSurfaceVarColor! font-nunito! line-clamp-2'>
                                {t('chooseChallengeDifficultyDesc')}
                            </Typography>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flexCol gap-3">
                        <Typography variant="h5" weight="semibold" className="font-nunito!">
                            {t('numberOfQuestions')}
                        </Typography>
                        <div className="flex flex-wrap items-center gap-3">
                            {QUESTION_COUNTS.map((count) => {
                                const isSelected = questionCount === count
                                return (
                                    <button
                                        key={count}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setQuestionCount(count)}
                                        className={`min-w-12.5 h-11 px-3 rounded-2xl flexCenter border-2 border-transparent! transition-all duration-300 ${isSelected ? 'primaryBgWithBorderShadow text-white' : 'surfaceContainerLowBg hover:primaryBorder'}`}
                                    >
                                        <Typography variant="h6" weight="semibold" className={`font-nunito! ${isSelected ? 'text-white!' : 'onSurfaceColor!'}`}>
                                            {count}
                                        </Typography>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flexCol gap-3">
                        <Typography variant="h5" weight="semibold" className="font-nunito!">
                            {t('selectQuizDuration')}
                        </Typography>
                        <div className="flex flex-wrap items-center gap-3">
                            {QUIZ_DURATIONS.map((duration) => {
                                const isSelected = quizDuration === duration
                                return (
                                    <button
                                        key={duration}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setQuizDuration(duration)}
                                        className={`min-w-12.5 h-11 px-3 rounded-2xl flexCenter border-2 border-transparent! transition-all duration-300 ${isSelected ? 'primaryBgWithBorderShadow text-white' : 'surfaceContainerLowBg hover:primaryBorder'}`}
                                    >
                                        <Typography variant="h6" weight="semibold" className={`font-nunito! ${isSelected ? 'text-white!' : 'onSurfaceColor!'}`}>
                                            {duration}
                                        </Typography>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <Button variant="primary" fullWidth onClick={handleStartQuiz}>
                            {t('startQuiz')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DifficultyModal