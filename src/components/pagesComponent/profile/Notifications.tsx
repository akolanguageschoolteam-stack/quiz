'use client'

import { useTranslation } from "@/hooks/useTranslation";
import ProfileLayout from "./ProfileLayout";
import { Typography } from "@/components/storybook/atoms/Typography";
import { Button } from "@/components/storybook/atoms/Button";
import { motion } from "motion/react";
import { itemVariants, listVariants } from "@/lib/motionVariants";
import { fetchNotificationList } from "@/api/apiRoutes";
import EmptyStatus from "@/components/common/EmptyStatus";
import { formatRelativeTime } from "@/lib/helper";
import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import { useInfiniteQuery } from "@tanstack/react-query";
import HorizontalCardSkeleton from "@/components/skeltons/HorizontalCardSkeleton";

const LIMIT = 10;

const Notifications = () => {

    const { t } = useTranslation();

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: async ({ pageParam }) => (await fetchNotificationList(pageParam, LIMIT)).data,
        initialPageParam: 0,
        staleTime: 5 * 60 * 1000, // 5 min
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.pagination.offset + lastPage.pagination.limit
            return nextOffset < lastPage.pagination.total ? nextOffset : undefined
        },
    })

    const notifications = data?.pages.flatMap((page) => page.items) ?? []

    return (
        <ProfileLayout title={t('notifications')} desc={t('notificationsDesc')}>
            <motion.div className="flexCol gap-4" variants={listVariants} initial="hidden" animate="show">
                {
                    isLoading ?
                        Array.from({ length: 5 }).map((_, idx) => (
                            <HorizontalCardSkeleton examCard key={idx} />
                        ))
                        :
                        notifications.length > 0 ?
                            notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    variants={itemVariants}
                                    className="surfaceContainerLowestBg rounded-2xl p-4 sm:p-5 shadow-[0px_8px_32px_0px_#0000000A] flex items-center gap-4 border"
                                >
                                    {notification.image ? (
                                        <ImagePreview
                                            src={notification.image}
                                            alt={notification.title}
                                            rounded="2xl"
                                            objectFit="cover"
                                            containerClassName="w-12 h-12 sm:w-14 sm:h-14 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flexCenter shrink-0 text-2xl blueContainerBg">
                                            🔔
                                        </div>
                                    )}
                                    <div className="flexCol gap-1 min-w-0">
                                        <Typography variant="h5" weight="bold" className="line-clamp-2">
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="caption" weight="semibold" className="onSurfaceVarColor! font-nunito!">
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" weight="bold" className="font-nunito! text-sm!">
                                            {formatRelativeTime(notification.sent_at)}
                                        </Typography>
                                    </div>
                                </motion.div>
                            ))
                            :
                            <EmptyStatus />
                }
            </motion.div>
            {hasNextPage && (
                <div className="flexCenter mt-6">
                    <Button
                        variant="secondary"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? t('loading') : t('loadMore')}
                    </Button>
                </div>
            )}
        </ProfileLayout>
    )
}

export default Notifications
