'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const BusMapContainer = dynamic(() => import('./BusMapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center animate-pulse border border-slate-200">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="text-2xl animate-spin">⏳</span>
        <span className="font-semibold text-sm">Interaktiv Xarita yuklanmoqda...</span>
      </div>
    </div>
  )
});

export default function BusMap(props: React.ComponentProps<typeof BusMapContainer>) {
  return <BusMapContainer {...props} />;
}
