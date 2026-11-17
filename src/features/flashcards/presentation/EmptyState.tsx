import React from "react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
        <span className="text-xl text-stone-400">📇</span>
      </div>
      <h3 className="text-sm font-medium text-stone-900 mb-1">No cards yet</h3>
      <p className="text-xs text-stone-500">Highlight text in chat to add cards.</p>
    </div>
  );
}
