export default function ErrorState({
  onRetry,
  title = 'Something went wrong',
  description = 'We could not load this section. Please try again.'
}) {
  return <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-12 text-center">
  <div className="text-4xl">⚠️</div>
  <h2 className="mt-4 text-xl font-extrabold text-slate-900">{title}</h2>
  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
            {onRetry ? <button type="button" onClick={onRetry} className="mt-5 rounded-md bg-[#c92532] px-5 py-3 text-sm font-bold text-white hover:bg-[#a91d29]">
                    Try again
  </button> : null}
</div>;
}
