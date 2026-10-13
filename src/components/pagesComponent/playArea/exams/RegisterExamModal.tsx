'use client'
import { useEffect, useState } from "react"
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"
import { useDispatch, useSelector } from "react-redux"
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
import { OptBox } from "@/components/storybook/molecules/optBox"
import { fetchExamModuleQuestions } from "@/api/apiRoutes"
import { toast } from "@/lib/toast"
import { getErrorMessage } from "@/utils/errorMessages"
import { setExamPlayParams } from "@/redux/reducers/quizSlice"
import type { ExamItem } from "@/types/GlobalTypes"

const EXAM_KEY_LENGTH = 4

interface RegisterExamModalProps {
    open: boolean,
    onClose: (open: boolean) => void,
    exam: ExamItem | null
}

const RegisterExamModal = ({ open, onClose, exam }: RegisterExamModalProps) => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();

    const [examKey, setExamKey] = useState<string[]>(Array(EXAM_KEY_LENGTH).fill(''))
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isExamKeyComplete = examKey.every(digit => digit !== '')

    useEffect(() => {
        if (open) {
            setExamKey(Array(EXAM_KEY_LENGTH).fill(''))
        }
    }, [open])

    const handleAgreeAndContinue = async () => {
        if (!exam || !isExamKeyComplete) return

        const examCode = Number(examKey.join(''))
        if (examCode < 1000) {
            toast.error(t('invalidExamCode'))
            return
        }
        setIsSubmitting(true)
        try {
            const response = await fetchExamModuleQuestions({ exam_module_id: exam.id, exam_code: examCode })
            if (response?.success) {
                onClose(false)
                dispatch(setExamPlayParams({ examId: exam.id, examCode, durationMinutes: exam.duration }))
                router.push(`/play-area/exams/play?id=${exam.id}`)
            } else {
                toast.error(response?.message || t('somethingWentWrong'))
            }
        } catch (error: any) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')))
        } finally {
            setIsSubmitting(false)
        }
    }

    const examRules = [t('examRule1'), t('examRule2')]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol">
                    <DialogHeader>
                        <DialogTitle>
                            <Typography variant='h2' weight='extrabold' className='line-clamp-1'>
                                {t('enterExamHall')}
                            </Typography>
                        </DialogTitle>
                        <DialogDescription>
                            <Typography variant='subtitle2' weight='regular' className='onSurfaceVarColor! font-nunito! line-clamp-2'>
                                {t('enterExamHallDesc')}
                            </Typography>
                        </DialogDescription>
                    </DialogHeader>

                    <OptBox length={EXAM_KEY_LENGTH} value={examKey} onChange={setExamKey} ariaLabel="Exam key digit" />

                    <div className="commonBg rounded-3xl p-4 md:p-6 flexCol gap-3">
                        <Typography variant="h6" weight="extrabold" className="font-nunito!">
                            {t('examRules')}
                        </Typography>
                        <ul className="list-disc pl-5 flexCol gap-2 marker:onSurfaceVarColor">
                            {examRules.map((rule, idx) => (
                                <li key={idx}>
                                    <Typography as="span" variant="desc2" weight="semibold" className="onSurfaceVarColor! font-nunito!">
                                        {rule}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <Button
                            variant="primary"
                            fullWidth
                            className="rounded-full!"
                            disabled={!isExamKeyComplete || isSubmitting}
                            onClick={handleAgreeAndContinue}
                        >
                            {isSubmitting ? t('loading') : t('agreeAndContinue')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default RegisterExamModal