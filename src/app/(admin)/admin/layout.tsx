// src/app/(admin)/admin/layout.tsx
import { redirect } from "next/navigation";
import { isAdmin, getAdminInfo } from "@/features/admin/utils";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    redirect("/");
  }

  const adminInfo = await getAdminInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/admin/token-usage"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Token Usage
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {adminInfo?.email}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                {adminInfo?.role}
              </span>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Voltar ao App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
