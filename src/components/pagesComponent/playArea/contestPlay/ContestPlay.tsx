'use client'
import Layout from "@/components/layout/Layout"
import { Button } from "@/components/storybook/atoms/Button"
import { Breadcrumb } from "@/components/storybook/molecules/Breadcrumb"
import SectionInfo from "@/components/storybook/molecules/SectionInfo"
import { ContestCard } from "@/components/storybook/molecules/contestCard"
import ContestSkeleton from "@/components/skeltons/ContestSkeleton"
import EmptyStatus from "@/components/common/EmptyStatus"
import { useTranslation } from "@/hooks/useTranslation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import ContestInfoModal from "./ContestInfoModal"
import { fetchContests } from "@/api/apiRoutes"
import type { ContestItem, ContestPlayType, Pagination } from "@/types/GlobalTypes"
import { daysUntil, formatContestDate, toOrdinal } from "@/utils/contest"
import { getContentTypeId } from "@/api/apiMiddleware"

type ContestPlayTab = 'upcoming' | 'ongoing' | 'completed'

const stepTransition = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const contestApiType: Record<ContestPlayTab, string> = {
    upcoming: 'upcoming',
    ongoing: 'live',
    completed: 'past',
}

const mapContestToPlayType = (contest: ContestItem): ContestPlayType => ({
    img: contest.image,
    title: contest.name,
    description: contest.description ?? '',
    entryFee: contest.entry_coins,
    players: String(contest.participants_count),
    joinFee: contest.entry_coins,
    days: daysUntil(contest.start_date),
    fromDate: formatContestDate(contest.start_date),
    toDate: formatContestDate(contest.end_date),
    timeWins: contest.total_prize_coins,
    playersJoined: String(contest.participants_count),
    prizePool: (contest.prizes ?? []).map((prize) => ({ rank: toOrdinal(prize.rank), amount: prize.coins })),
    hasPlayed: contest.has_played,
    hasJoined: contest.has_joined,
})

const ContestPlay = () => {

    const { t } = useTranslation();

    const LIMIT = 9;

    const [activeTab, setActiveTab] = useState<ContestPlayTab>('ongoing');
    const [contestInfoModal, setContestInfoModal] = useState(false);
    const [contests, setContests] = useState<ContestItem[]>([])
    const [pagination, setPagination] = useState<Pagination>({ total: 0, offset: 0, limit: LIMIT })
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [selectedContest, setSelectedContest] = useState<ContestItem | null>(null)
    const [joiningContestId, setJoiningContestId] = useState<number | null>(null)

    const contentTypeId = getContentTypeId();

    useEffect(() => {
        setContests([])
        setPagination({ total: 0, offset: 0, limit: LIMIT })
        handleFetchContests(0)
    }, [activeTab])

    const handleFetchContests = async (offset: number) => {
        try {
            if (offset === 0) setIsLoading(true)
            const response = await fetchContests(contestApiType[activeTab], offset, LIMIT, contentTypeId)
            if (response?.success) {
                setContests(prev => offset === 0 ? response.data.contests : [...prev, ...response.data.contests])
                setPagination(response.data.pagination)
            }
        } catch (error) {
            console.log("error", error)
        } finally {
            if (offset === 0) setIsLoading(false)
        }
    }

    const handleRefreshContests = async () => {
        try {
            const limit = Math.max(contests.length, LIMIT)
            const response = await fetchContests(contestApiType[activeTab], 0, limit)
            if (response?.success) {
                setContests(response.data.contests)
                setPagination(response.data.pagination)
            }
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleLoadMore = async () => {
        const nextOffset = pagination.offset + LIMIT
        setIsLoadingMore(true)
        await handleFetchContests(nextOffset)
        setIsLoadingMore(false)
    }

    const hasMore = contests.length < pagination.total

    return (
        <Layout>
            <Breadcrumb firstElement={t('playArea')} secondElement={t('contestPlay')} />
            <section className={`commonPY surfaceContainerLowestBg`}>
                <div className="container commonTextContentGap">
                    <div className="flex items-center justify-center sm:justify-between flex-wrap gap-4">
                        <div className="max-md:mx-auto">
                            <SectionInfo title={t('contestPlay')} isCenter={false} />
                        </div>
                        <div className="flexCenter md:justify-end">
                            <div className="commonBg rounded-3xl p-2 inline-flex border gap-1">
                                <Button
                                    type="button"

                                    variant={activeTab === 'upcoming' ? 'secondary' : 'outline'}
                                    className={activeTab === 'upcoming' ? 'px-3 sm:px-6! border-none! shadow-none!' : 'px-3 sm:px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('upcoming')}
                                >
                                    {t('upcoming')}
                                </Button>
                                <Button
                                    type="button"

                                    variant={activeTab === 'ongoing' ? 'secondary' : 'outline'}
                                    className={activeTab === 'ongoing' ? 'px-3 sm:px-6! border-none! shadow-none!' : 'px-3 sm:px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('ongoing')}
                                >
                                    {t('onGoing')}
                                </Button>
                                <Button
                                    type="button"

                                    variant={activeTab === 'completed' ? 'secondary' : 'outline'}
                                    className={activeTab === 'completed' ? 'px-3 sm:px-6! border-none! shadow-none!' : 'px-3 sm:px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('completed')}
                                >
                                    {t('completed')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            {...stepTransition}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 "
                        >
                            {isLoading ? (
                                Array.from({ length: LIMIT }).map((_, idx) => <ContestSkeleton key={idx} />)
                            ) : contests.length === 0 ? (
                                <EmptyStatus className="col-span-full" />
                            ) : contests.map((contest) => (
                                <ContestCard
                                    key={contest.id}
                                    contest={mapContestToPlayType(contest)}
                                    badgeLabel={activeTab === 'upcoming' && daysUntil(contest.start_date) > 0 ? `${t('startingIn')} ${daysUntil(contest.start_date)} ${t('days')}` : undefined}
                                    entryFeeLabel={t('entryFee')}
                                    playersLabel={t('players')}
                                    joinNowLabel={t('joinNow')}
                                    checkResultLabel={t('checkResult')}
                                    viewLeaderboardLabel={t('viewLeaderboard')}
                                    joinedSuccessfullyLabel={t('joinedSuccessfully')}
                                    isCompleted={activeTab === 'completed'}
                                    isUpcoming={activeTab === 'upcoming'}
                                    isJoining={joiningContestId === contest.id}
                                    onCardClick={() => {
                                        setSelectedContest(contest)
                                        setContestInfoModal(true)
                                    }}
                                    onJoin={() => {
                                        setSelectedContest(contest)
                                        setContestInfoModal(true)
                                    }}
                                    onCheckResult={() => {
                                        setSelectedContest(contest)
                                        setContestInfoModal(true)
                                    }}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                    {hasMore && (
                        <div className="flexCenter">
                            <Button
                                variant="secondary"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? t('loading') : t('loadMore')}
                            </Button>
                        </div>
                    )}
                </div>
                {selectedContest && (
                    <ContestInfoModal
                        open={contestInfoModal}
                        onClose={setContestInfoModal}
                        contest={selectedContest}
                        onJoined={handleRefreshContests}
                        onJoiningChange={(joining) => setJoiningContestId(joining ? selectedContest.id : null)}
                    />
                )}
            </section>
        </Layout>
    )
}

export default ContestPlay
