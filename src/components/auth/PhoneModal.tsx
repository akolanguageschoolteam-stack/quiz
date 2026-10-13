import React, { useCallback, useState } from 'react'
import { z } from 'zod'
import { Typography } from '../storybook/atoms/Typography'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '../storybook/atoms/Button'
import ContinueWith, { AuthMethods } from './ContinueWith'
import { PhoneInput } from '../storybook/atoms/PhoneInput'
import { getErrorMessage } from '@/utils/errorMessages'

type PhoneErrors = Partial<Record<string, string>>
interface PhoneModalProps {
    loginModal: boolean
    phoneModal: boolean
    sendOtp: (fullPhoneNumber: string) => Promise<void>
    setOptModal: (open: boolean) => void
    setPhoneModal: (open: boolean) => void
    setLogintModal: (open: boolean) => void
    setRegisterModal: (open: boolean) => void
    onAuthSuccess: () => void
    authMethods: AuthMethods
}

const PhoneModal = ({ loginModal, phoneModal, sendOtp, setOptModal, setPhoneModal, setLogintModal, setRegisterModal, onAuthSuccess, authMethods }: PhoneModalProps) => {

    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        phone: "",
        countryCode: "",
        dialCode: "",
    });

    const [errors, setErrors] = useState<PhoneErrors>({})
    const [loading, setLoading] = useState<boolean>(false)

    const phoneSchema = z.object({
        phone: z.string().min(8, t('phoneMinLength')),
    })

    const handleValidateForm = useCallback((): boolean => {
        const result = phoneSchema.safeParse(formData)
        if (!result.success) {
            const fieldErrors: PhoneErrors = {}
            result.error.issues.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                if (!fieldErrors[field]) fieldErrors[field] = err.message
            })
            setErrors(fieldErrors)
            return false
        }
        setErrors({})
        return true
    }, [formData, phoneSchema])

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()

        const isValid = handleValidateForm()
        if (!isValid) return

        try {
            setLoading(true)
            const fullPhoneNumber = `+${formData.phone.replace(/^0+/, '')}`
            // const fullPhoneNumber = `+${formData.dialCode}${formData.phone.replace(/^0+/, '')}`
            await sendOtp(fullPhoneNumber)
            setPhoneModal(false)
            setOptModal(true)
        } catch (error: any) {
            setErrors({ phone: getErrorMessage(error, t('phoneMinLength')) })
        } finally {
            setLoading(false)
        }
    }

    const handleChangePhone = (value: string, data: any) => {
        const dialCode = data.dialCode;
        const countryCode = data.countryCode;
        setFormData(prev => ({
            ...prev,
            phone: value,
            countryCode: countryCode,
            dialCode: dialCode
        }))
    }

    return (
        <form className="flexCol gap-8" onSubmit={handleSendOtp}>
            <div className="flexCol gap-2">
                <Typography variant="h2">
                    {t('welcomeBack')}
                </Typography>
                <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                    {t('welcomeBackDescPhone')}
                </Typography>
            </div>
            <div className='flexCol gap-3 font-black'>
                <PhoneInput
                    required
                    fullWidth
                    value={formData.phone}
                    onChange={handleChangePhone}
                    enableSearch
                    searchPlaceholder="Search country..."
                    error={errors.phone}
                />
                <div className='flexCenter mt-2'>
                    <Button fullWidth type="submit" loading={loading}>
                        {t('requestOpt')}
                    </Button>

                </div>
            </div>
            <div className='mt-10 sm:mt-20'>
                <ContinueWith loginModal={loginModal} phoneModal={phoneModal} setLogintModal={setLogintModal} setPhoneModal={setPhoneModal} setRegisterModal={setRegisterModal} onAuthSuccess={onAuthSuccess} authMethods={authMethods} />
            </div>
        </form>
    )
}

export default PhoneModal
