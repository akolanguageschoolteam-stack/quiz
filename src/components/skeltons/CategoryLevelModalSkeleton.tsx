import { Skeleton } from '@/components/ui/skeleton'

const CategoryLevelModalSkeleton = () => {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--neutral-300)">
            {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 py-4 border-b border-(--neutral-200) last:border-b-0">
                    <Skeleton className="w-8 h-8 shrink-0 rounded-md" />
                    <div className="flexCol gap-1 min-w-0 flex-1">
                        <Skeleton className="h-5 w-2/5" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="w-10 h-10 shrink-0 rounded-full" />
                </div>
            ))}
        </div>
    )
}

export default CategoryLevelModalSkeleton
