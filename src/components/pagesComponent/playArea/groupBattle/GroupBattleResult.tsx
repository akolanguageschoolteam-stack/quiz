'use client'

import { useEffect } from "react"
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"
import { useDispatch, useSelector } from "react-redux"
import Layout from "@/components/layout/Layout"
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import avatar from "@/assets/avtars/guest.svg";
import { Typography } from "@/components/storybook/atoms/Typography";
import StatTile from "@/components/storybook/molecules/statTile";
import { RankCard } from "@/components/storybook/molecules/rankCard";
import { Hourglass, Check, Zap } from "lucide-react";
import { PremiumCoin } from "@/components/common/Icons";
import { Button } from "@/components/storybook/atoms/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { battleResultSelector, quizPlayParamsSelector, setBattleResult } from "@/redux/reducers/quizSlice";
import { profileSelector } from "@/redux/reducers/userSlice";
import { useBattleRoom } from "@/hooks/useBattleRoom";
import { firebaseAuth } from "@/lib/firebase";
import type { BattleResultParticipant } from "@/types/GlobalTypes";
import spark from '@/assets/groupBattleResultSparkBg.svg'
import ResultLottiesAnimation from "@/components/common/ResultLottiesAnimation"

const RESULT_TIERS = [
    { minPercentage: 80, titleKey: 'result_excellent', subtitleKey: 'result_excellent_subtitle' },
    { minPercentage: 60, titleKey: 'result_well_done', subtitleKey: 'result_win_subtitle' },
    { minPercentage: 40, titleKey: 'result_good_effort', subtitleKey: 'result_good_effort_subtitle' },
    { minPercentage: 20, titleKey: 'result_nice_try', subtitleKey: 'result_lose_subtitle' },
    { minPercentage: 0, titleKey: 'result_keep_trying', subtitleKey: 'result_keep_trying_subtitle' },
] as const;

const PODIUM_STYLES = [
    { place: 2, wrapClass: 'flexCol gap-6', pedestalClass: 'rounded-l-[32px]' },
    { place: 1, wrapClass: '-mt-20 md:-mt-30 flexCol gap-6', pedestalClass: 'rounded-t-[32px]' },
    { place: 3, wrapClass: 'flexCol gap-6', pedestalClass: 'rounded-r-[32px]' },
] as const;

const formatMinutes = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')} Min`;
}

