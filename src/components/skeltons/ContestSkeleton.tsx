import { Skeleton } from '@/components/ui/skeleton'

const ContestSkeleton = () => {
    return (
        <div className="surfaceContainerLowestBg rounded-3xl overflow-hidden shadow-[0px_8px_32px_0px_#0000000A] flexCol border">
            <Skeleton className="relative aspect-16/10 w-full shrink-0 rounded-none" />

            <div className="p-4 md:p-5 flexCol gap-4">
                <div className="flexCol gap-1.5">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-full" />
                </div>

                <div className="flex items-center gap-3 justify-between">
                    <Skeleton className="h-5 w-2/5" />
                    <div className="w-0.5 h-6 bg-(--neutral-200) shrink-0" />
                    <Skeleton className="h-5 w-2/5" />
                </div>

                <Skeleton className="h-11 w-full rounded-full" />
            </div>
        </div>
    )
}

export default ContestSkeleton
