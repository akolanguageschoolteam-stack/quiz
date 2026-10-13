'use client'

import { useTranslation } from "@/hooks/useTranslation";
import ProfileLayout from "./ProfileLayout"
import { Typography } from "@/components/storybook/atoms/Typography";
import { Button } from "@/components/storybook/atoms/Button";
import { motion } from "motion/react";
import { itemVariants, listVariants } from "@/lib/motionVariants";
import { fetchCoinHistory } from "@/api/apiRoutes";
import EmptyStatus from "@/components/common/EmptyStatus";
import { formateDate } from "@/lib/helper";
import HorizontalCardSkeleton from "@/components/skeltons/HorizontalCardSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";

const LIMIT = 10;

const CoinHistory = () => {

    const { t } = useTranslation();

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['coinHistory'],
        queryFn: async ({ pageParam }) => (await fetchCoinHistory(pageParam, LIMIT)).data,
        initialPageParam: 0,
        staleTime: 5 * 60 * 1000, // 5 min
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.pagination.offset + lastPage.pagination.limit
            return nextOffset < lastPage.pagination.total ? nextOffset : undefined
        },
    })

    const transactions = data?.pages.flatMap((page) => page.transactions) ?? []

    return (
        <ProfileLayout title={t('coinsHistory')} desc={t('coinsHistoryDesc')}>
            <motion.div className="flexCol gap-4" variants={listVariants} initial="hidden" animate="show">
                {
                    isLoading ?
                        Array.from({ length: 5 }).map((_, idx) => (
                            <HorizontalCardSkeleton examCard key={idx}/>
                        ))
                        :
                        transactions.length > 0 ?
                            transactions.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="surfaceContainerLowestBg rounded-2xl p-4 sm:p-5 shadow-[0px_8px_32px_0px_#0000000A] flex items-center justify-between gap-3"
                                >
                                    <div>
                                        <Typography variant="h6" weight="bold">{item?.description}</Typography>
                                        <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{formateDate(item?.created_at)}</Typography>
                                    </div>
                                    <div className={`py-1.5 px-3 shrink-0 ${item?.type == "credit" ? 'successContainerBg' : 'bg-[#FFEEEF]'}`}>
                                        <Typography variant="h6" weight="bold" className={item?.type == "credit" ? 'successColor!' : 'errorColor!'}>
                                            {item?.type == "credit" ? '+' : '-'}{item?.amount}
                                        </Typography>
                                    </div>
                                </motion.div>
                            ))
                            :
                            <EmptyStatus />
                }
            </motion.div>
            {
                hasNextPage && (
                    <div className="flexCenter mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? t('loading') : t('loadMore')}
                        </Button>
                    </div>
                )
            }
        </ProfileLayout >
    )
}

export default CoinHistory
