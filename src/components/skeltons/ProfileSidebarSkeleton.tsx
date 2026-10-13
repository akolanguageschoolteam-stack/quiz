import { Skeleton } from '@/components/ui/skeleton'

const ProfileSidebarSkeleton = () => {
    return (
        <div className="flexCol gap-6 surfaceContainerLowestBg max-1199:p-4 p-6 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A]">
            <div className="grid max-md:grid-cols-1! max-1199:grid-cols-2 lg:grid-cols-1 gap-6">
                {/* profile */}
                <div className="flex items-center gap-6">
                    <Skeleton className="w-12 h-12 sm:w-25 sm:h-25 rounded-full shrink-0" />
                    <div className="flexCol gap-1 min-w-0">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-8 w-28 rounded-full mt-2" />
                    </div>
                </div>

                {/* coins rewards */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="warningContainerBg p-2 rounded-2xl flex items-center gap-3 max-1199:h-max">
                        <Skeleton className="w-8 h-8 shrink-0 rounded-full" />
                        <div className="flexCol gap-1">
                            <Skeleton className="h-6 w-8" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>

                    <div className="blueContainerBg p-2 rounded-2xl flex items-center gap-3 max-1199:h-max">
                        <Skeleton className="w-8 h-8 shrink-0 rounded-full" />
                        <div className="flexCol gap-1">
                            <Skeleton className="h-6 w-8" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>
            </div>

            {/* badges */}
            <div className="max-1199:hidden! lg:flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center -space-x-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Skeleton key={idx} className="w-9 h-10.5 rounded-none shrink-0" />
                        ))}
                    </div>
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    )
}

export default ProfileSidebarSkeleton
