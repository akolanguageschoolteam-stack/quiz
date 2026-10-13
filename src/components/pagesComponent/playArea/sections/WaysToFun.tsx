'use client'
import SectionInfo from '@/components/storybook/molecules/SectionInfo'
import { HorizontalCard } from '@/components/storybook/molecules/horizontalCard'
import { useTranslation } from '@/hooks/useTranslation';
import quizsImg from '@/assets/playArea/quizs.png'
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { QuizType, SLUG_GUEST_MODE_KEY_MAP } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query';
import { categoriesQueryOptions } from '@/api/queries/categories';
import { quizQuestionsQueryOptions } from '@/api/queries/questions';
import { getContentTypeId } from '@/api/apiMiddleware';
import { QuizTypeObject } from '@/types/GlobalTypes';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTitle } from '@/redux/reducers/quizSlice';
import { profileSelector, tokenSelector } from '@/redux/reducers/userSlice';
import { motion } from 'motion/react';
import { itemVariants, listVariants } from '@/lib/motionVariants';
import { useIsDark } from '@/hooks/useIsDark';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/utils/errorMessages';
import type { StaticImageData } from 'next/image';
import { webSettingsSelector } from '@/redux/reducers/settingsSlice';
import AuthModal from '@/components/auth/AuthModal';
import LoginRequiredModal from '@/components/auth/LoginRequiredModal';
import { useAuthGate } from '@/hooks/useAuthGate';

interface DailyQuizCardItem {
    img: string | StaticImageData;
    title: string;
    desc: string;
    btnLabel: string;
    href: string;
    isVisible?: boolean;
}

interface WaysToFunProps {
    dailyQuizContestQuiz: DailyQuizCardItem[];
    isExamOrSelfChallengeMode: boolean
}

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

