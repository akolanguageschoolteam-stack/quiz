"use client"
import { useCallback, useEffect, useState } from 'react'
import LocalizedLink from '@/components/common/LocalizedLink'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from '@/hooks/useTranslation'
import fallbackLogo from '@/assets/Logo.svg'
import { usePathname } from 'next/navigation'
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter'
import { Typography } from '@/components/storybook/atoms/Typography'
import { NewArrow } from '@/components/common/Icons'
import defaultAvatar from '@/assets/avtars/guest.svg'
import ImagePreview from '@/components/storybook/atoms/ImagePreview'
import MobileNav from './MobileNav'
import ThemeToggler from '@/components/common/ThemeToggler'
import AuthModal from '@/components/auth/AuthModal'
import { tokenSelector, profileSelector, setProfile } from '@/redux/reducers/userSlice'
import { setQuizReviewAnswers, setReviewQuizQuestions } from '@/redux/reducers/quizSlice'
import { webSettingsSelector } from '@/redux/reducers/settingsSlice'
import { useUserProfileQuery } from '@/hooks/useUserProfileQuery'



export interface NavItem {
  label: string
  href: string
}

const Header = () => {

  const pathname = usePathname();
  const router = useLocalizedRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const token = useSelector(tokenSelector);
  const profile = useSelector(profileSelector);
  const webSettings = useSelector(webSettingsSelector);
  const logo = webSettings?.header_logo || fallbackLogo;

  const isLoggedIn = !!token
  const userName = typeof profile?.name === 'string' ? profile.name : undefined
  const avatarUrl = typeof profile?.profile === 'string'
    ? profile.profile
    : undefined


  const isHomePage = pathname === '/'
  const isPlayAreaPage = pathname?.includes('/play-area');

  const isLogin = false;

  const [isClient, setIsClient] = useState(false);
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, [])

  const { data: refreshedProfile } = useUserProfileQuery()

  useEffect(() => {
    if (refreshedProfile) dispatch(setProfile(refreshedProfile))
  }, [refreshedProfile, dispatch])


  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    setScrollY(currentScrollY)

    if (currentScrollY <= 0) {
      setIsHeaderVisible(true)
      setLastScrollY(currentScrollY)
      return
    }

    if (currentScrollY < lastScrollY) {
      setIsHeaderVisible(true)
    } else if (currentScrollY > lastScrollY && currentScrollY > 250) {
      setIsHeaderVisible(false)
    }

    setLastScrollY(currentScrollY)
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const navItems: NavItem[] = [
    { label: t('home'), href: `/` },
    { label: t('playArea'), href: `/play-area` },
    { label: t('instruction'), href: `/instruction` },
  ];


  const handleNavItemClick = (href: string) => {
    if (href.includes('play-area')) {
      dispatch(setQuizReviewAnswers(null));
      dispatch(setReviewQuizQuestions(null));
    }
  };


  return (
    isClient &&
    <header className={`py-3 fixed top-0 z-50 w-full transition-all duration-1000 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'} ${isHomePage && scrollY === 0 ? 'bg-transparent border-transparent!' : 'surfaceContainerLowestBg border-b'}`}>
      <div className="container">
        <div className="relative flex items-center justify-between py-3 gap-4">

          {/* Left: Nav */}
          <nav className="hidden lg:flex items-center gap-1 commonBg p-2 rounded-3xl border">
            {navItems.map((item) => (
              <LocalizedLink
                key={item.href}
                href={item.href}
                onClick={() => handleNavItemClick(item.href)}
                className={`between-992-1199:px-3 px-6 py-2 relative overflow-hidden hover:-mt-1 delay-0 transition-all duration-500 after:transition-all after:duration-300 after:absolute after:primaryBg after:h-1.5 after:w-[80%] after:mx-auto after:-bottom-5 after:inset-x-0 hover:after:bottom-0 ${item.href === pathname || (item.href.includes('play-area') && isPlayAreaPage) ? 'primaryBg text-white border-b-4 border-(--primary-600)! rounded-2xl hover:after:-bottom-5! hover:mt-0!' : ''}`}
              >
                {item.label}
              </LocalizedLink>
            ))}
          </nav>

          {/* Center: Logo */}
          <LocalizedLink href='/' className=''>
            <div className='w-27 h-10.5 sm:h-16.25 sm:w-41.25 lg:h-16.25 lg:w-41.25'>
              <ImagePreview src={logo} alt="Elite Quiz" className={`object-contain! ${isHomePage && scrollY === 0 ? 'brightness-0 invert-100' : ''}`} />
            </div>
          </LocalizedLink>

          {/* Right: User + Theme */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <Typography weight='regular' variant='h4' className={` line-clamp-1 w-40`}>
                  {t('hello')} {(isLoggedIn && userName) || t('guest')}
                </Typography>
                {isLoggedIn ?
                  <LocalizedLink href='/profile' className={`font-nunito! font-medium! flex items-center justify-end gap-3 `}>
                    {t('viewProfile')}
                    <NewArrow />
                  </LocalizedLink>
                  :
                  <span
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`font-nunito! font-medium! flex! items-center justify-end gap-2 cursor-pointer`}
                  >
                    {t('loginNow')}
                    <NewArrow />
                  </span>
                }
              </div>
              {/* Avatar */}
              <div
                onClick={() => isLoggedIn ? router.push(`/profile`) : setIsAuthModalOpen(true)}
                className="w-10.5 h-10.5 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 border cursor-pointer"
              >
                <ImagePreview src={isLoggedIn && avatarUrl ? avatarUrl : defaultAvatar} alt='profile' />
              </div>
            </div>

            <div className='lg:hidden'>
              <MobileNav navItems={navItems} />
            </div>
            <div className='hidden lg:block'>
              {/* Theme Toggles */}
              <ThemeToggler />
            </div>
          </div>
          <AuthModal open={isAuthModalOpen} onClose={setIsAuthModalOpen} />
        </div>
      </div>
    </header>
  )
}

export default Header
