'use client'

import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import ProfileLayout from "./ProfileLayout"
import { Typography } from "@/components/storybook/atoms/Typography"
import { PremiumCoin } from "@/components/common/Icons"
import { motion } from "motion/react"
import { itemVariants, listVariants } from "@/lib/motionVariants"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchBadgesList, submitRewardClaim } from "@/api/apiRoutes"
import { useDispatch, useSelector } from "react-redux"
import { profileSelector, setCoins } from "@/redux/reducers/userSlice"
import { toast } from "@/lib/toast"
import { getErrorMessage } from "@/utils/errorMessages"
import type { BadgeItem } from "@/types/GlobalTypes"

import EmptyStatus from "@/components/common/EmptyStatus"
import { formatCoins } from "@/lib/helper"

const GIFT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='white' stroke-width='1.4' opacity='0.35'%3E%3Crect x='19' y='25' width='22' height='18' rx='2'/%3E%3Cline x1='30' y1='25' x2='30' y2='43'/%3E%3Cline x1='19' y1='32' x2='41' y2='32'/%3E%3Cpath d='M30 25c-3-7-11-7-11-1.5 0 2.5 3.5 2.5 5.5 1.5M30 25c3-7 11-7 11-1.5 0 2.5-3.5 2.5-5.5 1.5'/%3E%3Ccircle cx='8' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Cpath d='M46 10l1.2 2.6L50 14l-2.8 1.4L46 18l-1.2-2.6L42 14l2.8-1.4z'/%3E%3C/g%3E%3C/svg%3E")`

const Rewards = () => {

    const { t } = useTranslation();
    const userData = useSelector(profileSelector)
    const dispatch = useDispatch()
    const queryClient = useQueryClient()

    const [claimingIds, setClaimingIds] = useState<number[]>([]);

    const { data: badgesData, isLoading, isError, error } = useQuery({
        queryKey: ['badges'],
        queryFn: async () => (await fetchBadgesList()).data,
        staleTime: 5 * 60 * 1000, // 5 min
    })

    useEffect(() => {
        if (isError) {
            console.log("badgesData Error => ", error?.message);
        }
    }, [isError, error]);

    const unlockedBadges = badgesData?.filter((badge) => badge?.is_unlocked) ?? [];

    const handleClaimReward = async (badge: BadgeItem) => {
        if (!badge?.is_unlocked || badge?.is_reward_claimed) return;
        setClaimingIds((prev) => [...prev, badge.id]);
        try {
            const response = await submitRewardClaim({ badge_id: badge.id });
            if (response?.success) {
                dispatch(setCoins(response.data.new_coin_balance));
                queryClient.invalidateQueries({ queryKey: ['badges'] });
            } else {
                toast.error(t('somethingWentWrong'));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setClaimingIds((prev) => prev.filter((id) => id !== badge.id));
        }
    }

    return (
        <ProfileLayout title={t('rewards')} desc={t('rewardsDesc')}>
            <div className="flexCol gap-6">
                <div className="surfaceContainerLowestBg rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A] p-6 sm:p-8 flexColCenter gap-2">
                    <PremiumCoin width={48} height={48} />
                    <Typography variant="h2" weight="bold">{formatCoins(userData?.total_coins ?? 0)} {t('coins')}</Typography>
                    <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{t('earnedAsRewards')}</Typography>
                </div>

                <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" variants={listVariants} initial="hidden" animate="show">
                    {isLoading ? (
                        <></>
                    ) : unlockedBadges.length === 0 ? (
                        <EmptyStatus className="col-span-full" />
                    ) : (
                        unlockedBadges.map((reward) => {
                            const isRevealed = reward?.is_unlocked && reward?.is_reward_claimed;
                            const isClaiming = claimingIds.includes(reward.id);
                            return (
                                <motion.div key={reward.id} variants={itemVariants} className="aspect-square perspective-distant">
                                    <motion.div
                                        className="relative w-full h-full transform-3d"
                                        animate={{ rotateY: isRevealed ? 180 : 0 }}
                                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                                    >
                                        <button
                                            type="button"
                                            aria-label="Reveal reward"
                                            disabled={isRevealed || isClaiming}
                                            onClick={() => handleClaimReward(reward)}
                                            className="primaryBg rounded-3xl absolute inset-0 w-full h-full backface-hidden disabled:cursor-default cursor-pointer disabled:opacity-60 flexColCenter"
                                            style={{ backgroundImage: GIFT_PATTERN, backgroundRepeat: 'repeat', backgroundSize: '60px 60px' }}
                                        >
                                            {!isRevealed && (
                                                <div className="surfaceContainerLowestBg w-full py-2 px-3 text-center">
                                                    <Typography variant="desc2" weight="bold" className="onSurfaceColor! font-nunito!">
                                                        {t('tapToReveal')}
                                                    </Typography>
                                                </div>
                                            )}
                                        </button>
                                        <div
                                            className="surfaceContainerLowestBg rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A] absolute inset-0 w-full h-full backface-hidden flexColCenter gap-1 p-3 text-center"
                                            style={{ transform: 'rotateY(180deg)' }}
                                        >
                                            <PremiumCoin width={32} height={32} />
                                            <Typography variant="h6" weight="bold">{reward?.reward} {t('coins')}</Typography>
                                            <Typography variant="caption" className="onSurfaceVarColor! font-nunito! text-xs! line-clamp-2">
                                                {reward?.note}
                                            </Typography>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )
                        })
                    )}
                </motion.div>
            </div>
        </ProfileLayout>
    )
}

export default Rewards
