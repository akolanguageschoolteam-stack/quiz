import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, linkWithPopup } from "firebase/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { Typography } from "../storybook/atoms/Typography"
import apple from '@/assets/apple.svg'
import google from '@/assets/google.svg'
import phone from '@/assets/phoneIcon.svg'
import ImagePreview from "../storybook/atoms/ImagePreview";
import ThemeSvg from "../common/ThemeSvg";
import { Mail } from "../common/Icons";
import { firebaseAuth, getFcmToken } from "@/lib/firebase";
import { checkUserExists, fetchUserProfile } from "@/api/apiRoutes";
import { loginSuccess, profileSelector, setProfile } from "@/redux/reducers/userSlice";
import CompleteProfileModal from "../modals/CompleteProfileModal";
import { getErrorMessage } from "@/utils/errorMessages";
import { toast } from "@/lib/toast";

type SocialProvider = 'google' | 'apple'

export interface AuthMethods {
    email: boolean
    phone: boolean
    apple: boolean
    google: boolean
}

interface ContinueWithProps {
    loginModal: boolean
    phoneModal: boolean
    setPhoneModal: (open: boolean) => void
    setLogintModal: (open: boolean) => void
    setRegisterModal: (open: boolean) => void
    onAuthSuccess: () => void
    authMethods: AuthMethods
}

