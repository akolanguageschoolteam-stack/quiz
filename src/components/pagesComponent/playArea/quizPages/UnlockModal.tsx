'use client'
import { Typography } from "@/components/storybook/atoms/Typography";
import { Button } from "@/components/storybook/atoms/Button";
import { Coin } from "@/components/common/Icons";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";

interface UnlockModalProps {
    message: string;
    description?: string;
    buttonText?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    loading?: boolean;
}

const UnlockModal = ({ message, description, buttonText, open, onOpenChange, onConfirm, loading = false }: UnlockModalProps) => {

    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={(next) => { if (loading) return; onOpenChange(next); }}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="surfaceContainerLowestBg rounded-2xl shadow-[0px_8px_32px_0px_#0000001A] w-100 max-w-[calc(100vw-2rem)] p-6 md:p-8 flexColCenter gap-5 text-center">

                <div className="flexCenter">
                    <Coin width={160} height={160} />
                </div>

                <div className="flexCol gap-2">
                    <DialogTitle asChild>
                        <Typography variant="h2" className="lg:text-3xl! font-normal! font-candal! leading-9! onSurfaceColor">
                            {message}
                        </Typography>
                    </DialogTitle>
                    <DialogDescription asChild>
                        <Typography variant="h6" className="lg:text-xl! font-medium! font-nunito! leading-7! onSurfaceVarColor">
                            {description ?? t('unlockConfirmDesc')}
                        </Typography>
                    </DialogDescription>
                </div>

                <Button variant="primary" fullWidth onClick={onConfirm} loading={loading} disabled={loading}>
                    <span className="text-base xl:text-xl! font-normal! font-candal! leading-7 onPrimaryColor [text-shadow:0px_2px_0px_rgb(167_58_95/1.00)]">
                        {buttonText ?? t('playNow')}
                    </span>
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default UnlockModal;
