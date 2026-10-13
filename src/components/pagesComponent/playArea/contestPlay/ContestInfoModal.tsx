'use client'
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useQueryClient } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/storybook/atoms/Button"
import { Typography } from "@/components/storybook/atoms/Typography"
import StatTile from "@/components/storybook/molecules/statTile"
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import { Coin, Date, PremiumCoin, User } from "@/components/common/Icons"
import { ContestItem } from "@/types/GlobalTypes"
import { RankCard } from "@/components/storybook/molecules/rankCard"
import avatar from "@/assets/avtars/guest.svg";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"
import { formatContestDate, toOrdinal } from "@/utils/contest"
import UnlockModal from "@/components/pagesComponent/playArea/quizPages/UnlockModal"
import AuthModal from "@/components/auth/AuthModal"
import LoginRequiredModal from "@/components/auth/LoginRequiredModal"
import { useAuthGate } from "@/hooks/useAuthGate"
import { joinContest } from "@/api/apiRoutes"
import { contestQuestionsQueryOptions } from "@/api/queries/contests"
import { toast } from "@/lib/toast"
import { getErrorMessage } from "@/utils/errorMessages"
import { profileSelector, setCoins, tokenSelector } from "@/redux/reducers/userSlice"
import { setSelectedContestId } from "@/redux/reducers/quizSlice"

interface ContestInfoModalProps {
    open: boolean,
    onClose: (open: boolean) => void
    contest: ContestItem
    onJoined?: () => void
    onJoiningChange?: (joining: boolean) => void
}

