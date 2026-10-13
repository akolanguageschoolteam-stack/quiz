import React, { useCallback, useState } from 'react'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { createUserWithEmailAndPassword, EmailAuthProvider, linkWithCredential, sendEmailVerification, signOut } from 'firebase/auth'
import { Typography } from '../storybook/atoms/Typography'
import Input from '../storybook/atoms/Input/Input'
import LocalizedLink from '../common/LocalizedLink'
import { Eye, EyeOff, Lock, Mail } from '../common/Icons'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '../storybook/atoms/Button'
import { firebaseAuth } from '@/lib/firebase'
import { convertGuest } from '@/api/apiRoutes'
import { logoutSuccess, profileSelector, setProfile } from '@/redux/reducers/userSlice'
import { getErrorMessage } from '@/utils/errorMessages'

type RegisterErrors = Partial<Record<string, string>>
interface RegisterModalProps {
    loginModal: boolean
    setRegisterModal: (open: boolean) => void
    setLogintModal: (open: boolean) => void
    openLinkSent: (email: string, onResend: () => Promise<void>) => void
}

const RegisterModal = ({ setLogintModal, setRegisterModal, openLinkSent }: RegisterModalProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const profileData = useSelector(profileSelector);
    const isGuest = profileData?.type === 'guest';

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    })

    const [errors, setErrors] = useState<RegisterErrors>({})
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [completeProfileModal, setCompleteProfileModal] = useState<boolean>(true)

    const registerSchema = z.object({
        email: z.string().min(1, t('emailRequired')).email(t('invalidEmail')),
        password: z.string().min(1, t('passwordRequired')).min(6, t('passwordMinLength')),
        confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('passwordMismatch'),
        path: ['confirmPassword'],
    })

    const handleValidateForm = useCallback((): boolean => {
        const result = registerSchema.safeParse(formData)
        if (!result.success) {
            const fieldErrors: RegisterErrors = {}
            result.error.issues.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                if (!fieldErrors[field]) fieldErrors[field] = err.message
            })
            setErrors(fieldErrors)
            return false
        }
        setErrors({})
        return true
    }, [formData, registerSchema])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        const isValid = handleValidateForm()
        if (!isValid) return

        try {
            setLoading(true)
            setErrors({})

            if (isGuest && firebaseAuth.currentUser) {
                const credential = EmailAuthProvider.credential(formData.email, formData.password)
                const linkedCredential = await linkWithCredential(firebaseAuth.currentUser, credential)

                const res = await convertGuest({ type: 'email', name: null, email: formData.email, mobile: null })
                dispatch(setProfile(res.data))

                await sendEmailVerification(linkedCredential.user)
                await signOut(firebaseAuth)
                dispatch(logoutSuccess())
                setRegisterModal(false)
                openLinkSent(formData.email, () => sendEmailVerification(linkedCredential.user))
                return
            }

            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, formData.email, formData.password)
            await sendEmailVerification(userCredential.user)
            await signOut(firebaseAuth)
            setRegisterModal(false)
            openLinkSent(formData.email, () => sendEmailVerification(userCredential.user))
        } catch (error: any) {
            setErrors({ email: getErrorMessage(error, t('invalidEmail')) })
        } finally {
            setLoading(false)
        }
    }

    const handleLoginNowClick = () => {
        setRegisterModal(false)
        setLogintModal(true)
    }

    return (
        <form className="flexCol gap-8" onSubmit={handleRegister}>
            <div className="flexCol gap-2">
                <Typography variant="h2">
                    {t('createAccount')}
                </Typography>
                <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                    {t('createAccountDesc')}
                </Typography>
            </div>
            <div className='flexCol gap-3'>
                <Input
                    fullWidth
                    required
                    type="email"
                    variant="default"
                    leftIcon={<Mail />}
                    placeholder="e.g, JackWilliams11@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className=""
                    error={errors.email}
                />
                <Input
                    fullWidth
                    required
                    type={showPassword ? "text" : "password"}
                    variant="default"
                    leftIcon={<Lock />}
                    rightIcon={showPassword ? <EyeOff /> : <Eye />}
                    onRightIconClick={() => setShowPassword(prev => !prev)}
                    placeholder={t('enterStrongPassword')}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className=""
                    error={errors.password}
                />
                <Input
                    fullWidth
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    variant="default"
                    leftIcon={<Lock />}
                    rightIcon={showConfirmPassword ? <EyeOff /> : <Eye />}
                    onRightIconClick={() => setShowConfirmPassword(prev => !prev)}
                    placeholder={t('confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className=""
                    error={errors.confirmPassword}
                />
                <div className='flexCol gap-2'>
                    <div className='flexCenter mt-2'>
                        <Button fullWidth type="submit" loading={loading}>
                            {t('continue')}
                        </Button>

                    </div>
                    <div className="flexCenter">
                        <Typography variant="h6" className="font-nunito!" weight="regular">
                            {t('alreadyHaveAcc')} <span className="font-nunito! font-semibold! primaryColor underline cursor-pointer" onClick={handleLoginNowClick}>{t('loginNow')}</span>
                        </Typography>
                    </div>
                </div>
            </div>
            <div className="flexCenter text-center">
                <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">
                    {t('byClickingContinue')} <LocalizedLink href="/terms-conditions" className="underline font-nunito! primaryColor!">{t('termCondition')}</LocalizedLink> {t('and')} <LocalizedLink href="/privacy-policy" className="underline font-nunito! primaryColor!">{t('privacyPolicy')}</LocalizedLink>
                </Typography>
            </div>
        </form>
    )
}

export default RegisterModal
