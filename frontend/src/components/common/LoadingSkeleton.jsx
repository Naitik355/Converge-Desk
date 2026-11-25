import React from 'react';

export const CardSkeleton = () => (
  <div className="sx-panel p-5 space-y-4" aria-hidden="true">
    <div className="flex items-center justify-between">
      <div className="sx-skeleton h-9 w-9 rounded-[10px]" />
      <div className="sx-skeleton h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="sx-skeleton h-4 w-2/3" />
      <div className="sx-skeleton h-3 w-full" />
      <div className="sx-skeleton h-3 w-4/5" />
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
      <div className="sx-skeleton h-3 w-20" />
      <div className="sx-skeleton h-3 w-12" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]" aria-hidden="true">
    <div className="flex items-center gap-3 w-1/2">
      <div className="sx-skeleton w-8 h-8 rounded-[8px]" />
      <div className="space-y-2 flex-1">
        <div className="sx-skeleton h-3.5 w-1/2" />
        <div className="sx-skeleton h-2.5 w-1/3" />
      </div>
    </div>
    <div className="sx-skeleton h-3.5 w-20" />
    <div className="sx-skeleton h-3.5 w-16" />
  </div>
);

export const PageHeaderSkeleton = () => (
  <div className="animate-pulse mb-8 space-y-3" aria-hidden="true">
    <div className="sx-skeleton h-3 w-24" />
    <div className="sx-skeleton h-9 w-64 rounded-lg" />
    <div className="sx-skeleton h-4 w-96 max-w-full" />
  </div>
);

export const StatSkeleton = () => (
  <div className="sx-panel p-5 space-y-3" aria-hidden="true">
    <div className="sx-skeleton h-3 w-20" />
    <div className="sx-skeleton h-7 w-12" />
    <div className="sx-skeleton h-3 w-24" />
  </div>
);
