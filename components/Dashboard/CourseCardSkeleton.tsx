export default function CourseCardSkeleton() {
  return (
    <div className="neu-card p-6 min-h-[200px] animate-pulse">
      <div className="h-14 w-14 bg-bg3 rounded-xl mb-4" />
      <div className="h-6 bg-bg3 rounded mb-2 w-3/4" />
      <div className="h-4 bg-bg3 rounded w-1/2" />
    </div>
  );
}

