import LoadingGrid from '@/components/LoadingGrid';
export default function Loading() {
  return <main className="section-pad">
  <div className="container-width">
    <div className="skeleton h-10 w-56 rounded" />
    <div className="mt-8">
      <LoadingGrid count={8} />
    </div>
</div>
</main>;
}
