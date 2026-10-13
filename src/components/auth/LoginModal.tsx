import React, { useCallback, useState } from 'react'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { Typography } from '../storybook/atoms/Typography'
import Input from '../storybook/atoms/Input/Input'
import { Eye, EyeOff, Lock, Mail } from '../common/Icons'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '../storybook/atoms/Button'
import ContinueWith, { AuthMethods } from './ContinueWith'
import CompleteProfileModal from '../modals/CompleteProfileModal'
import { firebaseAuth, getFcmToken } from '@/lib/firebase'
import { checkUserExists, fetchUserProfile } from '@/api/apiRoutes'
import { loginSuccess, setProfile } from '@/redux/reducers/userSlice'
import { getErrorMessage } from '@/utils/errorMessages'

type LoginErrors = Partial<Record<string, string>>
interface LoginModalProps {
    loginModal: boolean
    phoneModal: boolean
    setPhoneModal: (open: boolean) => void
    setLogintModal: (open: boolean) => void
    setRegisterModal: (open: boolean) => void
    setForgotPass: (open: boolean) => void
    onAuthSuccess: () => void
    authMethods: AuthMethods
    openLinkSent: (email: string, onResend: () => Promise<void>) => void
}

const LoginModal = ({ loginModal, phoneModal, setPhoneModal, setLogintModal, setRegisterModal, setForgotPass, onAuthSuccess, authMethods, openLinkSent }: LoginModalProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const [errors, setErrors] = useState<LoginErrors>({})
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [completeProfileModal, setCompleteProfileModal] = useState(false)
    const [authContext, setAuthContext] = useState<{ firebaseId: string, fcmToken: string | null }>({ firebaseId: '', fcmToken: null })

    const loginSchema = z.object({
        email: z.string().min(1, t('emailRequired')).email(t('invalidEmail')),
        password: z.string().min(1, t('passwordRequired')).min(6, t('passwordMinLength')),
    })

    const handleValidateForm = useCallback((): boolean => {
        const result = loginSchema.safeParse(formData)
        if (!result.success) {
            const fieldErrors: LoginErrors = {}
            result.error.issues.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                if (!fieldErrors[field]) fieldErrors[field] = err.message
            })
            setErrors(fieldErrors)
            return false
        }
        setErrors({})
        return true
    }, [formData, loginSchema])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        const isValid = handleValidateForm()
        if (!isValid) return

        try {
            setLoading(true)
            setErrors({})
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, formData.email, formData.password)

            if (!userCredential.user.emailVerified) {
                await sendEmailVerification(userCredential.user)
                await signOut(firebaseAuth)
                setLogintModal(false)
                openLinkSent(formData.email, () => sendEmailVerification(userCredential.user))
                return
            }

            const firebaseId = userCredential.user.uid
            const fcmToken = await getFcmToken()
            setAuthContext({ firebaseId, fcmToken })

            const res = await checkUserExists({ firebase_id: firebaseId, fcm_token: fcmToken, type: "email", mail_address: formData.email })
            if (res.data.exists && res.data.token) {
                dispatch(loginSuccess(res.data.token))
                const profileRes = await fetchUserProfile()
                dispatch(setProfile(profileRes.data))
                onAuthSuccess()
            } else {
                setCompleteProfileModal(true)
            }
        } catch (error: any) {
            setErrors({ password: getErrorMessage(error, t('passwordMinLength')) })
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassClick = async () => {
        setLogintModal(false)
        setForgotPass(true) 
    }

    return (
        <form className="flexCol gap-8" onSubmit={handleLogin}>
            <div className="flexCol gap-2">
                <Typography variant="h2">
                    {t('welcomeBack')}
                </Typography>
                <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                    {t('welcomeBackDesc')}
                </Typography>
            </div>
            {authMethods.email && (
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
                        placeholder={t('enterYourPassword')}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className=""
                        error={errors.password}
                    />
                    <div className="flex justify-end">
                        <Typography variant="h5" className="" weight="semibold">
                            <span onClick={handleForgotPassClick} className='font-nunito! primaryColor! text-sm! underline!'>
                                {t('forgotPassword')}
                            </span>
                        </Typography>
                    </div>
                    <div className='flexCenter mt-2'>
                        <Button fullWidth type="submit" loading={loading}>
                            {t('loginNow')}
                        </Button>
                    </div>
                </div>
            )}
            <ContinueWith loginModal={loginModal} phoneModal={phoneModal} setPhoneModal={setPhoneModal} setLogintModal={setLogintModal} setRegisterModal={setRegisterModal} onAuthSuccess={onAuthSuccess} authMethods={authMethods} />
            <CompleteProfileModal
                open={completeProfileModal}
                onClose={setCompleteProfileModal}
                firebaseId={authContext.firebaseId}
                fcmToken={authContext.fcmToken}
                type="email"
                email={formData.email}
                onSuccess={onAuthSuccess}
            />
        </form>
    )
}

export default LoginModal