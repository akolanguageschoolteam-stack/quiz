import ImagePreview from '@/components/storybook/atoms/ImagePreview'
import { Typography } from '@/components/storybook/atoms/Typography'
import { Button } from '@/components/storybook/atoms/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { EliteWinner, NewArrow, PremiumCoin, Reward, Wallet, ShareIcon, BookmarkIcon, NotificationIcon, CoinHistoryIcon, SettingIcon } from '@/components/common/Icons'
import IconLabel from '@/components/storybook/atoms/IconLabel'
import { usePathname } from 'next/navigation'
import { Pencil } from 'lucide-react'
import LocalizedLink from '@/components/common/LocalizedLink'
import referImg from '@/assets/profileSidebarImg.png'
import { useIsMobile } from '@/hooks/useMobile'
import { useEffect, useState } from 'react'
import CompleteProfileModal from '@/components/modals/CompleteProfileModal'
import AuthModal from '@/components/auth/AuthModal'
import LoginRequiredModal from '@/components/auth/LoginRequiredModal'
import { useSelector } from 'react-redux'
import { profileSelector } from '@/redux/reducers/userSlice'
import ProfileSidebarSkeleton from '@/components/skeltons/ProfileSidebarSkeleton'
import { formatCoins } from '@/lib/helper'


