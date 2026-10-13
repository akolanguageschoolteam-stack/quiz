'use client'

import { Skeleton } from '@/components/ui/skeleton'

const CARD_CLASS = 'surfaceContainerLowestBg p-4 sm:p-6 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A]'

const StatisticsSkeleton = () => {
    return (
        <div className="flexCol gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="flexCol gap-6">
                    {/* questions details */}
                    <div className={`${CARD_CLASS} flexCol gap-6`}>
                        <div className="flexCol gap-1.5">
                            <Skeleton className="h-6 w-2/5" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex items-center flex-wrap gap-6">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="flexCol gap-1.5">
                                    <Skeleton className="h-6 w-10" />
                                    <Skeleton className="h-4 w-14" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="flexCol gap-1.5">
                                    <Skeleton className="h-6 w-10" />
                                    <Skeleton className="h-4 w-14" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-7 w-12 rounded-full shrink-0" />
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    </div>

                    {/* earned badges */}
                    <div className={`${CARD_CLASS} flexCol gap-6`}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flexCol gap-1.5">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-14 shrink-0" />
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <Skeleton key={idx} className="w-10 h-12 sm:w-13 sm:h-15 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* battle overview */}
                <div className={`${CARD_CLASS} flexCol gap-6 justify-between py-4!`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flexCol gap-6">
                            <div className="flexCol gap-1.5">
                                <Skeleton className="h-6 w-36" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flexCol gap-2">
                                    <Skeleton className="h-6 w-10" />
                                    <div className="flexCenter gap-2">
                                        <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                                <div className="flexCol gap-2">
                                    <Skeleton className="h-6 w-10" />
                                    <div className="flexCenter gap-2">
                                        <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0" />
                    </div>

                    <div className="commonBg rounded-2xl p-3 grid grid-cols-3 gap-4">
                        <div className="flexCol gap-1.5">
                            <Skeleton className="h-5 w-14" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="surfaceContainerLowestBg rounded-xl py-1 px-4 flexCol gap-1.5">
                            <Skeleton className="h-5 w-8" />
                            <Skeleton className="h-4 w-14" />
                        </div>
                        <div className="surfaceContainerLowestBg rounded-xl py-1 px-4 flexCol gap-1.5">
                            <Skeleton className="h-5 w-8" />
                            <Skeleton className="h-4 w-14" />
                        </div>
                    </div>

                    <div className="primaryContainerBg rounded-2xl p-4 flexCol gap-4 -mt-2">
                        <div className="flexCol gap-1.5">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="flexCol gap-1.5">
                                    <Skeleton className="h-5 w-6" />
                                    <Skeleton className="h-3.5 w-12" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className={`${CARD_CLASS} flexCol gap-4`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flexCol gap-1.5">
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-6 w-12 rounded-full shrink-0" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StatisticsSkeleton
