'use client'

import Layout from "@/components/layout/Layout"
import ResultTopBanner from "@/components/storybook/atoms/resultTopBanner";
import { Breadcrumb } from "@/components/storybook/molecules/Breadcrumb"
import { useTranslation } from "@/hooks/useTranslation";
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import avatar from "@/assets/avtars/guest.svg";
import { Typography } from "@/components/storybook/atoms/Typography";
import { RankCard } from "@/components/storybook/molecules/rankCard";
import { Zap } from "lucide-react";
import { Button } from "@/components/storybook/atoms/Button";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import heroBg from '@/assets/homePage/heroBg.svg'
import { useSelector } from "react-redux";
import { selectedContestIdSelector } from "@/redux/reducers/quizSlice";
import { fetchContestLeaderboard, fetchLeaderboard } from "@/api/apiRoutes";
import { ContestLeaderboardResponse } from "@/types/GlobalTypes";
import { usePathname } from "next/navigation";
import { useIsDark } from "@/hooks/useIsDark";
import LeaderboardSkeleton from "@/components/skeltons/LeaderboardSkeleton";
import EmptyStatus from "@/components/common/EmptyStatus";
import { AdZone } from "@/components/ads/AdZone";

const PODIUM_STYLES: Record<number, { wrapClass: string; roundedClass: string }> = {
    1: { wrapClass: '-mt-20 md:-mt-30', roundedClass: 'rounded-t-[32px]' },
    2: { wrapClass: '', roundedClass: 'rounded-l-[32px]' },
    3: { wrapClass: '', roundedClass: 'rounded-r-[32px]' },
};
const PODIUM_ORDER = [2, 1, 3];

type Tabs = 'all' | 'today' | 'monthly'

