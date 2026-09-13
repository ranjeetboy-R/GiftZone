import Link from 'next/link';

export default function EmptyState({ title = 'Nothing here yet', description = 'There is nothing to show right now.', actionHref, actionLabel }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="text-5xl">🎁</div>
            <h2 className="mt-5 text-xl font-extrabold text-slate-900">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
            {actionHref && actionLabel ? (
                <Link href={actionHref} className="mt-6 inline-flex rounded-md bg-[#c92532] px-5 py-3 text-sm font-bold text-white hover:bg-[#a91d29]">
                    {actionLabel}
                </Link>
            ) : null}
        </div>
    );
}
