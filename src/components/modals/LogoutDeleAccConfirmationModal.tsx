'use client'
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Typography } from "../storybook/atoms/Typography";
import { Button } from "../storybook/atoms/Button";
import { useTranslation } from "@/hooks/useTranslation";
import logoutImg from '@/assets/logout.png'
import deleteAccImg from '@/assets/deleteAcc.png'
import ImagePreview from "../storybook/atoms/ImagePreview";
import { useIsMobile } from "@/hooks/useMobile";
import Input from "../storybook/atoms/Input/Input";
import { deleteAccount, logout } from "@/api/apiRoutes";
import { logoutSuccess } from "@/redux/reducers/userSlice";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/utils/errorMessages";
import { deleteUser } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

const RELOGIN_THRESHOLD_MS = 30 * 60 * 1000

interface LogoutDeleAccConfirmationModalProps {
    open: boolean,
    deleteAcc?: boolean,
    onClose: (open: boolean) => void
}

const LogoutDeleAccConfirmationModal = ({ open, onClose, deleteAcc = false }: LogoutDeleAccConfirmationModalProps) => {

    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const dispatch = useDispatch();
    const router = useLocalizedRouter();
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const isDeleteConfirmed = confirmText === 'DELETE';

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setConfirmText('');
        onClose(nextOpen);
    }

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logout();
            dispatch(logoutSuccess());
            onClose(false);
            router.push('/');
            toast.success(t('logoutSuccessfully'))

        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteAccount = async () => {
        if (!isDeleteConfirmed) return;

        const currentUser = firebaseAuth.currentUser;
        if (!currentUser) {
            // No active firebase session to delete from — never fall through to deleting
            // the database record without it.
            toast.error(t('reloginRequiredToDelete'));
            dispatch(logoutSuccess());
            onClose(false);
            router.push('/');
            return;
        }

        const lastSignInTime = currentUser.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).getTime() : 0;
        if (Date.now() - lastSignInTime > RELOGIN_THRESHOLD_MS) {
            toast.error(t('reloginRequiredToDelete'));
            dispatch(logoutSuccess());
            onClose(false);
            router.push('/');
            return;
        }

        try {
            setLoading(true);
            // Firebase deletion must succeed before the database record is removed — if this
            // throws, the catch block below stops us from ever reaching deleteAccount.
            await deleteUser(currentUser);
            await deleteAccount(confirmText);
            dispatch(logoutSuccess());
            toast.success(t('accDeletedSuccessfully'))
            onClose(false);
            router.push('/');
        } catch (error: any) {
            if (error?.code === 'auth/requires-recent-login') {
                toast.error(t('reloginRequiredToDelete'));
                dispatch(logoutSuccess());
                onClose(false);
                router.push('/');
                return;
            }
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = deleteAcc ? handleDeleteAccount : handleLogout;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} >
                <div className="surfaceContainerLowestBg rounded-3xl shadow-[0px_8px_32px_0px_#0000001A] max-w-104.5 mx-auto p-6 md:p-8 flexColCenter gap-6 text-center max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar">
                    <div className="flexColCenter gap-2">
                        <div className="w-auto h-auto mb-4">
                            <ImagePreview src={deleteAcc ? deleteAccImg : logoutImg} alt="statusImg" className="aspect-220/220" />
                        </div>
                        <DialogTitle asChild>
                            <Typography variant="h3" weight="bold">{t(deleteAcc ? 'deleteAccountConfirmTitle' : 'logoutConfirmTitle')}</Typography>
                        </DialogTitle>
                        <DialogDescription asChild>
                            <Typography variant="subtitle2" className="onSurfaceVarColor! font-nunito!">{t(deleteAcc ? 'deleteAccountConfirmDesc' : 'logoutConfirmDesc')}</Typography>
                        </DialogDescription>
                    </div>
                    {deleteAcc && (
                        <Input
                            fullWidth
                            size={isMobile ? 'sm' : 'md'}
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={t('deleteAccountTypeConfirm')}
                            autoComplete="off"
                        />
                    )}
                    <div className="flex items-center gap-3 w-full max-375:flex-wrap">
                        <Button
                            type="button"
                            size={isMobile ? 'sm' : 'md'}
                            variant="secondaryShade"
                            fullWidth
                            loading={loading}
                            disabled={deleteAcc && !isDeleteConfirmed}
                            onClick={handleConfirm}
                        >
                            {t(deleteAcc ? 'delete' : 'logout')}
                        </Button>
                        <Button type="button" size={isMobile ? 'sm' : 'md'} variant="primary" fullWidth onClick={() => handleOpenChange(false)}>
                            {t(deleteAcc ? 'notReally' : 'keepLogged')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LogoutDeleAccConfirmationModal