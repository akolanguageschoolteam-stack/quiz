'use client'
import { useState } from 'react'
import { Typography } from '../storybook/atoms/Typography'
import { Button } from '../storybook/atoms/Button'
import { useTranslation } from '@/hooks/useTranslation';
import mailSentImg from '@/assets/mailSent.svg'
import ThemeSvg from '../common/ThemeSvg';
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/utils/errorMessages'

interface LinkSentModalProps {
    email?: string
    onResend?: () => Promise<void>
}

const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@')
    if (!localPart || !domain) return email
    const visible = localPart.slice(0, localPart.length > 2 ? 2 : 1)
    return `${visible}${'*'.repeat(Math.max(localPart.length - visible.length, 3))}@${domain}`
}

const LinkSentModal = ({ email = '', onResend }: LinkSentModalProps) => {

    const { t } = useTranslation();
    const [resending, setResending] = useState(false)

    const handleResend = async () => {
        if (resending) return
        try {
            setResending(true)
            await onResend?.()
            toast.success(t('linkResent'))
        } catch (error: any) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')))
        } finally {
            setResending(false)
        }
    }

    const handleOpenMailApp = () => {
        window.location.href = 'mailto:'
    }

    return (
        <div className="flexCol gap-8 text-center" >
            <div className='h-62.5'>
                <ThemeSvg src={mailSentImg} />
            </div>
            <div className="flexCol gap-2 mt-8 md:mt-12">
                <Typography variant="h2">
                    {t('magicLinkSent')}
                </Typography>
                <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                    {t('magicLinkSentDesc')} {email && <span className="onSurfaceColor font-semibold">{maskEmail(email)}</span>}
                </Typography>
            </div>
            <div className='flexCol gap-3'>
                <Typography variant="h6" className="font-nunito!" weight="regular">
                    {t('didntGetIt')} <span className={`font-nunito! font-semibold! primaryColor underline ${resending ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`} onClick={handleResend}>{t('resend')}</span>
                </Typography>
                <div className='flexCenter mt-2'>
                    <Button fullWidth type="button" onClick={handleOpenMailApp}>
                        {t('openMailApp')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default LinkSentModal
