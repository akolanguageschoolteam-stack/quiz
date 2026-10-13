'use client'
import { Typography } from '@/components/storybook/atoms/Typography'
import { useTranslation } from '@/hooks/useTranslation'
import { Check, X } from 'lucide-react'
import ProfileLayout from './ProfileLayout'
import { motion } from 'motion/react'
import { itemVariants, listVariants } from '@/lib/motionVariants'
import { useQuery } from '@tanstack/react-query'
import { fetchStatistics } from '@/api/apiRoutes'
import { useEffect } from 'react'
import StatisticsSkeleton from '@/components/skeltons/StatisticsSkeleton'
import LocalizedLink from '@/components/common/LocalizedLink'
import ImagePreview from '@/components/storybook/atoms/ImagePreview'

const CARD_CLASS = 'surfaceContainerLowestBg p-4 sm:p-6 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A]'


const ProgressBar = ({ percent, fillClass = 'onSurfaceBg' }: { percent: number; fillClass?: string }) => (
  <div className="h-full w-full rounded-full primaryFixedBg overflow-hidden">
    <div className={`h-full rounded-full ${fillClass} transition-all duration-500`} style={{ width: `${percent}%` }} />
  </div>
)

const Staticstics = () => {

  const { t } = useTranslation();

  const { data: statisticsData, isLoading, isError, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => (await fetchStatistics()).data,
    staleTime: 5 * 60 * 1000, // 5 min
  })

  useEffect(() => {
    if (isError) {
      console.log("statistics Error => ", error?.message);
    }
  }, [isError]);

  const grandTotal = statisticsData && statisticsData?.grand_total;
  const badges = statisticsData && statisticsData?.badges;
  const battleOverview = statisticsData && statisticsData?.battle;
  const quizStats = statisticsData && statisticsData?.quiz_stats;


  const percentage = battleOverview?.percentage ?? 0;

  const percentageValue = typeof percentage === 'string'
    ? parseFloat(percentage)
    : percentage;

  const degrees = (percentageValue / 100) * 360;

  return (
    <ProfileLayout title={t('statistics')} desc={t('statisticsDesc')}>
      {
        isLoading ?
          <StatisticsSkeleton />
          :
          <motion.div className="flexCol gap-6" variants={listVariants} initial="hidden" animate="show">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flexCol gap-6">
                <motion.div variants={itemVariants} className={`${CARD_CLASS} flexCol gap-6`}>
                  <div>
                    <Typography variant="h4" weight="bold">{t('questionsDetails')}</Typography>
                    <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">
                      {t('totalQuestion')} - <span className="primaryColor font-semibold font-nunito!">{grandTotal?.total_questions}</span>
                    </Typography>
                  </div>
                  <div className="flex items-center flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full successBg flexCenter shrink-0">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="h3" weight="extrabold">{grandTotal?.correct_answered}</Typography>
                        <Typography variant="caption" weight='medium' className="onSurfaceVarColor! font-nunito!">{t('correct')}</Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full errorBg flexCenter shrink-0">
                        <X className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="h3" weight="extrabold">{grandTotal?.wrong_answered}</Typography>
                        <Typography variant="caption" weight='medium' className="onSurfaceVarColor! font-nunito!">{t('incorrect')}</Typography>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="primaryContainerBg rounded-full py-1.5 px-3 shrink-0">
                      <Typography variant="h6" weight="bold" className="primaryColor!">{Math.floor(grandTotal?.percentage || 0)}%</Typography>
                    </div>
                    <ProgressBar percent={Math.floor(grandTotal?.percentage || 0)} fillClass="primaryBg" />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className={`${CARD_CLASS} flexCol gap-6`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Typography variant="h4" weight="bold">{t('earnedBadges')}</Typography>
                      <Typography variant="caption" className=" font-nunito! text-sm!">
                        <span className="primaryColor font-semibold font-nunito!">{badges?.length}</span> - {t('badgesUnlocked')}
                      </Typography>
                    </div>
                    {
                      badges && badges?.length > 3 &&
                      <LocalizedLink href={`/profile-badges`}>
                        <button type="button" className="shrink-0">
                          <Typography variant="caption" weight="semibold" className="onSurfaceVarColor font-nunito! hover:primaryColor transition-all duration-300">
                            {t('viewAll')}
                          </Typography>
                        </button>
                      </LocalizedLink>
                    }
                  </div>
                  {
                    badges && badges?.length > 0 ?
                      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        {badges?.map((badge, idx) => (
                          <div key={idx} className={`relative ${badge?.is_unlocked ? 'primaryBg' : 'bg-[#7E7E7E]'} h-15 w-15`} style={{
                            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'

                          }}>
                            <div className="w-10 h-10 absolute! inset-0 m-auto z-1">
                              <ImagePreview src={badge?.icon} alt={badge?.label} className={` `} />
                            </div>
                          </div>
                        ))}
                      </div>
                      :
                      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        <div className={`relative bg-transparent h-15 w-15`} style={{
                          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'

                        }}>
                        </div>
                      </div>
                  }
                </motion.div>
              </div>

              {/* battle overview */}
              <motion.div variants={itemVariants} className={`${CARD_CLASS} flexCol gap-6 justify-between py-4!`}>
                <div className="flex items-start justify-between gap-3">
                  {/* win loss  */}
                  <div className='flexCol gap-6'>

                    <div>
                      <Typography variant="h4" weight="extrabold">{t('battleOverview')}</Typography>
                      <Typography variant="caption" className="font-nunito!">{t('played')} - {battleOverview?.total_played}</Typography>
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flexCol gap-2">
                        <Typography variant="h5" weight="extrabold" className='fontnu'>{battleOverview?.total_won}</Typography>
                        <div className='flexCenter  gap-2'>
                          <span className="w-2.5 h-2.5 rounded-full primaryBg shrink-0" />
                          <Typography variant="caption" className="onSurfaceVarColor!">{t('totalWon')}</Typography>
                        </div>
                      </div>
                      <div className="flexCol gap-2">
                        <Typography variant="h5" weight="extrabold">{battleOverview?.total_lose}</Typography>
                        <div className='flexCenter  gap-2'>
                          <span className="w-2.5 h-2.5 rounded-full primaryFixedBg shrink-0" />
                          <Typography variant="caption" className="onSurfaceVarColor!">{t('totalLose')}</Typography>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0"
                    style={{ background: `conic-gradient(var(--primary) 0deg ${degrees}deg, var(--primary-100) 1deg 360deg)` }}
                  >
                    <div className="absolute inset-2.5 rounded-full surfaceContainerLowestBg flexColCenter">
                      <Typography variant="h4" weight="extrabold">{battleOverview?.percentage}</Typography>
                      <Typography variant="caption" className="onSurfaceVarColor! text-xs! font-nunito!">{t('accuracy')}</Typography>
                    </div>
                  </div>
                </div>

                <div className="commonBg rounded-2xl p-3 grid grid-cols-3 gap-4">
                  <div>
                    <Typography variant="h6" weight="bold">{t('battle')}</Typography>
                    <Typography variant="caption" className="font-nunito! text-sm!">{t('played')} - {battleOverview?.one_vs_one?.total_played}</Typography>
                  </div>
                  <div className="surfaceContainerLowestBg rounded-xl py-1 px-4 flexCol gap-1">
                    <Typography variant="h5" weight="extrabold">{battleOverview?.one_vs_one?.total_played}</Typography>
                    <Typography variant="caption" className="text-sm! font-nunito!">{t('timeWins')}</Typography>
                  </div>
                  <div className="surfaceContainerLowestBg rounded-xl py-1 px-4 flexCol gap-1">
                    <Typography variant="h5" weight="extrabold">{battleOverview?.one_vs_one?.total_lose}</Typography>
                    <Typography variant="caption" className="text-sm! font-nunito!">{t('timeLose')}</Typography>
                  </div>
                </div>

                <div className="primaryContainerBg rounded-2xl p-4 flexCol gap-4 -mt-2">
                  <div>
                    <Typography variant="h6" weight="bold">{t('groupBattles')}</Typography>
                    <Typography variant="caption" className="font-nunito! text-sm!">{t('played')} - {battleOverview?.group?.total_played}</Typography>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="flexCol">
                      <Typography variant="h6" weight="extrabold" className="">{battleOverview?.group?.rank_1_count}</Typography>
                      <Typography variant="caption" className="primaryColor! text-[10px]! md:text-xs! whitespace-nowrap font-nunito!">
                        1st {t('rank')}
                      </Typography>
                    </div>
                    <div className="flexCol">
                      <Typography variant="h6" weight="extrabold" className="">{battleOverview?.group?.rank_2_count}</Typography>
                      <Typography variant="caption" className="primaryColor! text-[10px]! md:text-xs! whitespace-nowrap font-nunito!">
                        2nd {t('rank')}
                      </Typography>
                    </div>
                    <div className="flexCol">
                      <Typography variant="h6" weight="extrabold" className="">{battleOverview?.group?.rank_3_count}</Typography>
                      <Typography variant="caption" className="primaryColor! text-[10px]! md:text-xs! whitespace-nowrap font-nunito!">
                        3rd {t('rank')}
                      </Typography>
                    </div>
                    <div className="flexCol">
                      <Typography variant="h6" weight="extrabold" className="">{battleOverview?.group?.rank_4_count}</Typography>
                      <Typography variant="caption" className="primaryColor! text-[10px]! md:text-xs! whitespace-nowrap font-nunito!">
                        4th {t('rank')}
                      </Typography>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {quizStats?.map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants} className={`${CARD_CLASS} flexCol gap-4`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Typography variant="h5" weight="bold">{t(stat?.label)}</Typography>
                      <Typography variant="caption" className="text-sm! font-nunito!">
                        {t('played')} - {stat?.total_questions}
                      </Typography>
                    </div>
                    <div className="commonBg rounded-full py-1 px-3 shrink-0">
                      <Typography variant="caption" weight="bold">{Math?.floor(stat?.percentage)}%</Typography>
                    </div>
                  </div>
                  <div className='w-full h-2'>
                    <ProgressBar percent={Math?.floor(stat?.percentage)} />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full successBg shrink-0" />
                      <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{stat?.correct_answered} - {t('correct')}</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full errorBg shrink-0" />
                      <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{stat?.wrong_answered} - {t('incorrect')}</Typography>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
      }
    </ProfileLayout>
  )
}

export default Staticstics
