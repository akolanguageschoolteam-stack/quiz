import { Skeleton } from '@/components/ui/skeleton'


interface HorizontalCardSkeletonProps {
    examCard?: boolean,
}

const HorizontalCardSkeleton = ({ examCard = false }: HorizontalCardSkeletonProps) => {
    return (
        <div className={`surfaceContainerLowestBg flex flex-wrap md:flex-nowrap items-center justify-between gap-5.5 rounded-3xl p-4 lg:p-6 h-full ${examCard ? 'p-4! flex-row-reverse border' : 'border-2! commonBorderB'}`}>
            <div className="flexCol gap-2 sm:gap-4 flex-1 min-w-0">
                {
                    !examCard &&
                    <Skeleton className="h-5 lg:h-6 w-2/5" />
                }
                <div className="flexCol gap-1.5 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/5" />
                </div>
            </div>
            <div className="max-375:justify-end max-375:flex max-375:w-full">
                <Skeleton className={`${examCard ? 'w-10 lg:w-16 h-10 lg:h-16' : 'w-20 lg:w-25 h-20 lg:h-25'} rounded-2xl`} />
            </div>
        </div>
    )
}

export default HorizontalCardSkeleton
