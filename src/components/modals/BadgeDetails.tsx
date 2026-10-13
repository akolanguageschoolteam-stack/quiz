'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/storybook/atoms/Button"
import { Typography } from "@/components/storybook/atoms/Typography"
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import { PremiumCoin } from "@/components/common/Icons"
import { BadgeItem } from "@/types/GlobalTypes"

interface BadgeDetailsProps {
    open: boolean,
    onClose: (open: boolean) => void,
    badge: BadgeItem | null,
}

const BadgeDetails = ({ open, onClose, badge }: BadgeDetailsProps) => {

    const { t } = useTranslation();

    if (!badge) return null;

    const progressPercent = badge?.counter_required
        ? Math.min(100, (badge?.counter_progress / badge?.counter_required) * 100)
        : 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <div className="surfaceBrightBg rounded-[42px] p-6 sm:p-8 gap-6 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol items-center text-center">
                    <DialogHeader className="items-center gap-4">
                        <div className={`relative ${badge?.is_unlocked ? 'primaryBg' : 'bg-[#7E7E7E]'} h-32 w-32 sm:h-36 sm:w-36`} style={{
                            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                        }}>
                            <div className="w-18 h-20 sm:w-20 sm:h-22.5 absolute! inset-0 m-auto z-1">
                                <ImagePreview src={badge?.icon} alt={badge?.label} />
                            </div>
                        </div>

                        <DialogTitle>
                            <Typography variant='h2' weight='extrabold' className='line-clamp-1'>
                                {badge?.label}
                            </Typography>
                        </DialogTitle>

                        <DialogDescription asChild>
                            <Typography variant='h5' weight='medium' className='font-nunito! onSurfaceVarColor!'>
                                {badge?.note}
                            </Typography>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full flexCol gap-2">
                        <div className="flex items-center justify-between">
                            <Typography variant='h6' weight='medium' className='font-nunito! onSurfaceVarColor!'>
                                {t('progress')}
                            </Typography>
                            <Typography variant='h6' weight='semibold' className='font-nunito!'>
                                {badge?.counter_progress}/{badge?.counter_required}
                            </Typography>
                        </div>
                        <div className="h-2 w-full rounded-full surfaceContainerLowBg overflow-hidden">
                            <div className="h-full rounded-full primaryBg transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>

                    {badge?.reward > 0 && (
                        <div className="w-full surfaceContainerLowBg rounded-2xl py-3 px-4 flexCenter gap-2">
                            <PremiumCoin />
                            <Typography variant='h6' weight='semibold' className='font-nunito!'>
                                {badge?.is_unlocked
                                    ? `${t('coins')} ${badge?.reward}`
                                    : t('winCoinsByUnlocking').replace('{coins}', String(badge?.reward))}
                            </Typography>
                        </div>
                    )}

                    <Button variant="primary" fullWidth onClick={() => onClose(false)}>
                        {t('gotIt')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default BadgeDetails
