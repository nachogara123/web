export default function Loading() {
  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
