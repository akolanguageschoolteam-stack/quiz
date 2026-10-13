'use client'
import { useState } from "react"
import Layout from "@/components/layout/Layout"
import { Breadcrumb } from "@/components/storybook/molecules/Breadcrumb"
import SectionInfo from "@/components/storybook/molecules/SectionInfo"
import { Button } from "@/components/storybook/atoms/Button"
import { useTranslation } from "@/hooks/useTranslation"
import groupBattleImg from '@/assets/groupBattle.svg'
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import { useIsMobile } from "@/hooks/useMobile"
import { useIsDark } from "@/hooks/useIsDark"
import CreateRoom from "@/components/common/CreateRoom"
import JoinRoom from "@/components/common/JoinRoom"
import BattleRules from "@/components/common/BattleRules"
import { AnimatePresence, motion } from "motion/react"
import { useSelector } from "react-redux"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"

type RoomTab = 'create' | 'join'

const stepTransition = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const GroupBattle = () => {

    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const isDark = useIsDark();

    const webSettings = useSelector(webSettingsSelector)

    const [activeTab, setActiveTab] = useState<RoomTab>('create');

    return (
        <Layout>
            <Breadcrumb firstElement={t('playArea')} secondElement={t('groupBattle')} />
            <section className={`commonPY ${isMobile ? isDark ? 'onPrimaryBg' : 'bg-linear-to-b from-(--neutral-50) to-(--primary-100)' : 'surfaceContainerLowestBg'}`}>
                <div className="container commonTextContentGap">
                    <div className="flex items-center justify-center sm:justify-between flex-wrap gap-4">
                        <div className="max-md:mx-auto">
                            <SectionInfo title={t('groupBattle')} isCenter={false} />
                        </div>
                        <div className="flexCenter md:justify-end">
                            <div className="commonBg rounded-3xl p-2 inline-flex border gap-1">
                                <Button
                                    type="button"

                                    variant={activeTab === 'create' ? 'secondary' : 'outline'}
                                    className={activeTab === 'create' ? 'px-6! border-none! shadow-none!' : 'px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('create')}
                                >
                                    {t('createRoom')}
                                </Button>
                                <Button
                                    type="button"

                                    variant={activeTab === 'join' ? 'secondary' : 'outline'}
                                    className={activeTab === 'join' ? 'px-6! border-none! shadow-none!' : 'px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('join')}
                                >
                                    {t('joinRoom')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 md:gap-10">
                        <div className="col-span-12 md:col-span-6 lg:col-span-5">
                            <div className="w-auto h-auto">
                                <ImagePreview src={webSettings?.group_battle_icon ?? groupBattleImg} alt='groupBattleImg' />
                            </div>
                        </div>
                        <div className={`col-span-12 md:col-span-6 lg:col-span-7 md:commonBg rounded-[32px] sm:p-6 overflow-hidden ${activeTab === 'join' ? 'flexCenter' : ''}`}>
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} {...stepTransition}>
                                    {activeTab === 'create' ? <CreateRoom mode="group" /> : <JoinRoom mode="group" />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <BattleRules mode="group_battle" />
                </div>
            </section>
        </Layout>
    )
}

export default GroupBattle