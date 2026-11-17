// src/app/(admin)/admin/components/TokenUsageTable.tsx
"use client";

import { useState, useEffect } from "react";

interface TokenUsage {
  id: string;
  feature: string;
  action: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  latencyMs: number | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TokenUsageTableProps {
  days: number;
}

export function TokenUsageTable({ days }: TokenUsageTableProps) {
  const [usages, setUsages] = useState<TokenUsage[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ feature: "", userId: "" });

  useEffect(() => {
    async function fetchUsages() {
      setLoading(true);
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        });

        if (filter.feature) params.set("feature", filter.feature);
        if (filter.userId) params.set("userId", filter.userId);

        const res = await fetch(`/api/admin/tokens?${params}`);

        if (res.ok) {
          const data = await res.json();
          setUsages(data.usages);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch usages:");
      } finally {
        setLoading(false);
      }
    }

    fetchUsages();
  }, [page, days, filter]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, days]);

  const features = [
    "chat", "interview", "quiz", "video-understanding",
    "file-search", "read-aloud", "feedback", "pdf-processing",
    "skills", "notes", "context-processing", "youtube-study"
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Detailed Usage Log</h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filter.feature}
            onChange={(e) => setFilter(f => ({ ...f, feature: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All Features</option>
            {features.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by user ID"
            value={filter.userId}
            onChange={(e) => setFilter(f => ({ ...f, userId: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No usage data found
                    </td>
                  </tr>
                ) : (
                  usages.map((usage) => (
                    <tr key={usage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {usage.user.name || usage.user.email.split("@")[0]}
                        </div>
                        <div className="text-xs text-gray-500">{usage.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize">
                          {usage.feature.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usage.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {usage.totalTokens.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {usage.promptTokens} in / {usage.completionTokens} out
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usage.latencyMs ? `${usage.latencyMs}ms` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(usage.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * pagination.limit + 1} to{" "}
                {Math.min(page * pagination.limit, pagination.total)} of{" "}
                {pagination.total.toLocaleString()} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
