import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-label="Loading">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton variant="block" />
        <Skeleton variant="block" />
        <Skeleton variant="block" />
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}
