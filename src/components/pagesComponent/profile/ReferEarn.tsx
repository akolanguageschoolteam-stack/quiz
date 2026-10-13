'use client'
import { useState } from "react"
import ProfileLayout from "./ProfileLayout"
import { useTranslation } from "@/hooks/useTranslation"
import { Typography } from "@/components/storybook/atoms/Typography"
import { Button } from "@/components/storybook/atoms/Button"
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import { Copy, PremiumCoin } from "@/components/common/Icons"
import { useSelector } from "react-redux"
import { profileSelector } from "@/redux/reducers/userSlice"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import { toast } from "@/lib/toast"
import referImg from "@/assets/referEarn.png"
import ShareModal from "@/components/modals/ShareModal"

const ReferEarn = () => {

  const { t } = useTranslation();
  const userData = useSelector(profileSelector);
  const webSettings = useSelector(webSettingsSelector);
  const referCode = userData?.refer_code ?? '';

  const [shareModal, setShareModal] = useState(false)

  const appName = webSettings?.app_name || 'Elite Quiz'
  const referCoin = webSettings?.refer_coin || '100'

  const getFreeCoinsText = `Get Free ${referCoin} Coins`
  const referEarnDescText = `Refer your friend to join ${appName} & earn ${referCoin} Coins directly. You will get ${referCoin}, your friend will get ${referCoin}`
  const referralRules = [
    `You'll earn ${referCoin} coins instantly once your friend signs up using your referral code.`,
    `Your friend will also receive ${referCoin} welcome coins on successful registration.`,
  ]

  const shareUrl = webSettings?.app_link || webSettings?.ios_app_link || (typeof window !== 'undefined' ? window.location.origin : '')

  const shareTemplate = [
    t('challengeYourselfwithFunQuizzes'),
    t('downloadOurQuizApp'),
    referEarnDescText,
    referCode ? `${t('useMyReferralCode')} ${referCode}` : '',
    t('redeemCoinsDesc'),
    shareUrl,
  ].filter(Boolean).join('\n\n')

  const handleCopyCode = () => {
    if (!referCode) return;
    navigator.clipboard?.writeText(shareTemplate)
      .then(() => toast.success(t('referralCodeCopied')))
      .catch(() => { })
  }

  const handleInvite = () => {
    setShareModal(true)
  }

  return (
    <ProfileLayout title={t('referAndEarn')} desc={t('referAndEarnPageDesc')}>
      <div className="flexCol gap-6">
        <div className="p-6 sm:p-8 flexColCenter gap-4 text-center">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36">
            <ImagePreview src={referImg} alt={t('referAndEarn')} objectFit="contain" containerClassName="w-full h-full" />
            <div className="absolute -top-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full warningContainerBg border-2 border-white dark:border-(--neutral-900) flexCenter shadow-[0px_4px_12px_0px_#0000001A]">
              <PremiumCoin width={20} height={20} />
            </div>
          </div>

          <div className="flexColCenter gap-2 max-w-md">
            <Typography variant="h2" weight="bold">{getFreeCoinsText}</Typography>
            <Typography variant="subtitle2" weight="medium" className="onSurfaceVarColor! font-nunito!">
              {referEarnDescText}
            </Typography>
          </div>

          <Button type="button" variant="primary" onClick={handleInvite}>
            {t('inviteNow')}
          </Button>
        </div>

        <div className="p-4 sm:p-6 flexCol mx-auto max-w-162 gap-6 surfaceContainerLowestBg rounded-2xl shadow-[0px_8px_32px_0px_#0000000A]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-(--primary-100) dark:bg-(--primary-900) flexCenter shrink-0 cursor-pointer" onClick={handleCopyCode}>
                <Copy width={20} height={20} />
              </div>
              <div className="min-w-0">
                <Typography variant="caption" weight="medium" className="onSurfaceVarColor! font-nunito! block">{t('referralCode')}</Typography>
                <Typography variant="h4" weight="extrabold" className="tracking-wider truncate">{referCode || '—'}</Typography>
              </div>
            </div>
          </div>

          <div className="commonBg rounded-3xl p-4 md:p-6 flexCol gap-3">
            <Typography variant="h6" weight="extrabold" className="font-nunito!">
              {t('referralRules')}
            </Typography>
            <ul className="list-disc pl-5 flexCol gap-2 marker:onSurfaceVarColor">
              {referralRules.map((rule, idx) => (
                <li key={idx}>
                  <Typography as="span" variant="desc2" weight="semibold" className="onSurfaceVarColor! font-nunito!">
                    {rule}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <ShareModal
        open={shareModal}
        onClose={setShareModal}
        shareUrl={shareUrl}
        shareText={shareTemplate}
      />
    </ProfileLayout>
  )
}

export default ReferEarn
