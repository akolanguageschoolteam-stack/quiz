import { Skeleton } from '@/components/ui/skeleton'

const CategoryCardHorizontalSkeleton = () => {
    return (
        <div className="surfaceContainerLowestBg rounded-3xl border p-4 lg:py-4 lg:px-6 flex w-max gap-3 md:gap-4">
            <Skeleton className="w-8 h-8 md:w-13 md:h-13 rounded-[32px] shrink-0" />
            <div className="flexCol gap-1 justify-center">
                <Skeleton className="h-5 md:h-6 w-20" />
                <Skeleton className="h-4 md:h-5 w-16" />
            </div>
        </div>
    )
}

export default CategoryCardHorizontalSkeleton
