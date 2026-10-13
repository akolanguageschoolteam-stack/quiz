import { Skeleton } from '@/components/ui/skeleton'

const PODIUM_STYLES: Record<number, { wrapClass: string; roundedClass: string }> = {
    1: { wrapClass: '-mt-20 md:-mt-30', roundedClass: 'rounded-t-[32px]' },
    2: { wrapClass: '', roundedClass: 'rounded-l-[32px]' },
    3: { wrapClass: '', roundedClass: 'rounded-r-[32px]' },
}
const PODIUM_ORDER = [2, 1, 3]

const LeaderboardSkeleton = () => {
    return (
        <div className="flexCol gap-6 w-full max-w-[648px] mainBox">
            <div className="grid grid-cols-3 relative z-1">
                {PODIUM_ORDER.map((rank) => {
                    const { wrapClass, roundedClass } = PODIUM_STYLES[rank]
                    return (
                        <div key={rank} className={`${wrapClass} ${roundedClass} flexCol gap-6 relative overflow-hidden`}>
                            <div className="flexColCenter gap-4">
                                <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 xl:w-38 xl:h-38 rounded-full shrink-0" />
                                <div className="flexColCenter gap-4">
                                    <Skeleton className="h-6 md:h-8 w-20 md:w-28" />
                                    <Skeleton className="h-7 md:h-9 w-16 md:w-20 rounded-full" />
                                </div>
                            </div>
                            <Skeleton className="max-575:h-40 h-50 rounded-none" />
                        </div>
                    )
                })}
            </div>

            <div className="relative z-2 rounded-3xl overflow-hidden leaderBox h-168 surfaceContainerLowestBg">
                {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="border-b last:border-b-0 p-3 md:p-6 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-6 min-w-0">
                            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0" />
                            <div className="flexCol gap-1.5 min-w-0">
                                <Skeleton className="h-4 w-24 md:w-32" />
                                <Skeleton className="h-3.5 w-10" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-12 rounded-full shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeaderboardSkeleton
