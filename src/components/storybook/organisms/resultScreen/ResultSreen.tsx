'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { Hourglass, Check, X, Award, Zap, Lightbulb } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Typography } from "@/components/storybook/atoms/Typography";
import { Button } from "@/components/storybook/atoms/Button";
import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import ResultTopBanner from "@/components/storybook/atoms/resultTopBanner";
import StatTile from "@/components/storybook/molecules/statTile";
import { Coin } from "@/components/common/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import UnlockModal from "@/components/pagesComponent/playArea/quizPages/UnlockModal";
import { useAuthGate } from "@/hooks/useAuthGate";
import { quizQuestionsQueryOptions } from "@/api/queries/questions";
import { getContentTypeId } from "@/api/apiMiddleware";
import { SLUG_QUESTIONS_ENDPOINT_MAP, SLUG_GUEST_MODE_KEY_MAP } from "@/lib/constants";
import { USER_PROFILE_QUERY_KEY } from "@/hooks/useUserProfileQuery";
import { quizResultSelector, quizPlayParamsSelector, quizTimeTakenSelector, quizReviewAnswersSelector, battleResultSelector, setBattleResult, setQuizResult, setQuizTimeTaken, reviewUnlockedSelector, setReviewUnlocked } from "@/redux/reducers/quizSlice";
import avatar from "@/assets/avtars/guest.svg";
import { profileSelector, setProfile } from "@/redux/reducers/userSlice";
import { fetchUserProfile, submitCoinScore } from "@/api/apiRoutes";
import { webSettingsSelector } from "@/redux/reducers/settingsSlice";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/utils/errorMessages";
import { getQuizSessionKey, clearQuizSession } from "@/lib/quizSession";
import { useBattleRoom } from "@/hooks/useBattleRoom";
import { firebaseAuth } from "@/lib/firebase";
import { AdSlot } from "@/components/ads/AdSlot";
import ResultLottiesAnimation from "@/components/common/ResultLottiesAnimation";
import { BattleResultParticipant } from "@/types/GlobalTypes";


