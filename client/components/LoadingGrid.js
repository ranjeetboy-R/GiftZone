export default function LoadingGrid({
  count = 8
}) {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({
      length: count
    }, (_, index) =>
  <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div className="skeleton h-52 w-full" />
    <div className="space-y-3 p-4">
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-3 w-2/5 rounded" />
      <div className="skeleton h-5 w-1/3 rounded" />
      <div className="skeleton h-10 w-full rounded-md" />
    </div>
</div>)}
</div>;
}
