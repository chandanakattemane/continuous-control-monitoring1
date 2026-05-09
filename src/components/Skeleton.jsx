export const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
  <div className={`${width} ${height} bg-gray-200 rounded-lg animate-pulse`} />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow p-5 space-y-3">
    <SkeletonLine width="w-1/2" height="h-4" />
    <SkeletonLine width="w-full" height="h-3" />
    <SkeletonLine width="w-3/4" height="h-3" />
  </div>
);

export const SkeletonRow = () => (
  <tr className="border-b">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

export const SkeletonKPI = () => (
  <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-gray-200">
    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-3" />
    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
  </div>
);