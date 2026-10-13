import { Skeleton } from '@/components/ui/skeleton'

const ExamCardSkeleton = () => {
    return (
        <div className="surfaceContainerLowestBg rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 border shadow-[0px_8px_32px_0px_#0000000A]">
            <Skeleton className="rounded-xl shrink-0 w-14 h-14 md:w-16 md:h-16" />
            <div className="flexCol gap-1.5 min-w-0 flex-1">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
            </div>
        </div>
    )
}

export default ExamCardSkeleton
