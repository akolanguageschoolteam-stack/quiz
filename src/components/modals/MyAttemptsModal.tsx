'use client'
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

interface MyAttemptsModalProps {
    open: boolean,
    onClose: (open: boolean) => void,
    totalQuestions?: number,
    attemptedQuestionNumbers?: number[],
    correctQuestionNumbers?: number[],
    wrongQuestionNumbers?: number[],
    onSelectQuestion?: (questionIndex: number) => void,
    onSubmit?: () => void,
    hideSubmit?: boolean,
}

const MyAttemptsModal = ({ open, onClose, totalQuestions = 0, attemptedQuestionNumbers = [], correctQuestionNumbers = [], wrongQuestionNumbers = [], onSelectQuestion = () => { }, onSubmit = () => { }, hideSubmit = false }: MyAttemptsModalProps) => {

    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol">
                    <DialogHeader>
                        <DialogTitle>
                            <Typography variant='h2' weight='extrabold' className='line-clamp-1'>
                                {t('myAttempts')}
                            </Typography>
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {t('myAttemptsDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 md:gap-4 justify-items-center">
                        {Array.from({ length: totalQuestions }, (_, idx) => idx + 1).map((questionNo) => {
                            const isCorrect = correctQuestionNumbers.includes(questionNo)
                            const isWrong = wrongQuestionNumbers.includes(questionNo)
                            const isAttempted = attemptedQuestionNumbers.includes(questionNo)
                            const stateClass = isCorrect
                                ? 'successBg text-white'
                                : isWrong
                                    ? 'errorBg text-white'
                                    : isAttempted
                                        ? 'primaryBgWithBorderShadow text-white'
                                        : 'surfaceContainerLowBg hover:primaryBorder border-2 border-transparent!'
                            const isFilled = isCorrect || isWrong || isAttempted
                            return (
                                <button
                                    key={questionNo}
                                    type="button"
                                    onClick={() => {
                                        onSelectQuestion(questionNo - 1)
                                        onClose(false)
                                    }}
                                    className={`w-11 h-11 md:w-12 md:h-12 rounded-full flexCenter transition-all duration-300 ${stateClass}`}
                                >
                                    <Typography variant="h6" weight="semibold" className={`font-nunito! ${isFilled ? 'text-white!' : 'onSurfaceColor!'}`}>
                                        {questionNo}
                                    </Typography>
                                </button>
                            )
                        })}
                    </div>

                    {!hideSubmit && (
                        <div>
                            <Button variant="primary" fullWidth onClick={() => { onClose(false); onSubmit(); }}>
                                {t('submitNow')}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MyAttemptsModal