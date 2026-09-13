'use client';

export default function GlobalError({ reset }) {
    return (
        <main className="flex min-h-[70vh] items-center justify-center px-5">
            <div className="max-w-md text-center">
                <div className="text-6xl">🎁</div>
                <h1 className="mt-5 text-3xl font-extrabold">Something went wrong</h1>
                <p className="mt-3 text-slate-500">Please try again. Your cart and account data are safe.</p>
                <button type="button" onClick={() => reset()} className="mt-6 rounded-md bg-[#c92532] px-6 py-3 text-sm font-bold text-white hover:bg-[#a91d29]">
                    Try again
                </button>
            </div>
        </main>
    );
}
