const SkeletonPulse = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-[#2d3a4f] rounded-lg ${className}`} />
);

export const ResumeCardSkeleton = () => (
    <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-5 w-full">
        <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-2 flex-1">
                <SkeletonPulse className="h-5 w-32" />
                <SkeletonPulse className="h-4 w-24" />
            </div>
            <SkeletonPulse className="h-14 w-14 !rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
            <SkeletonPulse className="h-3 w-full" />
            <SkeletonPulse className="h-3 w-3/4" />
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
            <div>
                <SkeletonPulse className="h-8 w-64 mb-2" />
                <SkeletonPulse className="h-4 w-48" />
            </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#1a2035] border border-[#2d3a4f] rounded-xl p-5">
                    <SkeletonPulse className="h-4 w-20 mb-3" />
                    <SkeletonPulse className="h-7 w-16" />
                </div>
            ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
                    <SkeletonPulse className="h-5 w-40 mb-5" />
                    <div className="flex flex-col gap-4">
                        {[...Array(5)].map((_, j) => (
                            <div key={j}>
                                <div className="flex justify-between mb-1">
                                    <SkeletonPulse className="h-3 w-20" />
                                    <SkeletonPulse className="h-3 w-12" />
                                </div>
                                <SkeletonPulse className="h-2 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* Table */}
        <div className="bg-[#1a2035] border border-[#2d3a4f] rounded-2xl p-6">
            <SkeletonPulse className="h-5 w-40 mb-5" />
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 py-3 border-b border-[#2d3a4f]/50">
                    <SkeletonPulse className="h-4 w-24" />
                    <SkeletonPulse className="h-4 w-32 flex-1" />
                    <SkeletonPulse className="h-4 w-10" />
                    <SkeletonPulse className="h-4 w-10" />
                    <SkeletonPulse className="h-4 w-14" />
                </div>
            ))}
        </div>
    </div>
);

export const FeedbackSkeleton = () => (
    <div className="flex flex-col gap-8 w-full">
        {/* Summary skeleton */}
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-6">
                <div className="animate-pulse bg-gray-200 h-24 w-24 rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                    <div className="animate-pulse bg-gray-200 h-6 w-40 rounded" />
                    <div className="animate-pulse bg-gray-200 h-4 w-64 rounded" />
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3">
                        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded" />
                        <div className="animate-pulse bg-gray-200 h-6 w-12 rounded" />
                    </div>
                ))}
            </div>
        </div>

        {/* ATS skeleton */}
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="animate-pulse bg-gray-200 h-12 w-12 rounded" />
                <div className="animate-pulse bg-gray-200 h-6 w-48 rounded" />
            </div>
            <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-100 h-10 rounded-lg" />
                ))}
            </div>
        </div>

        {/* Details skeleton */}
        <div className="bg-white rounded-2xl shadow-md p-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="animate-pulse bg-gray-200 h-5 w-32 rounded" />
                    <div className="animate-pulse bg-gray-200 h-5 w-16 rounded-full" />
                </div>
            ))}
        </div>
    </div>
);

export default SkeletonPulse;