const WaysToFun = ({ dailyQuizContestQuiz, isExamOrSelfChallengeMode }: WaysToFunProps) => {

    const { t } = useTranslation();
    const isDark = useIsDark();
    const router = useLocalizedRouter();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const userData = useSelector(profileSelector);
    const token = useSelector(tokenSelector);
    const isLoggedIn = !!token;
    const webSettings = useSelector(webSettingsSelector)
    const hasPlayedDailyQuiz = !!userData?.has_played_daily_quiz;

    const [dailyQuizCountdownMs, setDailyQuizCountdownMs] = useState(() => getMsUntilNextUtcMidnight());
    const [checkingDailyQuiz, setCheckingDailyQuiz] = useState(false);
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, guardPlay } = useAuthGate();

    useEffect(() => {
        if (!hasPlayedDailyQuiz) return;
        const interval = setInterval(() => {
            setDailyQuizCountdownMs(getMsUntilNextUtcMidnight());
        }, 1000);
        return () => clearInterval(interval);
    }, [hasPlayedDailyQuiz]);

    const filteredQuizes = dailyQuizContestQuiz.filter((quiz) => quiz.isVisible);

    const quizs: QuizTypeObject = [
        {
            img: webSettings?.fun_n_learn_icon ?? quizsImg,
            title: t('funLearn'),
            desc: t('funLearnDesc'),
            href: `/play-area/fun-and-learn`,
            moduleType: QuizType.FunLearn,
            isVisible: webSettings?.fun_n_learn_visible_mode == "1" ? true : false
        },
        {
            img: webSettings?.true_false_icon ?? quizsImg,
            title: t('trueFalse'),
            desc: t('trueFalseDesc'),
            moduleType: QuizType.QuizZone,
            href: `/play-area/true-or-false`,
            isVisible: webSettings?.true_false_quiz_visible_mode == "1" ? true : false
        },
        {
            img: webSettings?.guess_the_word_icon ?? quizsImg,
            title: t('guessTheWord'),
            desc: t('guessTheWordDesc'),
            moduleType: QuizType.GuessWord,
            href: `/play-area/guess-the-word`,
            isVisible: webSettings?.guess_the_word_visible_mode == "1" ? true : false
        },
        {
            img: webSettings?.audio_quiz_icon ?? quizsImg,
            title: t('audioQuiz'),
            desc: t('audioQuizDesc'),
            moduleType: QuizType.Audio,
            href: `/play-area/audio-quiz`,
            isVisible: webSettings?.audio_quiz_visible_mode == "1" ? true : false
        },
        {
            img: webSettings?.multi_match_quiz_icon ?? quizsImg,
            title: t('multiMatch'),
            desc: t('multiMatchDesc'),
            moduleType: QuizType.MultiMatch,
            href: `/play-area/multi-match`,
            isVisible: webSettings?.multi_match_quiz_visible_mode == "1" ? true : false
        },
        {
            img: webSettings?.math_mania_icon ?? quizsImg,
            title: t('mathMania'),
            desc: t('mathManiaDesc'),
            moduleType: QuizType.Math,
            href: `/play-area/math-mania`,
            isVisible: webSettings?.math_quiz_visible_mode == "1" ? true : false
        },
    ];

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

    const [navigatingModule, setNavigatingModule] = useState<string | null>(null);

    const handlePlayNow = async (moduleType: number, href: string, title: string) => {
        if (navigatingModule) return;
        dispatch(setSelectedTitle(title));

        if (href === `/play-area/true-or-false`) {
            if (!guardPlay(SLUG_GUEST_MODE_KEY_MAP['true-or-false'])) return;
            setNavigatingModule(href);
            try {
                const contentTypeId = getContentTypeId();
                const payload = contentTypeId != null ? { content_type_id: contentTypeId } : {};
                await queryClient.fetchQuery(quizQuestionsQueryOptions('true-false-quiz', payload));
                router.push(`${href}/play`)
            } catch (error) {
                toast.error(getErrorMessage(error, t('somethingWentWrong')));
            } finally {
                setNavigatingModule(null);
            }
            return;
        }

        setNavigatingModule(href);
        try {
            await queryClient.fetchQuery(categoriesQueryOptions(moduleType));
            router.push(href)
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setNavigatingModule(null);
        }
    }





    return (
        <section className={`${isDark ? 'onPrimaryBg' : 'bg-linear-to-b from-(--neutral-50) to-(--neutral-100) '} commonPY`}>
            <div className="container commonTextContentGap">
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <SectionInfo title={t('moreWaysToFunLearnEarn')} />
                </motion.div>
                {isExamOrSelfChallengeMode && <motion.div
                    className='grid grid-cols-1 md:grid-cols-2 gap-6'
                    variants={listVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {
                        filteredQuizes?.map((quiz, idx) => {
                            const isDailyQuiz = quiz.href === 'daily-quiz';
                            const showDailyQuizCountdown = isDailyQuiz && hasPlayedDailyQuiz;
                            const handleCardClick = isDailyQuiz ? () => { if (guardPlay('daily_quiz_guest_mode')) handleDailyQuizPlay(); } : () => router.push(`/play-area/${quiz.href}`);

                            return <motion.div key={idx} variants={itemVariants}>
                                <HorizontalCard title={quiz?.title} desc={quiz?.desc} img={quiz?.img} onClick={handleCardClick} btnLabel={showDailyQuizCountdown ? formatCountdown(dailyQuizCountdownMs) : isDailyQuiz ? (isLoggedIn ? t('playNow') : t('loginNow')) : quiz?.btnLabel} size='lg' loading={isDailyQuiz && checkingDailyQuiz} disabled={isDailyQuiz && checkingDailyQuiz} />
                            </motion.div>
                        })
                    }
                </motion.div>}
                {/* quizs */}
                <motion.div
                    className='grid max-375:grid-cols-1 grid-cols-2 lg:grid-cols-3 gap-6'
                    variants={listVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {
                        quizs?.filter((quiz) => quiz.isVisible)?.map((quiz, idx) => {
                            return <motion.div key={idx} variants={itemVariants}>
                                <HorizontalCard title={quiz?.title} desc={quiz?.desc} img={quiz?.img} onClick={() => handlePlayNow(quiz.moduleType, quiz.href, quiz.title)} loading={navigatingModule === quiz.href} disabled={!!navigatingModule} />
                            </motion.div>
                        })
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

export default WaysToFun