const ContinueWith = ({ loginModal, phoneModal, setPhoneModal, setLogintModal, setRegisterModal, onAuthSuccess, authMethods }: ContinueWithProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const profileData = useSelector(profileSelector);
    const isGuest = profileData?.type === 'guest';

    const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null)
    const [error, setError] = useState('')
    const [completeProfileModal, setCompleteProfileModal] = useState(false)
    const [authContext, setAuthContext] = useState<{ firebaseId: string, fcmToken: string | null, provider: SocialProvider, email: string }>({ firebaseId: '', fcmToken: null, provider: 'google', email: '' })
    const [convertProfileModal, setConvertProfileModal] = useState(false)
    const [convertEmail, setConvertEmail] = useState<string | undefined>(undefined)

    const handleLoginWith = (phoneLogin = false) => {
        if (phoneLogin) {
            setLogintModal(false)
            setPhoneModal(true)
        }
        else {
            setPhoneModal(false)
            setLogintModal(true)
        }
    }

    const handleRegisterClick = () => {
        setLogintModal(false)
        setPhoneModal(false)
        setRegisterModal(true)
    }

    const handleSocialLogin = async (provider: SocialProvider) => {
        try {
            setSocialLoading(provider)
            setError('')
            const authProvider = provider === 'google' ? new GoogleAuthProvider() : new OAuthProvider('apple.com')

            if (isGuest && provider === 'google' && firebaseAuth.currentUser) {
                // Attach the google credential to the current (anonymous) firebase user first —
                // keeps the same firebase uid instead of signing into a brand-new one — then
                // convert the guest account on the backend.
                let linkedCredential
                try {
                    linkedCredential = await linkWithPopup(firebaseAuth.currentUser, authProvider)
                } catch (linkError: any) {
                    const isAlreadyLinked = linkError?.code === 'auth/credential-already-in-use'
                        || String(linkError?.message ?? '').includes('FEDERATED_USER_ID_ALREADY_LINKED')
                        || String(linkError?.customData?._tokenResponse?.error?.message ?? '').includes('FEDERATED_USER_ID_ALREADY_LINKED')
                    if (!isAlreadyLinked) throw linkError

                    toast.error(t('googleAlreadyLinked'))

                    // This google account is already tied to a different account — sign into that one instead.
                    const userCredential = await signInWithPopup(firebaseAuth, authProvider)
                    const firebaseId = userCredential.user.uid
                    const fcmToken = await getFcmToken()
                    const res = await checkUserExists({ firebase_id: firebaseId, fcm_token: fcmToken, type: 'google', mail_address: userCredential.user.email })
                    if (res.data.exists && res.data.token) {
                        dispatch(loginSuccess(res.data.token))
                        const profileRes = await fetchUserProfile()
                        dispatch(setProfile(profileRes.data))
                    }
                    onAuthSuccess()
                    return
                }

                // Google account linked and free to use — collect/confirm name before converting.
                setConvertEmail(linkedCredential.user.email ?? undefined)
                setConvertProfileModal(true)
                return
            }

            const userCredential = await signInWithPopup(firebaseAuth, authProvider)
            const firebaseId = userCredential.user.uid
            const fcmToken = await getFcmToken()
            setAuthContext({ firebaseId, fcmToken, provider, email: userCredential.user.email ?? '' })

            const res = await checkUserExists({ firebase_id: firebaseId, fcm_token: fcmToken, type: provider === 'google' ? 'google' : 'apple', mail_address: userCredential.user.email })
            if (res.data.exists && res.data.token) {
                dispatch(loginSuccess(res.data.token))
                const profileRes = await fetchUserProfile()
                dispatch(setProfile(profileRes.data))
                onAuthSuccess()
            } else {
                setCompleteProfileModal(true)
            }
        } catch (err: any) {
            setError(getErrorMessage(err, t('somethingWentWrong')))
        } finally {
            setSocialLoading(null)
        }
    }

    const showToggle = authMethods.email && authMethods.phone
    const showSocialRow = authMethods.apple || authMethods.google || showToggle

    return (
        <div className="flexCol gap-8">
            {showSocialRow && (
                <>
                    {(authMethods.email || authMethods.phone) && (
                        <div className="flexCenter gap-3">
                            <div className="bg-gray-300 h-px w-1/6 sm:w-1/4"></div>
                            <Typography className="font-nunito!" weight="regular">
                                {t('orContinueWith')}
                            </Typography>
                            <div className="bg-gray-300 h-px w-1/6 sm:w-1/4"></div>
                        </div>
                    )}
                    {error && (
                        <Typography variant="caption" className="text-center errorColor font-nunito! font-medium!">
                            {error}
                        </Typography>
                    )}
                    <div className="flex gap-3">
                        {authMethods.apple && (
                            <div
                                className={`flex-1 border commonBorderB py-4 px-6 rounded-2xl flexCenter cursor-pointer ${socialLoading ? 'opacity-50 pointer-events-none' : ''}`}
                                onClick={() => handleSocialLogin('apple')}
                            >
                                {socialLoading === 'apple' ? (
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                ) : (
                                    <ImagePreview src={apple} alt="apple" className="w-8! h-8! dark:invert" />
                                )}
                            </div>
                        )}
                        {authMethods.google && (
                            <div
                                className={`flex-1 border commonBorderB py-4 px-6 rounded-2xl flexCenter cursor-pointer ${socialLoading ? 'opacity-50 pointer-events-none' : ''}`}
                                onClick={() => handleSocialLogin('google')}
                            >
                                {socialLoading === 'google' ? (
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 primaryBg rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 primaryBg rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                        <span className="w-2 h-2 primaryBg rounded-full animate-bounce [animation-delay:0.3s]"></span>
                                        <span className="w-2 h-2 primaryBg rounded-full animate-bounce [animation-delay:0.5s]"></span>
                                    </div>
                                ) : (
                                    <ImagePreview src={google} alt="google" className="w-6! h-6!" />
                                )}
                            </div>
                        )}
                        {showToggle && (
                            phoneModal ?
                                <div className="flex-1 border commonBorderB py-4 px-6 rounded-2xl flexCenter cursor-pointer" onClick={() => handleLoginWith(false)}>
                                    <Mail />
                                </div>
                                :
                                <div className="flex-1 border commonBorderB py-4 px-6 rounded-2xl flexCenter cursor-pointer" onClick={() => handleLoginWith(true)}>
                                    <ThemeSvg src={phone} className="w-6! h-6!" />
                                </div>
                        )}
                    </div>
                </>
            )}
            {authMethods.email && (
                <div className="flexCenter">
                    <Typography variant="h6" className="font-nunito!" weight="regular">
                        {t('dontHaveAcc')} <span className="font-nunito! font-semibold! primaryColor underline cursor-pointer" onClick={handleRegisterClick}>{t('signUp')}</span>
                    </Typography>
                </div>
            )}
            <CompleteProfileModal
                open={completeProfileModal}
                onClose={setCompleteProfileModal}
                firebaseId={authContext.firebaseId}
                fcmToken={authContext.fcmToken}
                type={authContext.provider}
                email={authContext.email}
                onSuccess={onAuthSuccess}
            />

            <CompleteProfileModal
                open={convertProfileModal}
                onClose={setConvertProfileModal}
                isConvertGuest
                type="google"
                email={convertEmail}
                onSuccess={onAuthSuccess}
            />
        </div>
    )
}

export default ContinueWith