const ProfileSidebar = () => {

  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const userData = useSelector(profileSelector);

  const tabs = [
    {
      icon: <Wallet />,
      label: t('myWallet'),
      href: `/profile/my-wallet`,
      guestRestricted: true
    },
    {
      icon: <ShareIcon />,
      label: t('statistics'),
      href: `${isMobile ? `/profile/statistics` : `/profile`}`
    },
    {
      icon: <BookmarkIcon />,
      label: t('bookmark'),
      href: `/profile/bookmark`
    },
    {
      icon: <NotificationIcon />,
      label: t('notifications'),
      href: `/profile/notifications`
    },
    {
      icon: <CoinHistoryIcon />,
      label: t('coinsHistory'),
      href: `/profile/coins-history`
    },
    {
      icon: <SettingIcon />,
      label: t('settings'),
      href: `/profile/settings`
    }
  ]

  const [editProfileModal, setEditProfileModal] = useState(false)
  const [connectAccountModal, setConnectAccountModal] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false)
  const isLoading = !userData
  const isGuest = userData?.type === 'guest'

  // My Wallet, My Badges and Refer & Earn all need a real account — a guest never has
  // access, independent of any quiz_zone-style guest_mode setting.
  const handleGuestRestrictedClick = (e: React.MouseEvent) => {
    if (!isGuest) return
    e.preventDefault()
    setLoginRequiredOpen(true)
  }

  return (
    <div className='flexCol gap-6 max-1199:relative! min-1200:sticky max-1199:top-0 min-1200:top-30 max-lg:container! max-lg:commonPY! overflow-x-hidden'>
      <div className="between-576-767:hidden md:hidden primaryContainerBg h-[20%] absolute top-0 w-[120%] -left-12">

      </div>
      <div className='flexCol gap-6 surfaceContainerLowestBg max-1199:p-4 p-6 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A] relative z-1'>
        {isLoading ? (
          <ProfileSidebarSkeleton />
        ) : (
          <>
            <div className='grid max-md:grid-cols-1! max-1199:grid-cols-2 lg:grid-cols-1 gap-6'>
              {/* profile  */}
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 sm:w-25 sm:h-25 rounded-full overflow-hidden shrink-0">
                  <ImagePreview src={userData?.profile} alt={'Naomi Nakayam'} rounded="full" />
                </div>
                <div className="flexCol gap-1 min-w-0">
                  <Typography variant="h3" weight="semibold" className="line-clamp-1">
                    {userData?.name}
                  </Typography>
                  <Typography variant="caption" weight="semibold" className="line-clamp-2 font-nunito! onSurfaceVarColor! break-all">
                    {userData?.email}
                  </Typography>
                  {isGuest ? (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setConnectAccountModal(true)}
                        className="primaryContainerBg rounded-full px-5 py-2 cursor-pointer"
                      >
                        <Typography variant="h6" weight="bold" className="primaryColor!">
                          {t('connectAccountNow')}
                        </Typography>
                      </button>
                      <button
                        type="button"
                        aria-label={t('editProfile')}
                        onClick={() => setEditProfileModal(true)}
                        className="w-9 h-9 shrink-0 rounded-full surfaceContainerLowBg flexCenter cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button variant='secondaryShade' size='sm' className='rounded-full mt-2 border-b-2!' onClick={() => setEditProfileModal(true)}>
                      {t('editProfile')}
                    </Button>
                  )}
                </div>
              </div>
              {/* coins rewards */}
              <div className='grid grid-cols-2 gap-6'>
                <LocalizedLink href={`/profile/coins-history`}>
                  <div className='warningContainerBg p-2 rounded-2xl flex items-center gap-3 max-1199:h-max'>
                    <PremiumCoin className='mt-1' />
                    <div className='flexCol gap-1'>
                      <Typography variant='h3' weight='extrabold'>
                        {formatCoins(userData?.total_coins || 0)}
                      </Typography>
                      <Typography variant="caption" weight="semibold" className="line-clamp-1 font-nunito! onSurfaceVarColor!">
                        {t('coins')}
                      </Typography>
                    </div>
                  </div>
                </LocalizedLink>

                <LocalizedLink href={`/profile/rewards`}>
                  <div className='blueContainerBg p-2 rounded-2xl flex items-center gap-3 max-1199:h-max'>
                    <Reward />
                    <div className='flexCol gap-1'>
                      <Typography variant='h3' weight='extrabold'>
                        {userData?.unclaimed_rewards_count || 0}
                      </Typography>
                      <Typography variant="caption" weight="semibold" className="line-clamp-1 font-nunito! onSurfaceVarColor!">
                        {t('rewards')}
                      </Typography>
                    </div>
                  </div>
                </LocalizedLink>
              </div>
            </div>
            {/* bages  */}
            <div className='max-1199:hidden! lg:flex items-center justify-between'>
              <Typography variant="h4" weight="semibold" className="line-clamp-1">
                {t('myBadges')}
              </Typography>
              <div className='flex items-center flex-wrap gap-2'>
                <div className='flex items-center -space-x-3'>
                  <EliteWinner width={36} height={42} />
                  <EliteWinner width={36} height={42} />
                  <EliteWinner width={36} height={42} />
                </div>
                <LocalizedLink href={`/profile/my-badges`} onClick={handleGuestRestrictedClick}>
                  <Typography variant="caption" weight="semibold" className="line-clamp-1 font-nunito!">
                    +5 {t('more')}
                  </Typography>
                </LocalizedLink>
              </div>
            </div>
          </>
        )}
        {/* tabs mobile,tabs mid screen */}
        <div className='max-md:hidden! max-1199:block hidden commonBg py-2 px-3 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A] overflow-x-auto customScrollbar'>
          <div className='grid grid-rows-1 grid-flow-col w-max gap-3'>
            {
              tabs.map((tab, idx) => (
                <LocalizedLink
                  key={idx}
                  href={tab.href}
                  onClick={tab.guestRestricted ? handleGuestRestrictedClick : undefined}
                  className={`flex items-center justify-between rounded-xl py-2 px-4 ${pathname === tab.href ? 'onSurfaceBg text-white dark:text-black' : ''}`}
                >
                  {tab.label}
                </LocalizedLink>
              ))
            }
          </div>
        </div>
      </div>

      {/* refer now  */}
      <div className='surfaceContainerLowestBg p-4 sm:p-6 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A] flex items-center justify-between gap-3 commonBorderB'>
        <div className="flexCol gap-3 min-w-0">
          <Typography variant="h4" weight="bold" className="line-clamp-1">{t('referAndEarn')}</Typography>
          <Typography variant="caption" weight='medium' className="onSurfaceVarColor! font-nunito!">{t('referAndEarnDesc')}</Typography>
          <LocalizedLink href={`/profile/refer-earn`} onClick={handleGuestRestrictedClick}>
            <Button type="button" variant="primary" className="" size='md'>
              {t('referNow')}
            </Button>
          </LocalizedLink>
        </div>
        <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0">
          <ImagePreview src={referImg} alt={t('referAndEarn')} objectFit="contain" containerClassName="w-full h-full" />
        </div>
      </div>

      {/* tabs  desktop */}
      <div className='max-md:flexCol! max-1199:hidden flexCol gap-4 surfaceContainerLowestBg p-4 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A]'>
        {
          tabs.map((tab, idx) => (
            <LocalizedLink
              key={idx}
              href={tab.href}
              onClick={tab.guestRestricted ? handleGuestRestrictedClick : undefined}
              className={`flex items-center justify-between rounded-2xl p-4 ${pathname === tab.href ? 'primaryContainerBg rounded-none' : 'commonBg '}`}
            >
              <IconLabel icon={tab.icon} label={tab.label} className={`${pathname === tab.href ? '[&>svg]:primaryColor! dark:[&_svg_path]:fill-white! dark:[&_svg_path]:fill-white!' : ''}`} />
              <NewArrow width={18} height={18} className={`${pathname === tab.href ? 'fill-primary!' : ''}`} />
            </LocalizedLink>
          ))
        }
      </div>
      <CompleteProfileModal open={editProfileModal} onClose={setEditProfileModal} isEditProfile={true} />
      <AuthModal open={connectAccountModal} onClose={setConnectAccountModal} initialView='register' />
      <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
      <LoginRequiredModal
        open={loginRequiredOpen}
        onClose={setLoginRequiredOpen}
        onGuestClick={() => setLoginRequiredOpen(false)}
        onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
      />
    </div>
  )
}

export default ProfileSidebar