import React, { useCallback, useState } from 'react'
import { z } from 'zod'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Typography } from '../storybook/atoms/Typography'
import Input from '../storybook/atoms/Input/Input'
import { Mail } from '../common/Icons'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '../storybook/atoms/Button'
import { firebaseAuth } from '@/lib/firebase'
import { getErrorMessage } from '@/utils/errorMessages'

type ForgotPassErrors = Partial<Record<string, string>>
interface ForgotPassModalProps {
    openLinkSent: (email: string, onResend: () => Promise<void>) => void
}

const ForgotPassModal = ({ openLinkSent }: ForgotPassModalProps) => {

    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        email: "",
    })

    const [errors, setErrors] = useState<ForgotPassErrors>({})
    const [loading, setLoading] = useState<boolean>(false)

    const forgotPassSchema = z.object({
        email: z.string().min(1, t('emailRequired')).email(t('invalidEmail')),
    })

    const handleValidateForm = useCallback((): boolean => {
        const result = forgotPassSchema.safeParse(formData)
        if (!result.success) {
            const fieldErrors: ForgotPassErrors = {}
            result.error.issues.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                if (!fieldErrors[field]) fieldErrors[field] = err.message
            })
            setErrors(fieldErrors)
            return false
        }
        setErrors({})
        return true
    }, [formData, forgotPassSchema])

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault()

        const isValid = handleValidateForm()
        if (!isValid) return

        try {
            setLoading(true)
            setErrors({})
            await sendPasswordResetEmail(firebaseAuth, formData.email)
            openLinkSent(formData.email, () => sendPasswordResetEmail(firebaseAuth, formData.email))
        } catch (error: any) {
            setErrors({ email: getErrorMessage(error, t('invalidEmail')) })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="flexCol gap-8" onSubmit={handleContinue}>
            <div className="flexCol gap-2 text-center">
                <Typography variant="h2">
                    {t('forgotPassword')}
                </Typography>
                <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                    {t('forgotPasswordDesc')}
                </Typography>
            </div>
            <div className='flexCol gap-3'>
                <Input
                    fullWidth
                    required
                    type="email"
                    variant="default"
                    leftIcon={<Mail />}
                    placeholder={t('enterRegisteredEmail')}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className=""
                    error={errors.email}
                />
                <div className='flexCenter mt-2'>
                    <Button fullWidth type="submit" loading={loading}>
                        {t('continue')}
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default ForgotPassModal
