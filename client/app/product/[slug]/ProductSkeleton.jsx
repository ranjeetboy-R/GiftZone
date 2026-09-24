export default function ProductSkeleton() {
    return (
        <div className="container-width animate-pulse py-8 md:py-12">
            {/* Breadcrumb Skeleton */}
            <div className="mb-6 flex items-center gap-2">
                <div className="h-3 w-12 rounded bg-slate-200" />
                <div className="h-3 w-3 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-3 w-3 rounded bg-slate-200" />
                <div className="h-3 w-32 rounded bg-slate-200" />
            </div>

            {/* Main Product Section */}
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Product Images */}
                <div className="aspect-square overflow-hidden rounded-3xl bg-slate-200" />

                {/* Product Information */}
                <div className="flex flex-col">
                    {/* Category */}
                    <div className="h-4 w-32 rounded bg-slate-200" />

                    {/* Title */}
                    <div className="mt-4 space-y-3">
                        <div className="h-8 w-full rounded-lg bg-slate-200" />
                        <div className="h-8 w-4/5 rounded-lg bg-slate-200" />
                    </div>

                    {/* Rating */}
                    <div className="mt-5 flex items-center gap-3">
                        <div className="h-8 w-24 rounded-full bg-slate-200" />
                        <div className="h-4 w-28 rounded bg-slate-200" />
                    </div>

                    {/* Price */}
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-10 w-32 rounded-lg bg-slate-200" />
                        <div className="h-6 w-24 rounded bg-slate-200" />
                    </div>

                    {/* Description */}
                    <div className="mt-6 space-y-3">
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-11/12 rounded bg-slate-200" />
                        <div className="h-4 w-4/5 rounded bg-slate-200" />
                    </div>

                    {/* Divider */}
                    <div className="my-7 h-px w-full bg-slate-200" />

                    {/* Quantity */}
                    <div>
                        <div className="mb-3 h-4 w-20 rounded bg-slate-200" />

                        <div className="h-12 w-36 rounded-xl bg-slate-200" />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="h-14 rounded-2xl bg-slate-200" />
                        <div className="h-14 rounded-2xl bg-slate-200" />
                    </div>

                    {/* Delivery Info */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="h-20 rounded-2xl bg-slate-100" />
                        <div className="h-20 rounded-2xl bg-slate-100" />
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
                <div className="h-6 w-40 rounded bg-slate-200" />

                <div className="mt-6 space-y-3">
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-10/12 rounded bg-slate-200" />
                    <div className="h-4 w-9/12 rounded bg-slate-200" />
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-12">
                <div className="h-7 w-48 rounded bg-slate-200" />

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                            <div className="aspect-square bg-slate-200" />

                            <div className="space-y-3 p-4">
                                <div className="h-4 w-4/5 rounded bg-slate-200" />
                                <div className="h-5 w-24 rounded bg-slate-200" />
                                <div className="h-10 w-full rounded-xl bg-slate-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}