const LeaderBoard = () => {

    const { t } = useTranslation();
    const contestId = useSelector(selectedContestIdSelector);
    const pathname = usePathname();
    const isDark = useIsDark();

    const isContestPage = pathname.includes('contest');
    const [activeTab, setActiveTab] = useState<Tabs>('today');

    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [leaderboardData, setLeaderboardData] = useState<ContestLeaderboardResponse>()

    const LIMIT = 20;

    const handleFetchContestLeaderboard = async (offset: number) => {
        if (!contestId) return;
        try {
            if (offset === 0) setIsLoading(true)
            else setIsLoadingMore(true)
            const response = await fetchContestLeaderboard(contestId, offset, LIMIT);
            if (response?.success) {
                setLeaderboardData(prev =>
                    offset === 0 || !prev
                        ? response.data
                        : { ...response.data, other_users_rank: [...prev.other_users_rank, ...response.data.other_users_rank] }
                )
            }
        } catch (error) {
            console.log("error", error)
        } finally {
            if (offset === 0) setIsLoading(false)
            else setIsLoadingMore(false)
        }
    }
    const handleFetchLeaderboard = async (offset: number) => {
        try {
            if (offset === 0) setIsLoading(true)
            else setIsLoadingMore(true)
            const response = await fetchLeaderboard(activeTab === 'all' ? 'global' : activeTab === 'today' ? 'daily' : 'monthly', offset, LIMIT);
            if (response?.success) {
                setLeaderboardData(prev =>
                    offset === 0 || !prev
                        ? response.data
                        : { ...response.data, other_users_rank: [...prev.other_users_rank, ...response.data.other_users_rank] }
                )
            }
        } catch (error) {
            console.log("error", error)
        } finally {
            if (offset === 0) setIsLoading(false)
            else setIsLoadingMore(false)
        }
    }

    useEffect(() => {
        if (isContestPage) {
            handleFetchContestLeaderboard(0)
        }
        else {
            handleFetchLeaderboard(0)
        }
    }, [contestId, isContestPage, activeTab])

    const isFetchingMoreRef = useRef(false)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!leaderboardData) return;
        const { pagination, other_users_rank } = leaderboardData;
        if (other_users_rank.length >= pagination.total) return;
        const target = loadMoreRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || isFetchingMoreRef.current) return;
            isFetchingMoreRef.current = true;
            const nextOffset = pagination.offset + pagination.limit;
            const fetchMore = isContestPage ? handleFetchContestLeaderboard : handleFetchLeaderboard;
            fetchMore(nextOffset).finally(() => { isFetchingMoreRef.current = false })
        }, { rootMargin: '120px' })

        observer.observe(target)
        return () => observer.disconnect()
    }, [leaderboardData, isContestPage])


    const mainBoxRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: mainBoxRef,
        offset: ["start end", "end start"],
    });
    const leaderBoxY = useTransform(scrollYProgress, [0, 0.5, 1], [400, -600, 0]);

    const podium = PODIUM_ORDER
        .map(rank => leaderboardData?.top_three_ranks.find(user => user.user_rank === rank))
        .filter((user): user is NonNullable<typeof user> => Boolean(user));

    const topThreeUserIds = new Set(leaderboardData?.top_three_ranks.map(user => user.user_id));
    const otherUsers = leaderboardData?.other_users_rank.filter(user => !topThreeUserIds.has(user.user_id)) ?? [];


    return (
        <Layout>
            <Breadcrumb firstElement={t('playArea')} secondElement={isContestPage ? t('contestPlay') : t('leaderboard')} thirdElement={isContestPage ? t('leaderboard') : ''} />
            <section className="relative surfaceContainerLowBg  pb-12 md:pb-20 overflow-hidden commonPY pt-50 commonTextContentGap">
                {/* Top banner — recolors with theme primary */}
                <div className="primaryBg flexCenter! absolute w-[140%] h-[60%] top-0 rounded-b-[20%] md:rounded-b-[50%] ml-[-20%] overflow-hidden">
                    <div
                        style={{
                            backgroundImage: `url(${heroBg.src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        className="absolute inset-0"
                    >
                    </div>
                </div>
                {
                    !isContestPage &&
                    <div className="flexCenter md:justify-end relative z-3 mx-auto -mt-32 mb-32 w-full max-w-[648px]">
                        <div className="bg-[linear-gradient(var(--primary-400)_0%,_var(--primary-400)_70%)] rounded-3xl p-2 flex items-center justify-between gap-1 w-full max-575:mx-2">
                            <Button
                                type="button"
                                fullWidth
                                variant={activeTab === 'all' ? 'secondaryShade' : 'outline'}
                                className={activeTab === 'all' ? 'px-6! border-none! shadow-none! bg-white! text-black!' : 'px-6! border-none! bg-transparent! text-white'}
                                onClick={() => setActiveTab('all')}
                            >
                                {t('allTime')}
                            </Button>
                            <Button
                                type="button"
                                fullWidth
                                variant={activeTab === 'today' ? 'secondaryShade' : 'outline'}
                                className={activeTab === 'today' ? 'px-6! border-none! shadow-none! bg-white! text-black!' : 'px-6! border-none! bg-transparent! text-white'}
                                onClick={() => setActiveTab('today')}
                            >
                                {t('today')}
                            </Button>
                            <Button
                                type="button"
                                fullWidth
                                variant={activeTab === 'monthly' ? 'secondaryShade' : 'outline'}
                                className={activeTab === 'monthly' ? 'px-6! border-none! shadow-none! bg-white! text-black!' : 'px-6! border-none! bg-transparent! text-white'}
                                onClick={() => setActiveTab('monthly')}
                            >
                                {t('monthly')}
                            </Button>
                        </div>
                    </div>
                }

                <div className={`container flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-6 ${isContestPage ? 'pt-18' : ''}`}>
                    <AdZone className="hidden lg:block flex-1 max-w-[300px] self-stretch" minWidth={250} minHeight={280} />
                    <div ref={mainBoxRef} className="flexCol gap-6 w-full max-w-[648px] mainBox">
                        {isLoading ? (
                            <LeaderboardSkeleton />
                        ) : (
                            <>
                                <div className={`${leaderboardData && leaderboardData?.top_three_ranks?.length < 3 ? 'flexCenter' : 'grid grid-cols-3'} relative z-1 ${isContestPage ? '-top-6' : ''}`}>
                                    {podium.map((item) => {
                                        const { wrapClass, roundedClass } = PODIUM_STYLES[item.user_rank] ?? PODIUM_STYLES[3];
                                        return (
                                            <div key={item.user_id} className={`${wrapClass} ${roundedClass} flexCol gap-6 relative ${leaderboardData && leaderboardData?.top_three_ranks?.length < 3 ? 'w-54' : ''}`}>
                                                <div className="flexColCenter gap-4">
                                                    <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 xl:w-38 xl:h-38 rounded-full bg-white flexCenter overflow-hidden">
                                                        <ImagePreview src={item.profile || avatar} alt={item.name} objectFit="contain" containerClassName="w-full h-full" />
                                                    </div>
                                                    <div className="flexColCenter gap-4 text-center px-3 sm:px-6">
                                                        <Typography variant="h2" className="text-white line-clamp-1 break-all">
                                                            {item.name}
                                                        </Typography>
                                                        <div className="bg-linear-to-b from-(--neutral-50) to-(--primary-100) dark:onPrimaryBg! rounded-full py-1.5 px-3 md:py-2 md:px-4 flexCenter gap-1.5 md:gap-2 shrink-0 w-max mx-auto">
                                                            <Zap className="w-5 h-5 md:w-6 md:h-6 primaryColor fill-current" />
                                                            <Typography variant="h5" className="text-sm! md:text-xl! font-extrabold md:font-bold font-nunito! leading-5 md:leading-7 text-black">
                                                                {item.score}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`bg-[linear-gradient(var(--primary-400)_0%,_var(--primary-400)_70%,_#ffffff00_100%)] flexCenter text-5xl md:text-7xl lg:text-9xl text-white p-6 md:p-8 relative z-1 max-575:h-40 h-50`}>
                                                    {
                                                        item.user_rank === 2 &&
                                                        <div className="bg-[linear-gradient(#ffffff00_0%,_#ecf9f500_70%,_#ffffff82_100%)] absolute max-575:-top-36 -top-45 w-full h-[90%] -z-1"
                                                            style={{
                                                                clipPath: 'polygon(60% 0, 110% 0, 100% 100%, 0% 100%)'
                                                            }}
                                                        />
                                                    }

                                                    {
                                                        item.user_rank === 1 &&
                                                        <div className="bg-[linear-gradient(#ffffff00_0%,_#ecf9f500_70%,_#ffffff82_100%)] absolute max-575:-top-36 -top-45 w-full h-[90%] -z-1"
                                                            style={{
                                                                clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)'
                                                            }}
                                                        />
                                                    }

                                                    {
                                                        item.user_rank === 3 &&
                                                        <div className="bg-[linear-gradient(#ffffff00_0%,_#ecf9f500_70%,_#ffffff82_100%)] absolute max-575:-top-36 -top-45 w-full h-[90%] -z-1"
                                                            style={{
                                                                clipPath: 'polygon(0 0, 50% 0, 100% 100%, 0% 100%)'
                                                            }}
                                                        />
                                                    }
                                                    {item.user_rank}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {
                                    otherUsers?.length > 0 || (leaderboardData?.my_rank) ?
                                        <motion.div
                                            className="relative z-2 rounded-3xl overflow-hidden leaderBox h-168"
                                            style={{ y: leaderBoxY }}
                                        >
                                            <div
                                                className="w-full h-full customScrollbar overflow-y-auto"
                                            >
                                                {
                                                    otherUsers.map((item) => (
                                                        <RankCard
                                                            key={item.user_id}
                                                            avatar={item.profile || avatar}
                                                            name={item.name}
                                                            streak={item.score}
                                                            rank={item.user_rank}
                                                            leaderboard={true}
                                                        />
                                                    ))
                                                }
                                                <div ref={loadMoreRef} />
                                                {
                                                    isLoadingMore &&
                                                    <div className="flexCenter py-3">
                                                        <Typography as="span" variant="caption" weight="semibold" className="font-nunito!">
                                                            {t('loading')}
                                                        </Typography>
                                                    </div>
                                                }
                                                {
                                                    leaderboardData?.my_rank && leaderboardData.my_rank.user_rank > 1 &&
                                                    <RankCard
                                                        avatar={leaderboardData.my_rank.profile || avatar}
                                                        name={t('you')}
                                                        streak={leaderboardData.my_rank.score}
                                                        rank={leaderboardData.my_rank.user_rank}
                                                        leaderboard={true}
                                                        className={`sticky! bottom-0 z-2 bg-linear-to-r from-(--primary-100) to-(--neutral-50) ${isDark ? 'bg-linear-to-r from-black/5 to-(--neutral-700)' : ''}`}
                                                    />
                                                }
                                            </div>
                                        </motion.div>
                                        :
                                        leaderboardData && leaderboardData?.top_three_ranks?.length < 1 &&
                                        <div className="surfaceContainerLowestBg rounded-2xl relative -top-36 -pt-12">
                                            <EmptyStatus />
                                        </div>
                                }
                            </>
                        )}
                    </div>
                    <AdZone className="hidden lg:block flex-1 max-w-[300px] self-stretch" minWidth={250} minHeight={280} />

                </div>
            </section>
        </Layout>
    )
}

export default LeaderBoard