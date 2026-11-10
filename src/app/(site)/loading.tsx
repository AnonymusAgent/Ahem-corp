export default function Loading() {
  return (
    <div className="section bg-white" aria-busy="true" aria-label="Loading">
      <div className="wrap">
        <div className="h-4 w-40 animate-pulse rounded bg-mist" />
        <div className="mt-6 h-10 w-2/3 animate-pulse rounded bg-mist" />
        <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-mist" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-mist" />
          ))}
        </div>
      </div>
    </div>
  );
}
