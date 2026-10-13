'use client'
import { PlayAreaFlash, Trophy } from '@/components/common/Icons';
import ImagePreview from '@/components/storybook/atoms/ImagePreview'
import { Typography } from '@/components/storybook/atoms/Typography'
import { useTranslation } from '@/hooks/useTranslation';
import ultimateZone from '@/assets/playArea/ultimateZone.png'
import { Button } from '@/components/storybook/atoms/Button';
import { useQueryClient } from '@tanstack/react-query';
import { categoriesQueryOptions } from '@/api/queries/categories';
import { QuizType, getSlugFromModuleType } from '@/lib/constants'
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTitle } from '@/redux/reducers/quizSlice';
import LocalizedLink from '@/components/common/LocalizedLink';
import { profileSelector, tokenSelector } from '@/redux/reducers/userSlice';
import { useIsMobile } from '@/hooks/useMobile';
import AuthModal from '@/components/auth/AuthModal';
import LoginRequiredModal from '@/components/auth/LoginRequiredModal';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { itemVariants, listVariants } from '@/lib/motionVariants';
import { webSettingsSelector } from '@/redux/reducers/settingsSlice';
import { HorizontalCard } from '@/components/storybook/molecules/horizontalCard';
import { VerticalCard } from '@/components/storybook/molecules/verticalCard';
import type { StaticImageData } from 'next/image';
import { quizQuestionsQueryOptions } from '@/api/queries/questions';
import { getContentTypeId } from '@/api/apiMiddleware';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/utils/errorMessages';

const MotionLink = motion.create(LocalizedLink);

const getMsUntilNextUtcMidnight = () => {
    const now = new Date();
    const nextUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
    return nextUtcMidnight - now.getTime();
};

const formatCountdown = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs].map((unit) => String(unit).padStart(2, '0')).join(':');
};

interface QuizCardItem {
    img: string;
    title: string;
    desc: string;
    bg: string;
    href: string;
}

interface DailyQuizCardItem {
    img: string | StaticImageData;
    title: string;
    desc: string;
    btnLabel: string;
    href: string;
    isVisible?: boolean;
}

interface PlayLearnProps {
    quizs: QuizCardItem[];
    dailyQuizContestQuiz: DailyQuizCardItem[];
    isExamAndSelfChallengeMode: boolean;
    isExamOrSelfChallengeMode: boolean
}

