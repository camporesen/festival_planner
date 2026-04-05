export default function Loading() {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-24">
      <div className="pt-4 mb-8">
        <div className="w-24 h-4 bg-[#E0D9CC] rounded-full animate-pulse mb-2" />
        <div className="w-48 h-8 bg-[#E0D9CC] rounded-xl animate-pulse" />
      </div>
      <div className="w-full h-12 bg-[#E0D9CC] rounded-xl animate-pulse mb-4" />
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white border border-[#E0D9CC] rounded-2xl p-4">
            <div className="w-32 h-3 bg-[#E0D9CC] rounded animate-pulse mb-2" />
            <div className="w-48 h-5 bg-[#E0D9CC] rounded animate-pulse mb-1" />
            <div className="w-24 h-3 bg-[#E0D9CC] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}