const GroupBattleResult = () => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();

    const battleResult = useSelector(battleResultSelector);
    const quizPlayParams = useSelector(quizPlayParamsSelector);
    const userData = useSelector(profileSelector);

    const myUserId = Number(userData?.id) || 0;

    const { room: battleRoom, attachToRoom, submitResults } = useBattleRoom('group');
    useEffect(() => {
        if (quizPlayParams?.roomId) attachToRoom(quizPlayParams.roomId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizPlayParams?.roomId]);

    // PlayScreen already submits the result before navigating here — this is a fallback
    // for whenever that didn't happen (submit failed silently, or this screen was reached
    // some other way, e.g. a reload) so the podium isn't stuck blank. submitResults is
    // idempotent — once the match's finalResult is published, every caller just reads it
    // back instead of re-submitting.
    useEffect(() => {
        if (!quizPlayParams?.roomId || !battleRoom || battleResult) return;
        const myUid = firebaseAuth.currentUser?.uid;
        if (!myUid) return;

        submitResults(myUid, myUserId)
            .then((result) => dispatch(setBattleResult(result)))
            .catch((error) => console.error("Failed to fetch battle result:", error));
    }, [quizPlayParams?.roomId, battleRoom, battleResult, submitResults, dispatch, myUserId]);

    const resolvePlayer = (participant: BattleResultParticipant) => {
        const isMe = participant.user_id === myUserId;
        const roomUser = battleRoom?.users.find((u) => u.userId === participant.user_id);
        return {
            isMe,
            name: isMe ? (userData?.name || t('you')) : (roomUser?.name || t('player')),
            avatar: (isMe ? userData?.profile : roomUser?.profile) || avatar,
        };
    };


    const participantsWithLiveScore = (battleResult?.participants ?? []).map((participant) => {
        const roomUser = battleRoom?.users.find((u) => u.userId === participant.user_id);
        return { ...participant, score: roomUser?.points ?? participant.score };
    });

    const sortedParticipants = [...participantsWithLiveScore].sort((a, b) =>
        (b.score - a.score) || (a.total_time_taken - b.total_time_taken)
    );
    const rankedParticipants = sortedParticipants.map((participant, idx) => {
        const prev = sortedParticipants[idx - 1];
        const tiedWithPrev = idx > 0 && prev.score === participant.score && prev.total_time_taken === participant.total_time_taken;
        return { ...participant, displayRank: tiedWithPrev ? 0 : idx + 1 };
    });
    for (let i = 1; i < rankedParticipants.length; i++) {
        if (rankedParticipants[i].displayRank === 0) rankedParticipants[i].displayRank = rankedParticipants[i - 1].displayRank;
    }

    const podium = [rankedParticipants[1], rankedParticipants[0], rankedParticipants[2]];
    const restOfLeaderboard = rankedParticipants.slice(3);

    const me = rankedParticipants.find((p) => p.user_id === myUserId) ?? null;
    const percent = me?.winning_percentage ?? 0;
    const resultTier = RESULT_TIERS.find((tier) => percent >= tier.minPercentage) ?? RESULT_TIERS[RESULT_TIERS.length - 1];
    const myDisplayName = userData?.name || t('you');

    return (
        <Layout>
            <section className="bg-(--primary-100) relative commonPY pt-50 dark:text-black!">
                <div
                    style={{
                        backgroundImage: `url(${spark.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    className="absolute inset-0 h-full w-full"
                >
                </div>

                <div className="container flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-6">
                    <div className="flexCol gap-6">
                        {sortedParticipants.length > 0 && (
                            <div className="grid grid-cols-3 relative z-1">
                                {PODIUM_STYLES.map(({ place, wrapClass, pedestalClass }) => {
                                    const participant = podium[place === 1 ? 1 : place === 2 ? 0 : 2];
                                    if (!participant) return <div key={place} />;
                                    const player = resolvePlayer(participant);
                                    return (
                                        <div key={place} className={`${wrapClass} md:w-[290px]`}>
                                            <div className="flexColCenter gap-4">
                                                <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 xl:w-60 xl:h-60 rounded-full bg-white flexCenter overflow-hidden">
                                                    <ImagePreview src={player.avatar} alt={player.name} objectFit="contain" containerClassName="w-full h-full" />
                                                </div>
                                                <div className="flexColCenter gap-4 text-center px-3 sm:px-6">
                                                    <Typography variant="h2" className=" line-clamp-1 break-all">
                                                        {player.name}
                                                    </Typography>
                                                    <div className="primaryBg rounded-full py-1.5 px-3 md:py-2 md:px-4 flexCenter gap-1.5 md:gap-2 shrink-0 w-max mx-auto">
                                                        <Zap className="w-5 h-5 md:w-6 md:h-6 text-white fill-current" />
                                                        <Typography variant="h5" className="text-sm! md:text-xl! font-extrabold md:font-bold font-nunito! leading-5 md:leading-7 text-white">
                                                            {participant.score}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`bg-linear-to-b from-(--neutral-50) to-(--primary-100) flexCenter text-5xl md:text-7xl lg:text-9xl p-6 md:p-8 pb-24 md:pb-30 relative z-1 ${pedestalClass}`}>
                                                {participant.displayRank}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="-mt-20 w-full max-w-218 relative bg-white rounded-[32px] md:rounded-[42px] shadow-[0px_8px_32px_0px_#0000000A] px-4 sm:px-6 md:px-10 pt-16 sm:pt-22 md:pt-28 xl:pt-34 pb-6 md:pb-10 flexCol gap-6 md:gap-7 z-2">
                            {/* Currently checking based on percentage needs to review this and make improvement */}
                            {percent >= 60 && (
                                <div className="absolute -top-25 inset-x-0 z-1 md:w-1/2 md:h-1/2 mx-auto">
                                    <ResultLottiesAnimation />
                                </div>
                            )}
                            {/* Avatar */}
                            <div className="absolute -top-14 sm:-top-18 md:-top-24 xl:-top-30 left-1/2 -translate-x-1/2 w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 xl:w-60 xl:h-60 rounded-full bg-white flexCenter overflow-hidden">
                                <ImagePreview src={userData?.profile || avatar} alt={myDisplayName} objectFit="contain" containerClassName="w-full h-full" />
                            </div>
                            <div className="blueContainerBg rounded-full py-1.5 px-3 md:py-2 md:px-4 flexCenter gap-1.5 md:gap-2 shrink-0 w-max mx-auto">
                                <Zap className="w-5 h-5 md:w-6 md:h-6 blueColor fill-current" />
                                <Typography variant="h5" className="text-sm! md:text-xl! font-extrabold md:font-bold font-nunito! leading-5 md:leading-7 blueColor">
                                    {me?.score ?? 0}
                                </Typography>
                            </div>

                            {/* Heading */}
                            <div className="flexCol gap-1 md:gap-2 text-center">
                                <Typography variant="h2" className="text-2xl! md:text-4xl! xl:text-5xl! font-normal! font-candal! leading-tight xl:leading-12! text-black">
                                    {t(resultTier.titleKey)} {myDisplayName}
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
                            <div className="grid max-399:grid-cols-1 grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                <StatTile
                                    bg="primaryContainerBg"
                                    icon={<Hourglass />}
                                    value={formatMinutes(me?.total_time_taken ?? 0)}
                                    label={t('timeTaken')}
                                    labelColor="primaryColor"
                                />
                                <StatTile
                                    bg="bg-(--success-100)"
                                    icon={
                                        <span className="w-7 h-7 md:w-9 md:h-9 xl:w-7.5 xl:h-7.5 rounded-full successBg flexCenter">
                                            <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
                                        </span>
                                    }
                                    value={String(me?.correct_count ?? 0)}
                                    label={`${t('outOf')} ${me?.total_questions ?? 0}`}
                                    labelColor="successColor"
                                />
                                <StatTile
                                    bg="warningContainerBg"
                                    icon={<PremiumCoin />}
                                    value={String(me?.payout_coin ?? 0)}
                                    label={t('coinsEarned')}
                                    labelColor="warningColor"
                                />
                            </div>

                            <Button variant="primary" fullWidth onClick={() => router.push(`/play-area/group-battle`)}>
                                {t('playAgain')}
                            </Button>
                        </div>

                        {restOfLeaderboard.length > 0 && (
                            <div className="relative z-2 flexCol gap-3">
                                {restOfLeaderboard.map((participant) => {
                                    const player = resolvePlayer(participant);
                                    return (
                                        <RankCard
                                            key={participant.user_id}
                                            avatar={player.avatar}
                                            name={player.name}
                                            streak={participant.score}
                                            rank={participant.displayRank}
                                            className={player.isMe ? 'primaryBorder border-2!' : ''}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </section>
        </Layout >
    )
}

export default GroupBattleResult
