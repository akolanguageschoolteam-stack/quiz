'use client'

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSelector } from "react-redux"
import Layout from "@/components/layout/Layout"
import { Breadcrumb } from "@/components/storybook/molecules/Breadcrumb"
import SectionInfo from "@/components/storybook/molecules/SectionInfo"
import { Button } from "@/components/storybook/atoms/Button"
import { useTranslation } from "@/hooks/useTranslation"
import OneVsOneImg from '@/assets/OneVsOne.svg'
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import { useIsMobile } from "@/hooks/useMobile"
import { useIsDark } from "@/hooks/useIsDark"
import { AnimatePresence, motion } from "motion/react"
import { Typography } from "@/components/storybook/atoms/Typography"
import { CategoryType } from "@/types/GlobalTypes"
import { CategoryCard } from "@/components/storybook/molecules/categoryCard"
import { toast } from "@/lib/toast"
import { PremiumCoin } from "@/components/common/Icons"
import SearchOpponentModal from "./SearchOpponentModal"
import BattleRules from "@/components/common/BattleRules"
import { categoriesQueryOptions } from "@/api/queries/categories"
import { mapCategoryInterfaceToCategoryType } from "@/lib/categoryMapper"
import { QuizType } from "@/lib/constants"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import CategoryCardHorizontalSkeleton from "@/components/skeltons/CategoryCardHorizontalSkeleton"
import { profileSelector } from "@/redux/reducers/userSlice"
import AuthModal from "@/components/auth/AuthModal"
import LoginRequiredModal from "@/components/auth/LoginRequiredModal"
import { useAuthGate } from "@/hooks/useAuthGate"

const stepTransition = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const RandomBattle = () => {

    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const isDark = useIsDark();
    const webSettings = useSelector(webSettingsSelector);
    const profile = useSelector(profileSelector);
    const coins = typeof profile?.total_coins === 'number' ? profile.total_coins : 0;

    const isCategoryModeEnabled = webSettings?.random_battle_category_mode === '1';
    const entryFee = Number(webSettings?.random_battle_entry_coin) || 0;

    const { data, isLoading } = useQuery({
        ...categoriesQueryOptions(QuizType.QuizZone),
        enabled: isCategoryModeEnabled,
    });
    const categories: CategoryType[] = (data?.data?.categories ?? [])
        .map(mapCategoryInterfaceToCategoryType);

    const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
    const [opponentModal, setOpponentModal] = useState(false)
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, guardPlay } = useAuthGate()

    const handleSearchOpponent = () => {
        if (!guardPlay('random_battle_guest_mode')) return;
        if (isCategoryModeEnabled && !activeCategory) {
            toast.error(t('somethingWentWrong'));
            return;
        }
        if (entryFee > coins) {
            toast.error(t('notEnoughCoinsForEntry'));
            return;
        }
        setOpponentModal(true)
    }

    return (
        <Layout>
            <Breadcrumb firstElement={t('playArea')} secondElement={t('randomBattle')} />
            <section className={`commonPY ${isMobile ? isDark ? 'onPrimaryBg' : 'bg-linear-to-b from-(--neutral-50) to-(--primary-100)' : 'surfaceContainerLowestBg'}`}>
                <div className="container commonTextContentGap">
                    <div className="flex items-center justify-center sm:justify-between flex-wrap gap-4">
                        <div className="max-md:mx-auto">
                            <SectionInfo title={t('randomBattle')} isCenter={false} />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 md:gap-10">
                        <div className="col-span-12 md:col-span-6 lg:col-span-5">
                            <div className="w-auto h-auto">
                                <ImagePreview src={webSettings?.random_battle_icon ?? OneVsOneImg} alt='OneVsOneImg' />
                            </div>
                        </div>
                        <div className={`col-span-12 md:col-span-6 lg:col-span-7 md:commonBg rounded-[32px] sm:p-6 overflow-hidden`}>
                            <AnimatePresence mode="wait">
                                <motion.div {...stepTransition}>
                                    <div className="flexCol gap-6">
                                        <div className='flex flex-col gap-3 mt-4'>
                                            <Typography variant='h2' weight='medium' className='line-clamp-1'>
                                                {t('createRoom')}
                                            </Typography>
                                            <Typography variant='subtitle2' weight='regular' className='onSurfaceVarColor! font-nunito! line-clamp-2'>
                                                {t('createRoomDesc')}
                                            </Typography>
                                        </div>

                                        {/* categories  */}
                                        {isCategoryModeEnabled && (
                                            <div className="max-h-108 customScrollbar overflow-y-auto flexCol gap-2">
                                                {isLoading
                                                    ? Array.from({ length: 5 }).map((_, idx) => (
                                                        <div key={idx} className="w-full [&>div]:w-full">
                                                            <CategoryCardHorizontalSkeleton />
                                                        </div>
                                                    ))
                                                    :
                                                    categories?.map((cate, idx) => (
                                                        <div key={idx} className="w-full [&>div]:w-full">
                                                            <CategoryCard category={cate} onClick={() => setActiveCategory(cate)} horizontalCard={true} isSelected={activeCategory?.id === cate.id} guestModeKey="random_battle_guest_mode" />
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )}

                                        <div>
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                onClick={handleSearchOpponent}
                                                disabled={isCategoryModeEnabled && !activeCategory}
                                                leftIcon={<PremiumCoin width={20} height={20} className="mt-2" />}
                                            >
                                                - {entryFee} {t('startPlaying')}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <BattleRules mode="random_battle" />
                </div>
                <SearchOpponentModal
                    open={opponentModal}
                    onClose={setOpponentModal}
                    category={activeCategory}
                    entryFee={entryFee}
                />
                <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
                <LoginRequiredModal
                    open={loginRequiredOpen}
                    onClose={setLoginRequiredOpen}
                    onGuestClick={() => setLoginRequiredOpen(false)}
                    onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
                />

            </section>
        </Layout>
    )
}

export default RandomBattle