'use client'

import { Skeleton } from '@/components/ui/skeleton'

const MyBadgesSkeleton = () => {
    return (
        <>
            {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="flexColCenter gap-2 text-center">
                    <Skeleton
                        className="h-25 w-25 rounded-none"
                        style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
                    />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </>
    )
}

export default MyBadgesSkeleton
