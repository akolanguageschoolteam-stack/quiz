'use client'
import { Button } from "@/components/storybook/atoms/Button"
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import { Typography } from "@/components/storybook/atoms/Typography"
import { useTranslation } from "@/hooks/useTranslation"
import appPreview from '@/assets/homePage/appImg.png'
import startQuizImg from '@/assets/homePage/startQuiz.svg'
import logo from '@/assets/Logo.svg'
import appStore from '@/assets/homePage/appstore.png'
import playStore from '@/assets/homePage/playsotre.png'
import Link from "next/link"
import ThemeSvg from "@/components/common/ThemeSvg"
import { useIsDark } from "@/hooks/useIsDark"
import { motion } from "motion/react"
import { itemVariants, listVariants } from "@/lib/motionVariants"
import { useSelector } from "react-redux"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"


const StartQuiz = () => {

    const { t } = useTranslation();
    const isDark = useIsDark();
    const router = useLocalizedRouter();

    const webSettings = useSelector(webSettingsSelector);

    if (!webSettings?.ios_app_link && !webSettings?.app_link) {
        return null;
    }

    return (
        <section className={`relative ${isDark ? 'onPrimaryBg' : 'bg-linear-to-b from-(--primary-100) to-(--neutral-50)'} commonPT`}>
            <div
                className="absolute inset-0 pointer-events-none h-[35%] w-1/2 z-1 hidden lg:block"
                style={{
                    backgroundImage: `repeating-linear-gradient(var(--primary) 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, var(--primary) 0 1px, transparent 1px 100%)`,
                    backgroundSize: '32px 32px',
                    opacity: 0.2,
                }}
            />
            <div
                className="absolute right-0 top-[30%] pointer-events-none h-[35%] w-[35%] rotate-180 z-1 hidden lg:block"
                style={{
                    backgroundImage: `repeating-linear-gradient(var(--primary) 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, var(--primary) 0 1px, transparent 1px 100%)`,
                    backgroundSize: '32px 32px',
                    opacity: 0.2,
                }}
            />
            <div className="container commonTextContentGap relative z-2">
                <motion.div
                    className="flex flex-col gap-10 md:items-center md:justify-center sm:w-[80%] md:w-[60%] lg:w-[70%] min-1800:w-[68%]! mx-auto text-center"
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <Typography variant="h2" weight={"medium"} className={`text-2xl! md:text-4xl! lg:text-6xl!`}>
                        {t('startYour')}
                        <ThemeSvg src={startQuizImg} className="w-auto h-24! mx-4 -mt-10 rtl:-mt-22 max-lg:hidden!" />
                        {t('quizImproveLearning')}
                    </Typography>
                    <Button variant="primary" className="w-max! mx-auto!" onClick={() => router.push(`/play-area`)}>
                        {t('exploreNow')}
                    </Button>
                </motion.div>
                <div className="primaryBg rounded-3xl md:rounded-[48px] lg:rounded-[64px] p-8 md:p-10 lg:p-14 relative overflow-hidden">
                    <div className="absolute right-[-16%] top-[-52%] bg-white/10 rounded-full w-162.5 h-162.5 hidden lg:block" />
                    <div className="absolute right-[10%] bottom-[-66%] bg-white/10 rounded-full w-162.5 h-162.5 hidden lg:block" />
                    <motion.div
                        className="flexCenter"
                        variants={listVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <motion.div variants={itemVariants} className="flexCenter lg:flex flex-col gap-6 lg:gap-10 lg:pb-14">
                            <div className="w-25.5 h-10 md:w-50.75 md:h-20 lg:w-63.5 lg:h-25">
                                <ImagePreview src={logo} alt="Elite Quiz" className='brightness-0 invert-100' />
                            </div>
                            <div className="flex flex-col gap-3 lg:gap-6 text-center">
                                <Typography variant="h2" weight="bold" className="text-2xl! md:text-4xl! lg:text-6xl! text-white flex gap-3">
                                    <span>{t('download')}</span>
                                    <span>{webSettings?.app_name}</span>
                                </Typography>
                                <Typography variant="h3" className="text-white font-nunito!">
                                    {webSettings?.shareapp_text}
                                </Typography>
                            </div>
                            <div className="flexCenter flex-wrap gap-3 lg:gap-4">
                                <Link href={webSettings?.ios_app_link || '#'} target="_blank" rel="noopener noreferrer" className="block h-10 md:h-12 lg:h-14">
                                    <ImagePreview src={appStore} alt="App Store" objectFit="contain" />
                                </Link>
                                <Link href={webSettings?.app_link || '#'} target="_blank" rel="noopener noreferrer" className="block h-10 md:h-12 lg:h-14">
                                    <ImagePreview src={playStore} alt="Google Play" objectFit="contain" />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default StartQuiz