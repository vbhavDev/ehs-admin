import PageSkeleton from './(dashboard)/loading';

export default function Loading() {
  return (
    <div className="p-6 mx-auto max-w-screen-2xl lg:p-8 2xl:p-10 bg-gray-50 dark:bg-navy-950 min-h-screen">
      <PageSkeleton />
    </div>
  );
}
