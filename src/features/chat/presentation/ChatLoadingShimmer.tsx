"use client";

import React from "react";

export function ChatLoadingShimmer() {
  return (
    <div className="px-8">
      <span className="text-sm text-stone-500 animate-shimmer-text">
        Typing...
      </span>
    </div>
  );
}
