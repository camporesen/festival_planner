export default function Loading() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 pb-24">
      <div className="py-4 mb-2">
        <div className="w-20 h-3 bg-[#E0D9CC] rounded animate-pulse mb-3" />
        <div className="w-64 h-8 bg-[#E0D9CC] rounded-xl animate-pulse" />
      </div>
      <div className="flex gap-2 mb-4">
        {[1,2,3].map(i => (
          <div key={i} className="w-20 h-8 bg-[#E0D9CC] rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4 mb-4">
        <div className="w-32 h-4 bg-[#E0D9CC] rounded animate-pulse mb-2" />
        <div className="w-full h-2 bg-[#E0D9CC] rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white border border-[#E0D9CC] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 bg-[#E0D9CC] rounded-xl animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="w-32 h-4 bg-[#E0D9CC] rounded animate-pulse mb-2" />
              <div className="w-20 h-3 bg-[#E0D9CC] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}