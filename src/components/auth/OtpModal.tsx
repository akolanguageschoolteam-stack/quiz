'use client'
import { useTranslation } from "@/hooks/useTranslation";
import { Typography } from "../storybook/atoms/Typography";
import { Button } from "../storybook/atoms/Button";
import { OptBox, OptBoxHandle } from "../storybook/molecules/optBox";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { ConfirmationResult, PhoneAuthProvider, linkWithCredential, signInWithCredential } from "firebase/auth";
import { firebaseAuth, getFcmToken } from "@/lib/firebase";
import { checkUserExists, fetchUserProfile } from "@/api/apiRoutes";
import { getErrorMessage } from "@/utils/errorMessages";
import { toast } from "@/lib/toast";
import { loginSuccess, profileSelector, setProfile } from "@/redux/reducers/userSlice";
import CompleteProfileModal from "../modals/CompleteProfileModal";

const OTP_LENGTH = 6
const RESEND_TIMER = 90

interface OtpModalProps {
    confirmationResultRef: React.MutableRefObject<ConfirmationResult | null>
    onResendOtp: () => Promise<void>
    onAuthSuccess: () => void
    mobile?: string
}

const OptModal = ({ confirmationResultRef, onResendOtp, onAuthSuccess, mobile }: OtpModalProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const profileData = useSelector(profileSelector);
    const isGuest = profileData?.type === 'guest';

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
    const [resendTimer, setResendTimer] = useState(RESEND_TIMER)
    const [canResend, setCanResend] = useState(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [completeProfileModal, setCompleteProfileModal] = useState(false)
    const [convertProfileModal, setConvertProfileModal] = useState(false)
    const [convertMobile, setConvertMobile] = useState<string | null>(null)
    const [authContext, setAuthContext] = useState<{ firebaseId: string, fcmToken: string | null }>({ firebaseId: '', fcmToken: null })

    const otpBoxRef = useRef<OptBoxHandle>(null)

    const otpSchema = z.object({
        otp: z.string().min(6, t('otpMinLength')).max(6, t('otpMinLength')),
    })

    useEffect(() => {
        if (resendTimer <= 0) {
            setCanResend(true)
            return
        }
        const interval = setInterval(() => {
            setResendTimer(prev => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [resendTimer])

    // Firebase reuses `auth/invalid-credential` for a wrong/expired phone code, and
    // `auth/account-exists-with-different-credential` when the number's already tied to
    // another account — both share messages worded for email/password login. Override
    // them here for OTP context.
    const getVerifyErrorMessage = (error: any) => {
        if (error?.code === 'auth/invalid-credential') return t('invalidOtpCode')
        if (error?.code === 'auth/account-exists-with-different-credential') return t('phoneAlreadyLinked')
        return getErrorMessage(error, t('otpMinLength'))
    }

    const formatResendTimer = (timeInSeconds: number) => {
        const m = Math.floor(timeInSeconds / 60)
        const s = timeInSeconds % 60
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
    }

    const handleResend = async () => {
        try {
            setLoading(true)
            await onResendOtp()
            setResendTimer(RESEND_TIMER)
            setCanResend(false)
            setOtp(Array(OTP_LENGTH).fill(''))
            otpBoxRef.current?.focus(0)
        } catch (error: any) {
            toast.error(getErrorMessage(error, t('otpResendFailed')))
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        const otpValue = otp.join('')
        const result = otpSchema.safeParse({ otp: otpValue })
        if (!result.success) {
            toast.error(result.error.issues[0]?.message ?? t('otpMinLength'))
            return
        }
        if (!confirmationResultRef.current) return

        try {
            setLoading(true)

            if (isGuest && firebaseAuth.currentUser) {
                // Attach the phone credential to the current (anonymous) firebase user first —
                // keeps the same firebase uid instead of signing into a brand-new one — then
                // convert the guest account on the backend.
                const credential = PhoneAuthProvider.credential(confirmationResultRef.current.verificationId, otpValue)
                try {
                    await linkWithCredential(firebaseAuth.currentUser, credential)
                } catch (linkError: any) {
                    if (linkError?.code !== 'auth/credential-already-in-use') throw linkError

                    toast.error(t('phoneAlreadyLinked'))

                    // This number is already tied to a different account — sign into that one instead.
                    const userCredential = await signInWithCredential(firebaseAuth, credential)
                    const firebaseId = userCredential.user.uid
                    const fcmToken = await getFcmToken()
                    const res = await checkUserExists({ firebase_id: firebaseId, fcm_token: fcmToken, type: 'mobile' })
                    if (res.data.exists && res.data.token) {
                        dispatch(loginSuccess(res.data.token))
                        const profileRes = await fetchUserProfile()
                        dispatch(setProfile(profileRes.data))
                    }
                    onAuthSuccess()
                    return
                }

                // Number verified and free to use — collect name before converting the account.
                setConvertMobile(mobile ? mobile.replace(/\D/g, '').slice(-10) : null)
                setConvertProfileModal(true)
                return
            }

            const userCredential = await confirmationResultRef.current.confirm(otpValue)
            const firebaseId = userCredential.user.uid
            const fcmToken = await getFcmToken()
            setAuthContext({ firebaseId, fcmToken })

            const res = await checkUserExists({ firebase_id: firebaseId, fcm_token: fcmToken, type: 'mobile' })
            if (res.data.exists && res.data.token) {
                dispatch(loginSuccess(res.data.token))
                const profileRes = await fetchUserProfile()
                dispatch(setProfile(profileRes.data))
                onAuthSuccess()
            } else {
                setCompleteProfileModal(true)
            }
        } catch (error: any) {
            toast.error(getVerifyErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const isOtpComplete = otp.every(digit => digit !== '')

    return (
        <form onSubmit={handleVerify} className="flexCol gap-8">
            <div className="flexColCenter text-center gap-2">
                <Typography variant="h2">
                    {t('verifyAccount')}
                </Typography>
                <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                    {t('verifyAccountDesc')}
                </Typography>
            </div>

            <OptBox ref={otpBoxRef} length={OTP_LENGTH} value={otp} onChange={setOtp} ariaLabel="OTP digit" />

            <div className="flexColCenter gap-3">
                <Button variant="primary" fullWidth type="submit" loading={loading} disabled={!isOtpComplete || loading}>
                    {t('verifyCode')}
                </Button>

                <div className="flexCenter">
                    {canResend ? (
                        <button type="button" onClick={handleResend} disabled={loading}>
                            <Typography variant="caption" className="primaryColor! font-semibold cursor-pointer">
                                {t('resendCode')}
                            </Typography>
                        </button>
                    ) : (
                        <Typography variant="caption" className="onSurfaceVarColor!">
                            {t('resendIn')} - <span className="primaryColor! font-semibold">{formatResendTimer(resendTimer)}</span>
                        </Typography>
                    )}
                </div>
            </div>

            <CompleteProfileModal
                open={completeProfileModal}
                onClose={setCompleteProfileModal}
                firebaseId={authContext.firebaseId}
                fcmToken={authContext.fcmToken}
                type="mobile"
                mobile={mobile}
                onSuccess={onAuthSuccess}
            />

            <CompleteProfileModal
                open={convertProfileModal}
                onClose={setConvertProfileModal}
                isConvertGuest
                type="mobile"
                mobile={convertMobile ?? undefined}
                onSuccess={onAuthSuccess}
            />
        </form>
    )
}

export default OptModal
