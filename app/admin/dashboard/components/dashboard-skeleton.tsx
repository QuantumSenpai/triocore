"use client";

import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading dashboard...">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm">
        <div className="space-y-2">
          <div className="h-3 w-40 bg-gray-200 rounded-full" />
          <div className="h-8 w-64 bg-gray-300 rounded-xl" />
          <div className="h-3.5 w-80 bg-gray-200 rounded-full" />
        </div>
        <div className="h-10 w-44 bg-gray-100 border border-black/5 rounded-2xl" />
      </div>

      {/* 4 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-gray-200 rounded-full" />
              <div className="h-9 w-9 bg-gray-100 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-32 bg-gray-300 rounded-lg" />
              <div className="h-3 w-20 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Goal / Progress Card + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-300 rounded-md" />
              <div className="h-3 w-48 bg-gray-200 rounded-full" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-4 w-full bg-gray-200 rounded-full" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="p-4 rounded-2xl bg-gray-50 border border-black/5 space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded-full" />
                <div className="h-5 w-24 bg-gray-300 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
          <div className="h-4 w-32 bg-gray-300 rounded-md" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-black/5">
                <div className="h-3.5 w-24 bg-gray-200 rounded-full" />
                <div className="h-3.5 w-16 bg-gray-300 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects Table Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-gray-300 rounded-md" />
          <div className="h-4 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 w-full bg-gray-50 border border-black/5 rounded-2xl flex items-center px-4 justify-between">
              <div className="h-4 w-40 bg-gray-200 rounded-md" />
              <div className="h-4 w-20 bg-gray-200 rounded-md" />
              <div className="h-4 w-24 bg-gray-200 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
