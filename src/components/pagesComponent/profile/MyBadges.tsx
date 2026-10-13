'use client'

import { useTranslation } from "@/hooks/useTranslation";
import ProfileLayout from "./ProfileLayout"
import { Typography } from "@/components/storybook/atoms/Typography";
import { EliteWinner } from "@/components/common/Icons";
import { useIsMobile } from "@/hooks/useMobile";
import { motion } from "motion/react";
import { itemVariants, listVariants } from "@/lib/motionVariants";
import { useQuery } from "@tanstack/react-query";
import { fetchBadgesList } from "@/api/apiRoutes";
import { useEffect, useState } from "react";
import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import BadgeDetails from "@/components/modals/BadgeDetails";
import { BadgeItem } from "@/types/GlobalTypes";
import MyBadgesSkeleton from "@/components/skeltons/MyBadgesSkeleton";
import EmptyStatus from "@/components/common/EmptyStatus";

const BADGES = [
    { key: 'eliteWinner', label: 'Elite Winner' },
    { key: 'risingStar', label: 'Rising Star' },
    { key: 'hunterPlayer', label: 'Hunter Player' },
    { key: 'omniQuizzer', label: 'Omni Quizzer' },
    { key: 'quizHunter', label: 'Quiz Hunter' },
    { key: 'quickNinja', label: 'Quick Ninja' },
    { key: 'streamMaster', label: 'Stream Master' },
    { key: 'quizFlight', label: 'Quiz Flight' },
    { key: 'mathsNinja', label: "Math's Ninja" },
    { key: 'scienceStar', label: 'Science Star' },
]

const MyBadges = () => {

    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

    const { data: badgesData, isLoading, isError, error } = useQuery({
        queryKey: ['badges'],
        queryFn: async () => (await fetchBadgesList()).data,
        staleTime: 5 * 60 * 1000, // 5 min
    })

    useEffect(() => {
        if (isError) {
            console.log("badgesData Error => ", error?.message);
        }
    }, [isError]);

    return (
        <ProfileLayout title={t('myBadges')} desc={t('myBadgesDesc')} >
            <div className="surfaceContainerLowestBg rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A] p-4 sm:p-6">
                <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" variants={listVariants} initial="hidden" animate="show">
                    {
                        isLoading ?
                            <MyBadgesSkeleton />
                            :
                            !badgesData || badgesData.length === 0 ?
                                <EmptyStatus className="col-span-full" />
                                :
                            badgesData.map((badge) => (
                                <motion.div key={badge?.id} variants={itemVariants} onClick={() => setSelectedBadge(badge)} className="flexColCenter gap-2 text-center cursor-pointer">
                                    <div className={`relative ${badge?.is_unlocked ? 'primaryBg' : 'bg-[#7E7E7E]'} h-25 w-25`} style={{
                                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'

                                    }}>
                                        <div className="w-14 h-16 md:w-16 md:h-18.5 absolute! inset-0 m-auto z-1">
                                            <ImagePreview src={badge?.icon} alt={badge?.label} className={` `} />
                                        </div>
                                    </div>
                                    <Typography variant="caption" weight="semibold" className="font-nunito!">
                                        {badge?.label}
                                    </Typography>
                                </motion.div>
                            ))}
                </motion.div>
            </div>

            <BadgeDetails open={!!selectedBadge} onClose={() => setSelectedBadge(null)} badge={selectedBadge} />
        </ProfileLayout>
    )
}

export default MyBadges
