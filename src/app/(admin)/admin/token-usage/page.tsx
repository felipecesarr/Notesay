// src/app/(admin)/admin/token-usage/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { TokenUsageTable } from "../components/TokenUsageTable";
import { UsageCharts } from "../components/UsageCharts";
import { TopUsersCard } from "../components/TopUsersCard";
import { StatsCards } from "../components/StatsCards";

interface Stats {
  total: {
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    avgLatencyMs: number;
  };
  byFeature: Array<{
    feature: string;
    requests: number;
    totalTokens: number;
    avgLatencyMs: number;
  }>;
  byModel: Array<{
    model: string;
    requests: number;
    totalTokens: number;
  }>;
}

interface TopUser {
  rank: number;
  userId: string;
  email: string;
  name: string | null;
  requests: number;
  totalTokens: number;
  avgLatencyMs: number;
}

export default function TokenUsagePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/tokens/stats?days=${days}`),
        fetch(`/api/admin/tokens/users?days=${days}&limit=10`),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setTopUsers(usersData.topUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error loading data</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Token Usage Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Monitor token consumption across all features
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <StatsCards stats={stats.total} />
      ) : null}

      {/* Charts and Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          <>
            <div className="bg-white rounded-lg shadow p-6 h-80 animate-pulse" />
            <div className="bg-white rounded-lg shadow p-6 h-80 animate-pulse" />
          </>
        ) : (
          <>
            {stats && <UsageCharts byFeature={stats.byFeature} byModel={stats.byModel} />}
            <TopUsersCard users={topUsers} />
          </>
        )}
      </div>

      {/* Detailed Table */}
      <TokenUsageTable days={days} />
    </div>
  );
}
