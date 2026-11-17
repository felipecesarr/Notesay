"use client";

import InterviewSession from "@/features/interview/presentation/InterviewSession";

export default function DashboardPage() {
  return (
    <main className="h-screen w-screen bg-stone-50 flex flex-col overflow-hidden">
      <div className="flex-1 w-full h-full overflow-hidden p-2 md:p-4">
        <InterviewSession />
      </div>
    </main>
  );
}