const ResultScreen = () => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const params = useParams<{ slug: string }>();
    const { guardPlay } = useAuthGate();
    const quizResult = useSelector(quizResultSelector);
    const userData = useSelector(profileSelector)
    const quizPlayParams = useSelector(quizPlayParamsSelector);
    const quizTimeTakenSeconds = useSelector(quizTimeTakenSelector);
    const battleResult = useSelector(battleResultSelector);
    const quizReviewAnswers = useSelector(quizReviewAnswersSelector);
    const reviewUnlocked = useSelector(reviewUnlockedSelector);
    const webSettings = useSelector(webSettingsSelector);

    const [showReviewUnlockModal, setShowReviewUnlockModal] = useState(false);
    const [hasEnoughCoinsForReview, setHasEnoughCoinsForReview] = useState(true);
    const [navigatingReplay, setNavigatingReplay] = useState(false);
    const reviewCoinsCost = Number(webSettings?.general_review_answers_deduct ?? 0);
    const questionsEndpoint = SLUG_QUESTIONS_ENDPOINT_MAP[params.slug] ?? params.slug;
    const guestModeKey = SLUG_GUEST_MODE_KEY_MAP[params.slug] ?? 'quiz_zone_guest_mode';

    const examAttempt = quizResult && 'attempt' in quizResult ? quizResult.attempt : null;
    const regularResult = quizResult && 'correct_answers' in quizResult ? quizResult : null;
    const unlockedLevelId = quizResult && 'unlocked_level_id' in quizResult ? quizResult.unlocked_level_id : null;
    const percent = examAttempt
        ? (examAttempt.total_exam_marks > 0 ? Math.round((examAttempt.total_score / examAttempt.total_exam_marks) * 100) : 0)
        : (quizResult && 'winning_percentage' in quizResult ? quizResult.winning_percentage : 0);
    const isTrueFalsePage = quizPlayParams?.pathname?.includes('true-or-false') ?? false;
    const isExamPage = quizPlayParams?.pathname?.includes('/play-area/exams/play') ?? false;
    const isSelfChallengePage = quizPlayParams?.pathname?.includes('self-challenge') ?? false;
    const isContestPage = quizPlayParams?.pathname?.includes('/play-area/contest-play/play') ?? false;
    const isBookmarksPlayPage = quizPlayParams?.pathname?.includes('/play-area/bookmarks/play') ?? false;
    const isDailyQuizPage = quizPlayParams?.pathname?.includes('/play-area/daily-quiz/play') ?? false;
    const isOneVsOnePage = quizPlayParams?.pathname?.includes('1-vs-1-battle') ?? false;
    const isRandomBattlePage = quizPlayParams?.pathname?.includes('random-battle') ?? false;
    const isBotMatch = quizPlayParams?.isBotMatch ?? false;

    const isBattleResultPage = isOneVsOnePage || isRandomBattlePage;
    const isLiveBattleResultPage = isBattleResultPage && !isBotMatch;
    const isFunLearnPage = quizPlayParams?.pathname?.includes('fun-and-learn') ?? false;


    const myUserId = Number(userData?.id) || 0;
    const opponentParticipant = battleResult?.participants.find((p: BattleResultParticipant) => p.user_id !== myUserId) ?? null;
    const myBattleParticipant = battleResult?.participants.find((p: BattleResultParticipant) => p.user_id === myUserId) ?? null;
    const isDrawBattle = battleResult?.is_draw ?? false;
    const iWonBattle = !isDrawBattle && battleResult?.winner_user_id === myUserId;


    const isTopRankBattle = isBattleResultPage && myBattleParticipant?.rank === 1 && !isDrawBattle;

    const isFunLearnWin = isFunLearnPage && percent >= 60;
    const showResultAnimation = !isExamPage && !isSelfChallengePage &&
        (isBattleResultPage ? isTopRankBattle : isFunLearnPage ? isFunLearnWin : (!!unlockedLevelId && !!quizPlayParams?.pathname));

    const { room: battleRoom, attachToRoom, submitResults } = useBattleRoom('1v1');
    useEffect(() => {
        if (isLiveBattleResultPage && quizPlayParams?.roomId) attachToRoom(quizPlayParams.roomId);
    }, [isLiveBattleResultPage, quizPlayParams?.roomId]);


    useEffect(() => {
        if (!isLiveBattleResultPage || !quizPlayParams?.roomId || !battleRoom || battleResult) return;
        const myUid = firebaseAuth.currentUser?.uid;
        if (!myUid) return;

        submitResults(myUid, Number(userData?.id) || 0)
            .then((result) => {
                dispatch(setBattleResult(result));
                const myUserId = Number(userData?.id) || 0;
                const me = result.participants.find((p) => p.user_id === myUserId);
                if (me) {
                    dispatch(setQuizResult({
                        total_questions: me.total_questions,
                        correct_answers: me.correct_count,
                        wrong_answers: me.wrong_count,
                        skipped_answers: Math.max(0, me.total_questions - me.correct_count - me.wrong_count),
                        winning_percentage: me.winning_percentage,
                        earn_coin: me.payout_coin,
                        score: me.score,
                        total_coins: me.total_coins,
                        total_score: me.total_score,
                        unlocked_level: null,
                        unlocked_level_id: null,
                    }));
                    dispatch(setQuizTimeTaken(me.total_time_taken));
                }
            })
            .catch((error) => console.error("Failed to fetch battle result:", error));
    }, [isLiveBattleResultPage, quizPlayParams?.roomId, battleRoom, battleResult, submitResults, dispatch, userData?.id]);

    const opponent = opponentParticipant
        ? battleRoom?.users.find((u) => u.userId === opponentParticipant.user_id) ?? null
        : null;
    const opponentDisplayName = isBotMatch ? t('bot') : (opponent?.name || t('player'));
    const formattedOpponentTime = (() => {
        const totalSeconds = opponentParticipant?.total_time_taken ?? 0;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')} Min`;
    })();

    useEffect(() => {
        fetchUserProfile()
            .then((res) => {
                dispatch(setProfile(res.data));
                // Keep the shared ['userProfile'] cache in sync so Layout/Header
                // don't re-dispatch stale coins/data over this on the next mount.
                queryClient.setQueryData(USER_PROFILE_QUERY_KEY, res.data);
            })
            .catch((error) => console.error("Failed to refresh user profile:", error));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const lifelinesUsedCount = quizPlayParams?.lifelinesUsedCount ?? 0;
    const hintsUsedCount = quizPlayParams?.hintsUsedCount ?? 0;
    const totalHintsUsed = lifelinesUsedCount + hintsUsedCount;
    const hintsCoinCost = totalHintsUsed;

    const formattedQuizTime = (() => {
        const totalSeconds = examAttempt?.attempted_time_duration ?? quizTimeTakenSeconds ?? 0;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')} Min`;
    })();

    const RESULT_TIERS = [
        { minPercentage: 80, titleKey: 'result_excellent', subtitleKey: 'result_excellent_subtitle' },
        { minPercentage: 60, titleKey: 'result_well_done', subtitleKey: 'result_win_subtitle' },
        { minPercentage: 40, titleKey: 'result_good_effort', subtitleKey: 'result_good_effort_subtitle' },
        { minPercentage: 20, titleKey: 'result_nice_try', subtitleKey: 'result_lose_subtitle' },
        { minPercentage: 0, titleKey: 'result_keep_trying', subtitleKey: 'result_keep_trying_subtitle' },
    ] as const;
    const resultTier = RESULT_TIERS.find((tier) => percent >= tier.minPercentage) ?? RESULT_TIERS[RESULT_TIERS.length - 1];


    const goToQuiz = async (level: string | number | null | undefined) => {
        if (!quizPlayParams?.pathname || navigatingReplay || !guardPlay(guestModeKey)) return;

        const contentTypeId = getContentTypeId();
        const questionsPayload = {
            category_id: quizPlayParams.categoryId ?? 0,
            level_id: level ? Number(level) : null,
            ...(contentTypeId != null ? { content_type_id: contentTypeId } : {}),
        };

        setNavigatingReplay(true);
        try {
            await queryClient.fetchQuery(quizQuestionsQueryOptions(questionsEndpoint, questionsPayload));
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
            setNavigatingReplay(false);
            return;
        }

        queryClient.removeQueries({ queryKey: ["quiz-questions"] });
        queryClient.removeQueries({ queryKey: ["fun-learn-questions"] });

        const query = new URLSearchParams();
        if (quizPlayParams.categoryId) query.set('cate', String(quizPlayParams.categoryId));
        if (quizPlayParams.funLearnId) {
            query.set('fun_n_learn_id', String(quizPlayParams.funLearnId));
        } else if (level) {
            query.set('level', String(level));
        }
        const queryString = query.toString();
        clearQuizSession(getQuizSessionKey(quizPlayParams.pathname, queryString));
        router.push(queryString ? `${quizPlayParams.pathname}?${queryString}` : quizPlayParams.pathname);
    };


    const goToReview = () => {
        if (!quizPlayParams?.pathname) return;

        const query = new URLSearchParams();
        if (quizPlayParams.categoryId) query.set('cate', String(quizPlayParams.categoryId));
        if (quizPlayParams.funLearnId) {
            query.set('fun_n_learn_id', String(quizPlayParams.funLearnId));
        } else if (quizPlayParams.level) {
            query.set('level', String(quizPlayParams.level));
        }
        if (quizPlayParams.roomId) query.set('roomId', quizPlayParams.roomId);
        if (quizPlayParams.roomCode) query.set('roomCode', quizPlayParams.roomCode);
        if (quizPlayParams.isBotMatch) query.set('bot', '1');
        query.set('review', '1');
        router.push(`${quizPlayParams.pathname}?${query.toString()}`);
    }

    const handleReviewQuiz = () => {
        if (!quizPlayParams?.pathname) return;

        // Already paid for this attempt's review — re-enter for free instead of charging again.
        if (reviewUnlocked) {
            goToReview();
            return;
        }

        const userCoins = Number(userData?.total_coins ?? 0);
        setHasEnoughCoinsForReview(userCoins >= reviewCoinsCost);
        setShowReviewUnlockModal(true);
    }

    const confirmReviewQuiz = async () => {
        if (!quizPlayParams?.pathname) return;

        try {
            const payload = {
                amount: reviewCoinsCost,
                source: 'review_answer',
                description: 'Review Answer',
            }
            await submitCoinScore(payload);
            dispatch(setReviewUnlocked(true));
            goToReview();
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setShowReviewUnlockModal(false);
        }
    }

    return (
        <Layout>
            <section className="relative surfaceContainerLowBg min-h-screen pb-12 md:pb-20 overflow-hidden">


                {/* Top banner — recolors with theme primary */}
                <ResultTopBanner className="absolute top-0 left-0 w-full aspect-1920/549 z-0" />

                {/* Content */}
                <div className="relative z-10 container flexCol items-center pt-24 sm:pt-28 md:pt-36 xl:pt-44 gap-6 md:gap-8">

                    {showResultAnimation && (
                        <div className="absolute -top-25 inset-x-0 z-1 md:w-1/2 md:h-1/2 mx-auto pointer-events-none">
                            <ResultLottiesAnimation />
                        </div>
                    )}

                    {/* Result card */}
                    <div className="w-full max-w-142 relative surfaceContainerLowestBg rounded-[32px] md:rounded-[42px] shadow-[0px_8px_32px_0px_#0000000A] px-4 sm:px-6 md:px-10 pt-16 sm:pt-22 md:pt-28 xl:pt-34 pb-6 md:pb-10 flexCol gap-6 md:gap-7">

                        {/* Avatar */}
                        <div className="absolute -top-14 sm:-top-18 md:-top-24 xl:-top-30 left-1/2 -translate-x-1/2 w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 xl:w-60 xl:h-60 rounded-full surfaceContainerLowestBg flexCenter overflow-hidden">
                            <ImagePreview src={avatar} alt="avatar" objectFit="contain" containerClassName="w-full h-full" />
                        </div>

                        {/* Heading */}
                        <div className="flexCol gap-1 md:gap-2 text-center">
                            <Typography variant="h2" className="text-2xl! md:text-4xl! xl:text-5xl! font-normal! font-candal! leading-tight xl:leading-12! onSurfaceColor">
                                {t(resultTier.titleKey)} {String(userData?.name ?? '')}
                            </Typography>
                            <Typography variant="h6" className="text-sm! md:text-base! xl:text-2xl! font-medium xl:font-normal! font-nunito! leading-5 xl:leading-8! onSurfaceVarColor">
                                {t(resultTier.subtitleKey)}
                            </Typography>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-7 md:h-9 primaryFixedBg rounded-full flex flex-col justify-start items-start gap-2.5">
                                <div className="self-stretch flex-1 relative overflow-hidden">
                                    <div className="h-full left-0 top-0 absolute primaryBg rounded-full border-b-4 border-primary! transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                            <div className="primaryBg rounded-full py-1 px-3 md:py-1.5 md:px-4 shrink-0">
                                <Typography variant="h6" className="text-sm! md:text-base! xl:text-xl! font-extrabold xl:font-normal! font-nunito! xl:font-candal! leading-5 xl:leading-7! text-white!">
                                    {percent}%
                                </Typography>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {examAttempt ? (
                                <>
                                    <StatTile
                                        bg="primaryContainerBg"
                                        icon={<Award className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 primaryColor" />}
                                        value={`${examAttempt.total_score} - ${t('marks')}`}
                                        label={`${t('outOf')} ${examAttempt.total_exam_marks}`}
                                        labelColor="primaryColor"
                                    />
                                    <StatTile
                                        bg="warningContainerBg"
                                        icon={<Hourglass className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 text-amber-500" />}
                                        value={formattedQuizTime}
                                        label={t('timeTaken')}
                                        labelColor="text-amber-500"
                                    />
                                    <StatTile
                                        bg="successContainerBg"
                                        icon={
                                            <span className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 rounded-full successBg flexCenter">
                                                <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
                                            </span>
                                        }
                                        value={String(examAttempt.correct_count)}
                                        label={`${t('outOf')} ${examAttempt.total_questions}`}
                                        labelColor="successColor"
                                    />
                                    <StatTile
                                        bg="errorContainerBg"
                                        icon={
                                            <span className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 rounded-full errorBg flexCenter">
                                                <X className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
                                            </span>
                                        }
                                        value={String(examAttempt.wrong_count)}
                                        label={`${t('outOf')} ${examAttempt.total_questions}`}
                                        labelColor="errorColor"
                                    />
                                </>
                            ) : (
                                <>
                                    <StatTile
                                        bg="primaryContainerBg"
                                        icon={<Hourglass className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 errorColor" />}
                                        value={formattedQuizTime}
                                        label={t('timeTaken')}
                                        labelColor="primaryColor"
                                    />
                                    <StatTile
                                        bg="successContainerBg"
                                        icon={
                                            <span className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 rounded-full successBg flexCenter">
                                                <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
                                            </span>
                                        }
                                        value={String(regularResult?.correct_answers ?? 0)}
                                        label={`${t('outOf')} ${regularResult?.total_questions ?? 0}`}
                                        labelColor="successColor"
                                    />
                                    {!isSelfChallengePage && !isBookmarksPlayPage && !!regularResult?.earn_coin && (
                                        <StatTile
                                            bg="warningContainerBg"
                                            icon={<Coin className="w-9 h-9 xl:w-7.5 xl:h-7.5" />}
                                            value={`${regularResult?.earn_coin ?? 0}`}
                                            label={t('coinsEarned')}
                                            labelColor="text-amber-500"
                                        />
                                    )}
                                    {!isSelfChallengePage && !isBookmarksPlayPage && (
                                        <StatTile
                                            bg="blueContainerBg"
                                            icon={<Zap className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 blueColor fill-current" />}
                                            value={`${regularResult?.score ?? 0}`}
                                            label={t('scores')}
                                            labelColor="blueColor"
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        {totalHintsUsed > 0 && (
                            <div className="primaryContainerBg rounded-full py-2 px-4 md:py-2.5 md:px-5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 errorColor fill-current shrink-0" />
                                    <Typography variant="h6" className="text-sm! md:text-base! xl:text-xl! font-medium font-nunito! leading-5 xl:leading-7! onSurfaceColor truncate">
                                        {totalHintsUsed} {t('hintsUsed')}
                                    </Typography>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Coin width={24} height={24} />
                                    <Typography variant="h6" className="text-sm! md:text-base! xl:text-lg! font-semibold! font-nunito! leading-5 errorColor">
                                        -{hintsCoinCost}
                                    </Typography>
                                </div>
                            </div>
                        )}

                        {!isExamPage && !isContestPage && !isBookmarksPlayPage && !isBattleResultPage && (
                            <Button
                                variant="primary"
                                fullWidth
                                leftIcon={reviewUnlocked ? undefined : <Coin width={24} height={24} />}
                                disabled={!quizPlayParams?.pathname || !quizReviewAnswers?.length}
                                onClick={handleReviewQuiz}
                            >
                                <span className="text-base xl:text-xl! font-normal! font-candal! leading-7 onPrimaryColor [text-shadow:0px_2px_0px_rgb(167_58_95/1.00)]">
                                    {reviewUnlocked ? t('reviewAnswers') : `${reviewCoinsCost ?? 0} - ${t('reviewAnswers')}`}
                                </span>
                            </Button>
                        )}

                        {/* Play again / Next level */}
                        {!isExamPage && !isSelfChallengePage && !isContestPage && !isBookmarksPlayPage && !isDailyQuizPage && !isBattleResultPage && !isFunLearnPage && !isTrueFalsePage && (
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    disabled={!quizPlayParams?.pathname || navigatingReplay}
                                    onClick={() => goToQuiz(quizPlayParams?.level)}
                                >
                                    {t('playAgain')}
                                </Button>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    disabled={!unlockedLevelId || !quizPlayParams?.pathname || navigatingReplay}
                                    onClick={() => goToQuiz(unlockedLevelId)}
                                >
                                    {t('nextLevel')}
                                </Button>
                            </div>
                        )}

                        {isDailyQuizPage && (
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => router.push('/')}
                                >
                                    {t('home')}
                                </Button>
                                <Button
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => router.push(`/play-area`)}
                                >
                                    {t('playArea')}
                                </Button>
                            </div>
                        )}

                        {isBookmarksPlayPage && (
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => router.push(`/profile/bookmark`)}
                            >
                                {t('bookmark')}
                            </Button>
                        )}

                        {isContestPage && (
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => router.push(`/play-area/contest-play/leaderboard`)}
                            >
                                {t('viewLeaderboard')}
                            </Button>
                        )}
                    </div>

                    {isBattleResultPage && opponentParticipant && (
                        <div className="w-full max-w-142 surfaceContainerLowestBg rounded-[32px] md:rounded-[42px] shadow-[0px_8px_32px_0px_#0000000A] p-4 sm:p-6 flexCol gap-3 md:gap-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-11 h-11 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 surfaceContainerLowBg">
                                        <ImagePreview src={opponent?.profile || avatar} alt={opponent?.name || t('player')} objectFit="cover" containerClassName="w-full h-full" />
                                    </div>
                                    <div className="flexCol min-w-0">
                                        <Typography variant="h5" weight="semibold" className="truncate">
                                            {opponentDisplayName}
                                        </Typography>
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="w-4 h-4 blueColor fill-current" />
                                            <Typography variant="h6" weight="medium" className="blueColor! font-nunito!">
                                                {opponentParticipant.score}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                                <div className={`rounded-full py-1.5 px-4 shrink-0 ${isDrawBattle ? 'warningContainerBg' : iWonBattle ? 'errorContainerBg' : 'successContainerBg'}`}>
                                    <Typography variant="h6" weight="semibold" className={isDrawBattle ? 'text-amber-500!' : iWonBattle ? 'errorColor!' : 'successColor!'}>
                                        {isDrawBattle ? t('draw') : iWonBattle ? t('lose') : t('win')}
                                    </Typography>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <StatTile
                                    bg={iWonBattle ? 'errorContainerBg' : 'successContainerBg'}
                                    icon={<Hourglass className={`w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 ${iWonBattle ? 'errorColor' : 'successColor'}`} />}
                                    value={formattedOpponentTime}
                                    label={iWonBattle ? t('slower') : t('faster')}
                                    labelColor={iWonBattle ? 'errorColor' : 'successColor'}
                                />
                                <StatTile
                                    bg={iWonBattle ? 'errorContainerBg' : 'successContainerBg'}
                                    icon={
                                        <span className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 rounded-full successBg flexCenter">
                                            <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
                                        </span>
                                    }
                                    value={String(opponentParticipant.correct_count)}
                                    label={`${t('outOf')} ${opponentParticipant.total_questions}`}
                                    labelColor={iWonBattle ? 'errorColor' : 'successColor'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Ad banner */}
                    <div className="w-full max-w-142 mt-6 md:mt-8 rounded-2xl overflow-hidden aspect-[700/280]">
                        <AdSlot className="w-full h-full" />
                    </div>
                </div>
            </section>

            <UnlockModal
                message={hasEnoughCoinsForReview ? `Use ${reviewCoinsCost} ${t('coins')}?` : t('noEnoughCoinsTitle')}
                description={hasEnoughCoinsForReview ? t('reviewAnswersConfirmDesc') : t('noEnoughCoinsDesc')}
                buttonText={hasEnoughCoinsForReview ? t('reviewAnswers') : t('goToCoinStore')}
                open={showReviewUnlockModal}
                onOpenChange={setShowReviewUnlockModal}
                onConfirm={() => {
                    if (hasEnoughCoinsForReview) {
                        confirmReviewQuiz();
                    } else {
                        setShowReviewUnlockModal(false);
                        router.push(`/profile/my-wallet`);
                    }
                }}
            />
        </Layout>
    )
}

export default ResultScreen
