'use client'
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import SectionInfo from "@/components/storybook/molecules/SectionInfo"
import playWinImg from '@/assets/playArea/playWin.png'
import { Typography } from "@/components/storybook/atoms/Typography"
import { Button } from "@/components/storybook/atoms/Button"
import { useTranslation } from "@/hooks/useTranslation"
import { useIsDark } from "@/hooks/useIsDark"
import { motion } from "motion/react"
import { itemVariants, listVariants } from "@/lib/motionVariants"
import LocalizedLink from "@/components/common/LocalizedLink"
import { useSelector } from "react-redux"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"


interface PlayWinProps {
    isFirstSection?: boolean
}

const PlayWin = ({ isFirstSection = false }: PlayWinProps) => {

    const { t } = useTranslation();
    const isDark = useIsDark();

    const webSettings = useSelector(webSettingsSelector)


    const quizs = [
        {
            img: webSettings?.group_battle_icon ?? playWinImg,
            title: t('groupBattle'),
            desc: t('groupBattleDesc'),
            href: "group-battle",
            isVisible: webSettings?.group_battle_visible_mode == "1" ? true : false,
        },
        {
            img: webSettings?.one_vs_one_battle_icon ?? playWinImg,
            title: t('1Battle'),
            desc: t('1BattleDesc'),
            href: "1-vs-1-battle",
            isVisible: webSettings?.one_vs_one_visible_mode == "1" ? true : false,
        },
        {
            img: webSettings?.random_battle_icon ?? playWinImg,
            title: t('randomBattle'),
            desc: t('randomBattleDesc'),
            href: "random-battle",
            isVisible: webSettings?.random_battle_visible_mode == "1" ? true : false,
        },
    ];

    return (
        <section className={`${isDark ? 'onPrimaryBg' : 'bg-linear-to-b from-(--neutral-100) to-(--neutral-50) '} ${isFirstSection ? 'pb-6 md:pb-12 lg:pb-20' : 'commonPY commonMT'}`}>
            <div className="container commonTextContentGap">

                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <SectionInfo title={t('playWinUltimateBattles')} />
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={listVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {
                        quizs?.filter((quiz) => quiz?.isVisible == true)?.map((quiz, idx) => {
                            return <motion.div key={idx} variants={itemVariants} className='surfaceContainerLowestBg rounded-2xl lg:rounded-[42px] commonBorderB border border-[2px] lg:border p-4 lg:p-8 flexCol gap-6 h-full group hover:primaryBorder transition-all duration-500 hover:border-b-1!'>
                                <div className='w-auto h-77.5 sm:h-88.75 aspect-355/355'>
                                    <ImagePreview src={quiz?.img} alt='playWin' className='rounded-[32px]' />
                                </div>
                                <div className='flexCol gap-4'>
                                    <Typography variant='h2' weight='regular' className="lg:text-4xl! line-clamp-1">
                                        {quiz?.title}
                                    </Typography>
                                    <Typography variant='h4' weight='regular' className='font-nunito! onSurfaceVarColor! line-clamp-2'>
                                        {quiz?.desc}
                                    </Typography>

                                    <div>
                                        <LocalizedLink href={`/play-area/${quiz.href}`}>
                                            <Button variant='secondary' hover className="max-sm:w-full">
                                                {t('playNow')}
                                            </Button>
                                        </LocalizedLink>
                                    </div>
                                </div>
                            </motion.div>
                        })
                    }

                </motion.div>

            </div>
        </section>
    )
}

export default PlayWin