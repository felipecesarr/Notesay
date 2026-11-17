// src/app/(admin)/admin/components/StatsCards.tsx

interface StatsCardsProps {
  stats: {
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    avgLatencyMs: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Requests",
      value: stats.requests.toLocaleString(),
      description: "API calls made",
      color: "blue",
    },
    {
      title: "Total Tokens",
      value: stats.totalTokens.toLocaleString(),
      description: `${stats.promptTokens.toLocaleString()} in / ${stats.completionTokens.toLocaleString()} out`,
      color: "green",
    },
    {
      title: "Avg Latency",
      value: `${stats.avgLatencyMs}ms`,
      description: "Response time",
      color: "yellow",
    },
    {
      title: "Est. Cost",
      value: `$${((stats.totalTokens / 1000) * 0.00025).toFixed(2)}`,
      description: "Based on Gemini pricing",
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
          <p className={`text-3xl font-bold mt-2 ${colorClasses[card.color as keyof typeof colorClasses]?.split(' ')[1] || 'text-gray-900'}`}>
            {card.value}
          </p>
          <p className="text-xs text-gray-400 mt-1">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
