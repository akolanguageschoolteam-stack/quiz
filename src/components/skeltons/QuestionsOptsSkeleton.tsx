'use client'

import { Skeleton } from '@/components/ui/skeleton'

const QuestionsOptsSkeleton = () => {
    return (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Question */}
            <div className="surfaceContainerLowestBg rounded-[42px] p-6 md:p-8 shadow-[0px_8px_32px_0px_#0000000A] flexCol gap-3">
                <Skeleton className="h-5 md:h-7 w-full" />
                <Skeleton className="h-5 md:h-7 w-4/5" />
                <Skeleton className="h-5 md:h-7 w-3/5" />
            </div>

            {/* Options */}
            <div className="surfaceContainerLowestBg rounded-[42px] p-4 md:p-6 flexCol gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="w-full flex items-center gap-4 p-3 md:p-4 rounded-2xl"
                    >
                        <Skeleton className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full" />
                        <Skeleton className="h-5 md:h-7 flex-1" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default QuestionsOptsSkeleton
