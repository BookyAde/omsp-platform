export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-40 mb-2" />
        <div className="h-3 bg-slate-800 rounded w-64" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="h-6 bg-slate-700 rounded mb-2" />
            <div className="h-4 bg-slate-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}