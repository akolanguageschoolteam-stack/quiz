'use client'
import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/storybook/atoms/Button"
import { Typography } from "@/components/storybook/atoms/Typography"
import { submitReportQuestion } from "@/api/apiRoutes"
import { toast } from "@/lib/toast"
import { getErrorMessage } from "@/utils/errorMessages"

interface ReportQuestionModalProps {
    open: boolean,
    onClose: (open: boolean) => void,
    questionId: number,
    questionType: string,
}

const ReportQuestionModal = ({ open, onClose, questionId, questionType }: ReportQuestionModalProps) => {

    const { t } = useTranslation();

    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)


    useEffect(() => {
        if (open) {
            setMessage('')
        }
    }, [open])

    const handleSubmit = async () => {
        if (!message.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const response = await submitReportQuestion({ question_type: questionType, question_id: questionId, message: message.trim() })
            if (response?.success) {
                toast.success(response?.message || t('reportQuestionSuccess'))
                onClose(false)
            } else {
                toast.error(response?.message || t('somethingWentWrong'))
            }
        } catch (error: any) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-6 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol">
                    <Typography variant="h3" weight="extrabold" className="text-center">
                        <span className="rounded-lg px-2">{t('reportQuestion')}</span>
                    </Typography>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('reportQuestionDesc')}
                        rows={6}
                        className="w-full resize-none rounded-2xl border-2 primaryBorder surfaceContainerLowestBg p-4 outline-none font-nunito text-base onSurfaceColor placeholder:onSurfaceVarColor"
                    />

                    <Button
                        variant="primary"
                        fullWidth
                        className="rounded-xl!"
                        disabled={!message.trim()}
                        loading={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {t('submit')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ReportQuestionModal
