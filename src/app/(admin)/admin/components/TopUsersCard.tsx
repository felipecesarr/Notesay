// src/app/(admin)/admin/components/TopUsersCard.tsx

interface TopUser {
  rank: number;
  userId: string;
  email: string;
  name: string | null;
  requests: number;
  totalTokens: number;
  avgLatencyMs: number;
}

interface TopUsersCardProps {
  users: TopUser[];
}

export function TopUsersCard({ users }: TopUsersCardProps) {
  const getRankBadge = (rank: number) => {
    const badges: Record<number, string> = {
      1: "bg-yellow-100 text-yellow-800",
      2: "bg-gray-100 text-gray-800",
      3: "bg-orange-100 text-orange-800",
    };
    return badges[rank] || "bg-gray-50 text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Top Token Consumers
      </h3>

      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No data available</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.userId}
              className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadge(
                    user.rank
                  )}`}
                >
                  {user.rank}
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {user.totalTokens.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {user.requests} requests
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
