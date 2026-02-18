export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="relative mb-8">
        <div className="h-12 w-12 rounded-full border-4 border-muted border-t-foreground animate-spin" />
      </div>
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-8 w-3/4 mx-auto rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-1/2 mx-auto rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
