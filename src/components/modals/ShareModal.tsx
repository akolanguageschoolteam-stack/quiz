'use client'
import {
    WhatsappShareButton,
    WhatsappIcon,
    FacebookShareButton,
    FacebookIcon,
    XShareButton,
    XIcon,
    TelegramShareButton,
    TelegramIcon,
    LinkedinShareButton,
    LinkedinIcon,
    EmailShareButton,
    EmailIcon,
} from "react-share"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Typography } from "../storybook/atoms/Typography"
import { Copy } from "../common/Icons"
import { useTranslation } from "@/hooks/useTranslation"
import { toast } from "@/lib/toast"

interface ShareModalProps {
    open: boolean
    onClose: (open: boolean) => void
    shareUrl: string
    shareText: string
}

const ShareModal = ({ open, onClose, shareUrl, shareText }: ShareModalProps) => {

    const { t } = useTranslation();

    const handleCopyTemplate = () => {
        navigator.clipboard?.writeText(shareText)
            .then(() => toast.success(t('referralCodeCopied')))
            .catch(() => { })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="">
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-6 flexCol">
                    <DialogHeader>
                        <DialogTitle asChild>
                            <Typography variant="h2" weight="semibold">
                                {t('inviteNow')}
                            </Typography>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <WhatsappShareButton url={shareUrl} title={shareText}>
                            <WhatsappIcon size={48} round />
                        </WhatsappShareButton>
                        <FacebookShareButton url={shareUrl}>
                            <FacebookIcon size={48} round />
                        </FacebookShareButton>
                        <XShareButton url={shareUrl} title={shareText}>
                            <XIcon size={48} round />
                        </XShareButton>
                        <TelegramShareButton url={shareUrl} title={shareText}>
                            <TelegramIcon size={48} round />
                        </TelegramShareButton>
                        <LinkedinShareButton url={shareUrl} summary={shareText}>
                            <LinkedinIcon size={48} round />
                        </LinkedinShareButton>
                        <EmailShareButton url={shareUrl} subject={t('referAndEarn')} body={shareText}>
                            <EmailIcon size={48} round />
                        </EmailShareButton>
                    </div>

                    <div
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl surfaceContainerLowBg cursor-pointer"
                        onClick={handleCopyTemplate}
                    >
                        <div className="w-10 h-10 rounded-xl bg-(--primary-100) dark:bg-(--primary-900) flexCenter shrink-0">
                            <Copy width={18} height={18} />
                        </div>
                        <Typography variant="h6" weight="medium" className="font-nunito! truncate">
                            {t('copyCode')}
                        </Typography>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ShareModal
