import { Skeleton } from '@/components/ui/skeleton'

const VerticalCardSkeleton = () => {
    return (
        <div className="surfaceContainerLowestBg rounded-3xl border p-4 lg:py-4 lg:px-6 flexCol gap-3 md:gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
            <Skeleton className="w-11 h-11 md:w-16 md:h-16 rounded-[32px]" />
            <div className="flexCol gap-1">
                <Skeleton className="h-5 md:h-6 w-3/5" />
                <Skeleton className="h-4 md:h-5 w-2/5" />
            </div>
        </div>
    )
}

export default VerticalCardSkeleton
