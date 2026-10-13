'use client'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signInAnonymously } from 'firebase/auth'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Typography } from '../storybook/atoms/Typography'
import { Button } from '../storybook/atoms/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { firebaseAuth, getFcmToken } from '@/lib/firebase'
import { loginSuccess, profileSelector, setProfile } from '@/redux/reducers/userSlice'
import { signup, fetchUserProfile } from '@/api/apiRoutes'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/utils/errorMessages'
import loginRequiredImg from '@/assets/login_required.png'
import ImagePreview from '../storybook/atoms/ImagePreview'

interface LoginRequiredModalProps {
    open: boolean
    onClose: (open: boolean) => void
    onGuestClick: () => void
    onLoginClick: () => void
}

const LoginRequiredModal = ({ open, onClose, onGuestClick, onLoginClick }: LoginRequiredModalProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const profileData = useSelector(profileSelector);
    const [guestLoading, setGuestLoading] = useState(false)

    const handleGuestClick = async () => {
        if (guestLoading) return

        if (profileData?.type === 'guest') {
            onClose(false)
            onGuestClick()
            return
        }

        try {
            setGuestLoading(true)
            const { user } = await signInAnonymously(firebaseAuth)
            const fcmToken = await getFcmToken()

            const formPayload = new FormData()
            formPayload.append('firebase_id', user.uid)
            formPayload.append('type', 'guest')
            formPayload.append('name', `elite${user.uid.slice(0, 3)}`)
            if (fcmToken) formPayload.append('fcm_token', fcmToken)

            const res = await signup(formPayload)
            if (res.data.token) {
                dispatch(loginSuccess(res.data.token))
                const profileRes = await fetchUserProfile()
                dispatch(setProfile(profileRes.data))
                onClose(false)
                onGuestClick()
            } else {
                toast.error(t('somethingWentWrong'))
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')))
        } finally {
            setGuestLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="">
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol text-center">
                    <div className="h-62.5">
                        <ImagePreview src={loginRequiredImg} alt={t('loginRequired')} className="object-contain" />
                    </div>
                    <div className="flexCol gap-2">
                        <Typography variant="h2">
                            {t('loginRequired')}
                        </Typography>
                        <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                            {t('loginRequiredDesc')}
                        </Typography>
                    </div>
                    <div className="flex gap-3 mt-2 flex-col md:flex-row">
                        <Button fullWidth type="button" variant="secondaryShade" loading={guestLoading} onClick={handleGuestClick}>
                            {t('playAsGuest')}
                        </Button>
                        <Button fullWidth type="button" variant="primary" onClick={onLoginClick}>
                            {t('loginNow')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LoginRequiredModal
