// src/app/(admin)/admin/components/UsageCharts.tsx
"use client";

interface FeatureStat {
  feature: string;
  requests: number;
  totalTokens: number;
}

interface ModelStat {
  model: string;
  requests: number;
  totalTokens: number;
}

interface UsageChartsProps {
  byFeature: FeatureStat[];
  byModel: ModelStat[];
}

export function UsageCharts({ byFeature, byModel }: UsageChartsProps) {
  const maxTokens = Math.max(...byFeature.map(f => f.totalTokens), 1);

  const featureColors: Record<string, string> = {
    chat: "bg-blue-500",
    interview: "bg-green-500",
    quiz: "bg-yellow-500",
    "video-understanding": "bg-purple-500",
    "file-search": "bg-pink-500",
    "read-aloud": "bg-indigo-500",
    feedback: "bg-orange-500",
    "pdf-processing": "bg-red-500",
    skills: "bg-teal-500",
    notes: "bg-cyan-500",
    default: "bg-gray-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Usage by Feature
      </h3>

      <div className="space-y-4">
        {byFeature.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          byFeature.map((feature) => (
            <div key={feature.feature}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 capitalize">
                  {feature.feature.replace(/-/g, ' ')}
                </span>
                <span className="text-gray-500">
                  {feature.totalTokens.toLocaleString()} tokens
                  <span className="text-gray-400 ml-2">
                    ({feature.requests.toLocaleString()} req)
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    featureColors[feature.feature] || featureColors.default
                  }`}
                  style={{ width: `${(feature.totalTokens / maxTokens) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Model breakdown */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-4">By Model</h4>
        <div className="flex flex-wrap gap-4">
          {byModel.map((model) => (
            <div
              key={model.model}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700">
                {model.model}
              </span>
              <span className="text-xs text-gray-500">
                {model.totalTokens.toLocaleString()} tokens
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