const PlayLearn = ({ quizs, dailyQuizContestQuiz, isExamAndSelfChallengeMode, isExamOrSelfChallengeMode }: PlayLearnProps) => {

    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();
    const isMobile = useIsMobile();

    const userData = useSelector(profileSelector)
    const token = useSelector(tokenSelector);
    const isLoggedIn = !!token;
    const webSettings = useSelector(webSettingsSelector);
    const isQuizZoneVisible = webSettings?.quiz_zone_visible_mode === '1';

    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, guardPlay } = useAuthGate();
    const hasPlayedDailyQuiz = !!userData?.has_played_daily_quiz;
    const [dailyQuizCountdownMs, setDailyQuizCountdownMs] = useState(() => getMsUntilNextUtcMidnight());
    const [checkingDailyQuiz, setCheckingDailyQuiz] = useState(false);



    useEffect(() => {
        if (!hasPlayedDailyQuiz) return;
        const interval = setInterval(() => {
            setDailyQuizCountdownMs(getMsUntilNextUtcMidnight());
        }, 1000);
        return () => clearInterval(interval);
    }, [hasPlayedDailyQuiz]);

    const visibleDailyQuizContestQuiz = dailyQuizContestQuiz?.filter((quiz) => quiz.isVisible !== false);
    const hasLeftContent = isLoggedIn || isExamOrSelfChallengeMode || visibleDailyQuizContestQuiz.length > 0;

    if (!hasLeftContent && !isQuizZoneVisible) return null;

    const showDailyQuizTitleAndBorder = (visibleDailyQuizContestQuiz?.length === 1 || !isLoggedIn) && !(visibleDailyQuizContestQuiz?.length === 1 && !isQuizZoneVisible);
    const showExamSelfChallengeTitleAndBorder = !(!isExamAndSelfChallengeMode && !isQuizZoneVisible);

    const userRankScore = [
        {
            img: <Trophy className='w-9.5 h-9.5 lg:h-13 lg:w-14' />,
            title: t('yourRank'),
            desc: String(userData?.all_time_rank ?? 0),
            bg: "primaryBgWithBorderShadow",
            href: "leaderboard"
        },
        {
            img: <PlayAreaFlash className='w-9.5 h-9.5 lg:h-13 lg:w-13 dark:[&_path]:fill-black!' />,
            title: t('totalScore'),
            desc: String(userData?.all_time_score ?? 0),
            bg: "secondaryBgWithBorderShadow",
            href: "profile/statistics"

        },
    ];

    const handlePlayNow = async () => {
        const moduleType = QuizType.QuizZone;
        await queryClient.fetchQuery(categoriesQueryOptions(moduleType));
        dispatch(setSelectedTitle(t('ultimateQuizZone')));
        router.push(`/play-area/${getSlugFromModuleType(moduleType)}`);
    }

    const handleDailyQuizPlay = async () => {
        if (checkingDailyQuiz) return;

        try {
            setCheckingDailyQuiz(true);
            const contentTypeId = getContentTypeId();
            const payload = contentTypeId != null ? { content_type_id: contentTypeId } : {};
            const res = await queryClient.fetchQuery(quizQuestionsQueryOptions('daily-quiz', payload));
            if (!res?.data?.questions?.length) {
                toast.error(t('noDailyQuizAvailable'));
                return;
            }
            router.push(`/play-area/daily-quiz/play`);
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setCheckingDailyQuiz(false);
        }
    }

    return (
        <section className='surfaceBrightBg commonPT'>
            <div className="container">
                <motion.div className={`grid grid-cols-1 ${isQuizZoneVisible ? 'lg:grid-cols-2' : ''} gap-6`} variants={listVariants} initial="hidden" animate="show">
                    {/* left content */}
                    {hasLeftContent && <motion.div variants={itemVariants} className='flexCol gap-6 md:gap-10 lg:gap-6'>
                        {/* rank&Score  */}
                        {
                            isLoggedIn &&
                            <motion.div
                                className={`surfaceContainerLowestBg  lg:rounded-3xl lg:p-6 grid gap-6  ${!isExamAndSelfChallengeMode && !isQuizZoneVisible
                                    ? 'grid-cols-1 lg:grid-cols-2 items-center '
                                    : 'grid-cols-2 lg:shadow-[0px_8px_32px_0px_#0000000A] lg:border'
                                    }`}
                                variants={listVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {!isExamAndSelfChallengeMode && !isQuizZoneVisible && (
                                    <div className="pr-0 lg:pr-15 sm:pr-30">
                                        <Typography variant="h1" weight="extrabold">
                                            {t('playAnd')} <span className="primaryColor">{t('learn')}</span> {t('whileFun')}
                                        </Typography>
                                    </div>
                                )}

                                {(!isExamAndSelfChallengeMode && !isQuizZoneVisible) ? (
                                    // Text is showing: cards share one column, side by side as a compact pair
                                    <div className="grid grid-cols-2 gap-3 lg:gap-6 ">
                                        {userRankScore?.map((data, idx) => (
                                            <LocalizedLink href={data?.href} key={idx}>
                                                <motion.div

                                                    variants={itemVariants}
                                                    className={`${data?.bg} rounded-3xl p-3 lg:p-6 flex items-center gap-2 lg:gap-3 h-max`}
                                                >
                                                    {data?.img}
                                                    <div
                                                        className={`flexCol text-white ${data?.bg === 'secondaryBgWithBorderShadow' ? 'dark:text-(--neutral-900)!' : ''
                                                            }`}
                                                    >
                                                        <Typography variant="h6" className="font-nunito! font-semibold!">
                                                            {data?.title}
                                                        </Typography>
                                                        <Typography variant="subtitle1">{data?.desc}</Typography>
                                                    </div>
                                                </motion.div>
                                            </LocalizedLink>
                                        ))}
                                    </div>
                                ) : (
                                    userRankScore?.map((data, idx) => (
                                        <LocalizedLink href={data?.href} key={idx}>
                                            <motion.div
                                                variants={itemVariants}
                                                className={`${data?.bg} rounded-3xl p-3 lg:p-6 flex items-center gap-2 lg:gap-3 h-max`}
                                            >
                                                {data?.img}
                                                <div
                                                    className={`flexCol text-white ${data?.bg === 'secondaryBgWithBorderShadow' ? 'dark:text-(--neutral-900)!' : ''
                                                        }`}
                                                >
                                                    <Typography variant="h6" className="font-nunito! font-semibold!">
                                                        {data?.title}
                                                    </Typography>
                                                    <Typography variant="subtitle1">{data?.desc}</Typography>
                                                </div>
                                            </motion.div>
                                        </LocalizedLink>
                                    ))
                                )}
                            </motion.div>
                        }


                        {/* First part */}
                        {isExamOrSelfChallengeMode && <div className={`flexCol gap-20 lg:gap-29 ${showExamSelfChallengeTitleAndBorder ? 'surfaceContainerLowestBg lg:border rounded-2xl lg:rounded-[42px] lg:p-6 lg:shadow-[0px_8px_32px_0px_#0000000A] lg:commonBorderB' : ''}`}>
                            {(showExamSelfChallengeTitleAndBorder || !isLoggedIn) && <div className='pr-15 sm:pr-30'>
                                <Typography variant='h1' weight='extrabold'>
                                    {t('playAnd')} <span className='primaryColor'>{t('learn')}</span> {t('whileFun')}
                                </Typography>
                            </div>}

                            <motion.div className='grid grid-cols-2 gap-6' variants={listVariants} initial="hidden" animate="show">
                                {
                                    // Always link straight to the module's own page — exams and self-challenge
                                    // each gate the actual "start" action on their own page instead (self-challenge
                                    // via DifficultyModal → QuizZone's goToPlay, keyed per module already).
                                    quizs?.map((quiz, idx) => {
                                        return <MotionLink variants={itemVariants} href={`/play-area/${quiz.href}`} key={idx} className={`${quiz?.bg} ${quizs.length === 1 && isQuizZoneVisible ? 'col-span-2' : ''} p-6 rounded-2xl flexCol gap-3`}>
                                            <div className='-mt-16 lg:-mt-20 flex items-start! w-fit'>
                                                <ImagePreview src={quiz?.img} alt="exam-module" className="w-15! h-15! sm:w-20! sm:h-20!" />
                                            </div>
                                            <div className='flexCol gap-2'>
                                                <Typography variant='h5' weight='medium'>
                                                    {quiz?.title}
                                                </Typography>
                                                <Typography variant='h6' weight='semibold' className='font-nunito! onSurfaceVarColor!'>
                                                    {quiz?.desc}
                                                </Typography>
                                            </div>
                                        </MotionLink>
                                    })
                                }


                            </motion.div>

                        </div>}


                        {/* Second part */}
                        {!isExamOrSelfChallengeMode && visibleDailyQuizContestQuiz.length > 0 && <motion.div className={`grid grid-cols-2 gap-6 ${showDailyQuizTitleAndBorder ? 'surfaceContainerLowestBg flexCol  lg:border rounded-2xl lg:rounded-[42px] lg:p-6 lg:shadow-[0px_8px_32px_0px_#0000000A] lg:commonBorderB' : ''}`} variants={listVariants} initial="hidden" animate="show">
                            {(showDailyQuizTitleAndBorder || !isLoggedIn) && <div className='col-span-2 pr-15 sm:pr-30'>
                                <Typography variant='h1' weight='extrabold'>
                                    {t('playAnd')} <span className='primaryColor'>{t('learn')}</span> {t('whileFun')}
                                </Typography>
                            </div>}
                            {
                                visibleDailyQuizContestQuiz?.map((quiz, idx) => {
                                    const isDailyQuiz = quiz.href === 'daily-quiz';
                                    const showDailyQuizCountdown = isDailyQuiz && hasPlayedDailyQuiz;
                                    const handleCardClick = isDailyQuiz ? () => { if (guardPlay('daily_quiz_guest_mode')) handleDailyQuizPlay(); } : () => router.push(`/play-area/${quiz.href}`);

                                    if (visibleDailyQuizContestQuiz.length > 1 && isQuizZoneVisible) {
                                        return <motion.div key={idx} variants={itemVariants}>
                                            <VerticalCard title={quiz?.title} desc={quiz?.desc} img={quiz?.img} onClick={handleCardClick} btnLabel={showDailyQuizCountdown ? formatCountdown(dailyQuizCountdownMs) : isDailyQuiz ? (isLoggedIn ? t('playNow') : t('loginNow')) : quiz?.btnLabel} loading={isDailyQuiz && checkingDailyQuiz} disabled={isDailyQuiz && checkingDailyQuiz} className='' />
                                        </motion.div>
                                    }
                                    return <motion.div key={idx} variants={itemVariants} className={visibleDailyQuizContestQuiz.length === 1 && isQuizZoneVisible ? 'col-span-2' : ''}>
                                        <HorizontalCard title={quiz?.title} desc={quiz?.desc} img={quiz?.img} onClick={handleCardClick} btnLabel={showDailyQuizCountdown ? formatCountdown(dailyQuizCountdownMs) : isDailyQuiz ? (isLoggedIn ? t('playNow') : t('loginNow')) : quiz?.btnLabel} size='lg' loading={isDailyQuiz && checkingDailyQuiz} disabled={isDailyQuiz && checkingDailyQuiz} />
                                    </motion.div>
                                })
                            }
                        </motion.div>}
                    </motion.div>}

                    {/* right content */}
                    {
                        isQuizZoneVisible &&
                        <motion.div variants={itemVariants} className={`surfaceContainerLowestBg rounded-2xl lg:rounded-[42px] commonBorderB border border-[2px] lg:border p-4 lg:p-8 flexCol gap-6 h-full ${!hasLeftContent ? 'lg:col-start-1' : ''}`}>
                            <div className='w-full h-45 md:h-80.25 aspect-585/321'>
                                <ImagePreview src={webSettings?.quiz_zone_icon ?? ultimateZone} alt='ultimateZone' className='rounded-3xl' />
                            </div>
                            <div className='flexCol gap-4'>
                                <Typography variant='h2' weight='medium'>
                                    {t('ultimateQuizZone')}
                                </Typography>
                                <Typography variant='h4' weight='semibold' className='font-nunito! onSurfaceVarColor!'>
                                    {/* NOTE: Have to make this count dynamic */}
                                    {t('playQuizOver')} 10,000+ {t('categoryWithContents')}
                                </Typography>

                                <Button variant='secondary' onClick={handlePlayNow}>
                                    {t('playNow')}
                                </Button>
                            </div>
                        </motion.div>
                    }
                </motion.div>
            </div>
            <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
            <LoginRequiredModal
                open={loginRequiredOpen}
                onClose={setLoginRequiredOpen}
                onGuestClick={() => setLoginRequiredOpen(false)}
                onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
            />
        </section>
    )
}

export default PlayLearn