const ContestInfoModal = ({ open, onClose, contest, onJoined, onJoiningChange }: ContestInfoModalProps) => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const userData = useSelector(profileSelector);
    const isLoggedIn = !!useSelector(tokenSelector);

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [hasEnoughCoins, setHasEnoughCoins] = useState(true);
    const [joining, setJoining] = useState(false);
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, openAuthGate, guardPlay } = useAuthGate();

    const showResult = (contest.winners?.length ?? 0) > 0;
    const isPaid = (contest.entry_coins ?? 0) > 0;
    const isContestEnded = new globalThis.Date(contest.end_date).getTime() < globalThis.Date.now();
    const isUpcoming = new globalThis.Date(contest.start_date).getTime() > globalThis.Date.now();
    const isJoinedUpcoming = isUpcoming && contest.has_joined;
    const isJoinedLive = !isUpcoming && !isContestEnded && contest.has_joined && !contest.has_played;

    const handleJoinContest = async () => {
        if (contest.has_played) return;

        try {
            setJoining(true);
            onJoiningChange?.(true);
            const response = await joinContest(contest.id);
            dispatch(setCoins(response.data.new_coin_balance));
            queryClient.invalidateQueries({ queryKey: ["contests"] });
            setShowUnlockModal(false);

            if (isUpcoming) {
                contest.has_joined = true;
                onClose(false);
                onJoined?.();
                return;
            }

            // Fetch the questions first so a failure keeps the user here instead of
            // landing them on a broken play screen.
            await queryClient.fetchQuery(contestQuestionsQueryOptions(contest.id));

            contest.has_played = true;
            onClose(false);
            router.push(`/play-area/contest-play/play?id=${contest.id}`);
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setJoining(false);
            onJoiningChange?.(false);
        }
    };

    const handleJoinClick = () => {
        if (contest.has_played) return;

        if (!guardPlay('contest_guest_mode')) return;

        if (!isPaid) {
            handleJoinContest();
            return;
        }

        const userCoins = Number(userData?.total_coins ?? 0);
        setHasEnoughCoins(userCoins >= contest.entry_coins);
        setShowUnlockModal(true);
    };

    const handleCompletedContest = (id: number) => {
        if (!isLoggedIn) {
            openAuthGate('contest_guest_mode');
            return;
        }

        dispatch(setSelectedContestId(id));
        router.push(`/play-area/contest-play/leaderboard`);
    }

    const handleJoinedContest = async (id: number) => {
        if (joining) return;
        try {
            setJoining(true);
            // Fetch the questions first so a failure keeps the user here instead of
            // landing them on a broken play screen.
            await queryClient.fetchQuery(contestQuestionsQueryOptions(id));
            onClose(false);
            router.push(`/play-area/contest-play/play?id=${id}`);
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setJoining(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => { if (joining) return; onClose(next); }}>
            <DialogContent className="max-w-lg!">
                <div className="surfaceBrightBg rounded-[28px] gap-4 max-h-[calc(84vh)] overflow-y-auto customScrollbar flexCol p-6 ">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{contest.name}</DialogTitle>
                        <DialogDescription>{contest.description}</DialogDescription>
                    </DialogHeader>

                    <div className="relative aspect-1242/357 w-full h-48 md:h-62.5 shrink-0 overflow-hidden rounded-xl">
                        <ImagePreview src={contest.image} alt={contest.name} objectFit="cover" className="absolute w-full h-full " containerClassName="absolute inset-0 w-full h-full " />
                    </div>

                    <div className="flexCol gap-4">
                        <div className="flex items-center gap-3 flex-wrap justify-between">
                            <div className="flex items-center gap-1">
                                <Date className="primaryColor" width={16} height={16} />
                                <Typography as="span" variant="caption" weight="medium" className="font-nunito! text-xs!">
                                    {t('from')}: <span className="onSurfaceColor! font-semibold font-nunito!">{formatContestDate(contest.start_date)}</span>
                                </Typography>
                            </div>

                            {!isContestEnded && (
                                <div className="flex items-center gap-1">
                                    <Date className="primaryColor" width={16} height={16} />
                                    <Typography as="span" variant="caption" weight="medium" className="font-nunito! text-xs!">
                                        {t('to')}: <span className="onSurfaceColor! font-semibold font-nunito!">{formatContestDate(contest.end_date)}</span>
                                    </Typography>
                                </div>
                            )}
                        </div>

                        <div>
                            <Typography variant="h5" weight="extrabold" className="line-clamp-1">
                                {contest.name}
                            </Typography>
                            <Typography variant="caption" weight="medium" className="onSurfaceVarColor! font-nunito! line-clamp-2">
                                {contest.description}
                            </Typography>
                        </div>

                        <div className="grid grid-cols-2 gap-2 primaryContainerBg rounded-[12px]">
                            <StatTile
                                bg="primaryContainerBg"
                                icon={<PremiumCoin width={20} height={20} />}
                                value={String(contest.total_prize_coins)}
                                label={t('timeWins')}
                                labelColor=""
                            />
                            <StatTile
                                bg="primaryContainerBg"
                                icon={<User width={28} height={28} className="primaryColor!" />}
                                value={String(contest.participants_count)}
                                label={t('playersJoined')}
                                labelColor=""
                            />
                        </div>

                        {(!isContestEnded || showResult) && (
                            <div className="flexCol gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px bg-(--neutral-200)" />
                                    <Typography as="span" variant="caption" weight="semibold" className="font-nunito! whitespace-nowrap">
                                        {t(isContestEnded ? 'winnersHere' : 'winnersPrizePool')}
                                    </Typography>
                                    <div className="flex-1 h-px bg-(--neutral-200)" />
                                </div>

                                {
                                    isContestEnded ?
                                        <div className="grid grid-cols-1">
                                            {[...(contest.winners ?? [])].sort((a, b) => a.rank - b.rank).map((winner) => (
                                                <RankCard
                                                    key={winner.user_id}
                                                    avatar={winner.profile || avatar}
                                                    name={winner.name}
                                                    streak={winner.score}
                                                    rank={winner.rank}
                                                    contestModal={true}
                                                    coins={winner.coins}
                                                />
                                            ))}
                                        </div>
                                        :
                                        <div className="grid grid-cols-3 gap-2">
                                            {[...(contest.prizes ?? [])].sort((a, b) => a.rank - b.rank).map((prize) => (
                                                <div key={prize.rank} className="surfaceContainerLowestBg border rounded-xl p-2 flexColCenter gap-0.5">
                                                    <Coin width={24} height={24} />
                                                    <Typography variant="h6" weight="extrabold" className="font-nunito!">
                                                        {prize.coins}
                                                    </Typography>
                                                    <Typography as="span" variant="caption" weight="medium" className="font-nunito! text-xs! whitespace-nowrap">
                                                        {toOrdinal(prize.rank)} {t('rank')}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                }
                            </div>
                        )}
                        {
                            isContestEnded ?
                                <Button
                                    variant="shade"
                                    fullWidth
                                    onClick={() => {
                                        handleCompletedContest(contest.id)
                                    }}
                                >
                                    {t('viewLeaderboard')}
                                </Button>
                                :
                                <Button
                                    variant={isJoinedUpcoming || contest.has_played || isJoinedLive ? 'shade' : 'primary'}
                                    fullWidth
                                    loading={joining}
                                    leftIcon={isJoinedUpcoming || contest.has_played || isJoinedLive ? undefined : <PremiumCoin width={18} height={18} />}
                                    disabled={joining || isJoinedUpcoming}
                                    onClick={isJoinedUpcoming
                                        ? undefined
                                        : contest.has_played
                                            ? () => {
                                                handleCompletedContest(contest.id)
                                            }
                                            : isJoinedLive
                                                ? () => {
                                                    handleJoinedContest(contest.id)
                                                }
                                                : handleJoinClick}
                                >
                                    {isJoinedUpcoming || isJoinedLive
                                        ? t('joinedSuccessfully')
                                        : contest.has_played ? t('checkResult') : `${contest.entry_coins} - ${t('joinNow')}`}
                                </Button>
                        }
                    </div>
                </div>
            </DialogContent>

            <UnlockModal
                message={hasEnoughCoins ? `Use ${contest.entry_coins} ${t('coins')}?` : t('noEnoughCoinsTitle')}
                description={hasEnoughCoins ? undefined : t('noEnoughCoinsDesc')}
                buttonText={hasEnoughCoins ? t('joinNow') : t('goToCoinStore')}
                open={showUnlockModal}
                onOpenChange={setShowUnlockModal}
                loading={joining}
                onConfirm={() => {
                    if (joining) return;
                    if (hasEnoughCoins) {
                        handleJoinContest();
                    } else {
                        setShowUnlockModal(false);
                        router.push(`/profile/my-wallet`);
                    }
                }}
            />

            <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
            <LoginRequiredModal
                open={loginRequiredOpen}
                onClose={setLoginRequiredOpen}
                onGuestClick={() => setLoginRequiredOpen(false)}
                onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
            />
        </Dialog>
    )
}

export default ContestInfoModal
