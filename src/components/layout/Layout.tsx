'use client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import Header from './header/Header'
import Footer from './Footer'
import { generateColorPalette, TailwindPalette } from '@/utils/colorShades';
import LanguageModal from '../modals/LanguageModal';
import { fetchContentTypes, fetchLanguages, fetchTranslations, fetchWebSettings } from '@/api/apiRoutes'
import { useUserProfileQuery } from '@/hooks/useUserProfileQuery';
import { setWebSettings } from '@/redux/reducers/settingsSlice';
import { languagesSelector, promptSystemLanguageSelector, setContentTypes, setLanguages, setPromptSystemLanguage, setTranslations, systemLanguageCodeSelector } from '@/redux/reducers/languageSlice';
import { setProfile, tokenSelector } from '@/redux/reducers/userSlice';
import { isDarkThemeSelector } from '@/redux/reducers/themeSlice';
import { firebaseAuth } from '@/lib/firebase';
import { sweepUserBattleRooms } from '@/hooks/useBattleRoom';
import EmptyStatus from '../common/EmptyStatus';
import PageLoader from '../common/PageLoader';
import { useTranslation } from '@/hooks/useTranslation'

const SHADE_LEVELS: (keyof TailwindPalette)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];


let hasSweptBattleRoomsThisLoad = false;

const applyPalette = (prefix: string, hex: string) => {
  const palette = generateColorPalette(hex);
  document.documentElement.style.setProperty(`--${prefix}`, palette[500]);
  SHADE_LEVELS.forEach((n) => {
    document.documentElement.style.setProperty(`--${prefix}-${n}`, palette[n]);
  });
};

const Layout = ({ children }: { children: React.ReactNode }) => {

  const { t } = useTranslation();

  const [languageModal, setLanguageModal] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const languages = useSelector(languagesSelector)
  const systemLanguageCode = useSelector(systemLanguageCodeSelector)
  const isLoggedIn = !!useSelector(tokenSelector)
  const queryClient = useQueryClient()
  const promptSystemLanguage = useSelector(promptSystemLanguageSelector)
  const isDark = useSelector(isDarkThemeSelector)

  const { data: webSettings, isError: isWebSettingsError, isLoading: isWebSettingsLoading } = useQuery({
    queryKey: ['webSettings'],
    queryFn: async () => (await fetchWebSettings()).data,
    staleTime: 5 * 60 * 1000, // 5 min — settings can be edited in admin panel any time
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (webSettings) {
      dispatch(setWebSettings(webSettings))
    }
  }, [webSettings, dispatch]);

  const maintenanceMode = webSettings?.web_maintenance_mode === '1'

  const { data: fetchedLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => (await fetchLanguages()).data,
    staleTime: 60 * 60 * 1000, 
  })

  useEffect(() => {
    if (fetchedLanguages) {
      dispatch(setLanguages(fetchedLanguages))
    }
  }, [fetchedLanguages, dispatch]);

  const { data: fetchedContentTypes } = useQuery({
    queryKey: ['contentTypes'],
    queryFn: async () => (await fetchContentTypes()).data,
    staleTime: 60 * 60 * 1000,
  })

  useEffect(() => {
    if (fetchedContentTypes) {
      dispatch(setContentTypes(fetchedContentTypes))
    }
  }, [fetchedContentTypes, dispatch]);

  const { data: fetchedTranslations } = useQuery({
    queryKey: ['translations', systemLanguageCode],
    queryFn: async () => (await fetchTranslations(systemLanguageCode)).data,
    staleTime: 60 * 60 * 1000, // 1 hour — translations rarely change
  })

  useEffect(() => {
    if (fetchedTranslations) {
      dispatch(setTranslations(fetchedTranslations))
    }
  }, [fetchedTranslations, dispatch]);

  const { data: refreshedProfile } = useUserProfileQuery()

  useEffect(() => {
    if (!isLoggedIn) {
      queryClient.removeQueries({ queryKey: ['userProfile'] })
      return
    }
    if (refreshedProfile) {
      dispatch(setProfile(refreshedProfile))
    }
  }, [refreshedProfile, isLoggedIn, dispatch, queryClient]);

  useEffect(() => {
    if (promptSystemLanguage) setLanguageModal(true)
  }, [promptSystemLanguage]);

  useEffect(() => {
    if (!isLoggedIn) return
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user || hasSweptBattleRoomsThisLoad) return
      const isBattleReviewMode = searchParams?.get('review') === '1'
      const onLiveBattlePlayPage = !isBattleReviewMode
        && /\/play-area\/(1-vs-1-battle|group-battle|random-battle)\/play(\/|$|\?)/.test(pathname ?? '')
      if (onLiveBattlePlayPage) return
      hasSweptBattleRoomsThisLoad = true
      sweepUserBattleRooms(user.uid).catch(() => { })
    })
    return unsubscribe
  }, [isLoggedIn, pathname, searchParams]);

  useEffect(() => {
    const activeLanguage = languages.find((language) => language.code === systemLanguageCode)
    document.documentElement.lang = systemLanguageCode
    document.documentElement.dir = activeLanguage?.is_rtl ? 'rtl' : 'ltr'
  }, [languages, systemLanguageCode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark]);

  useEffect(() => {
    document.documentElement.style.setProperty('--loader', process.env.NEXT_PUBLIC_LOADER_COLOR || '#1A73E8');
    applyPalette('primary', webSettings?.theme_primary_color || "#EF5388");
    applyPalette('neutral', webSettings?.web_neutral_color || '#BCBCBC');
    applyPalette('success', '#10B981');
    applyPalette('error', '#FB2C36');
    applyPalette('warning', '#F59E0B');
    applyPalette('orange', '#FF5722');
    applyPalette('purple', '#8B5DFF');
    applyPalette('blue', '#3B82F6');
    document.documentElement.style.setProperty('--secondary', '#010211');
  }, [webSettings]);

  // Dynamic favicon from admin (Brand & Web Settings → Favicon Logo)
  useEffect(() => {
    const icon = (webSettings as any)?.favicon_logo as string | undefined;
    if (!icon || typeof document === 'undefined') return;
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (link.href !== icon) link.href = icon;
  }, [webSettings]);

  if (isWebSettingsLoading) {
    return <PageLoader />
  }


  if (isWebSettingsError) {
    return <EmptyStatus type="somethingWentWrong" title={t('somethingWentWrong')} description={t('somethingWentWrongDesc')} />
  }
  if (maintenanceMode) {
    return <EmptyStatus type="maintenanceMode" />
  }

  return (
    <>
      <Header />
      <main className="headerPT">
        {children}
      </main>
      {/* {
        cookiesMode &&
        <CookiesComponent />
      } */}
      <LanguageModal
        open={languageModal}
        onClose={(open) => {
          setLanguageModal(open)
          if (!open && promptSystemLanguage) {
            dispatch(setPromptSystemLanguage(false))
            router.push('/')
          }
        }}
      />
      <Footer />
    </>
  )
}

export default Layout