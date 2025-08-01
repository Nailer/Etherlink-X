export function Stats() {
  const stats = [
    { name: "Total Volume", value: "$2.4B+" },
    { name: "Supported Chains", value: "20+" },
    { name: "Active Users", value: "150K+" },
    { name: "Transactions", value: "1M+" },
  ]

  return (
    <section className="px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className="text-3xl font-bold text-gray-900 lg:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm text-gray-600 lg:text-base">{stat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
