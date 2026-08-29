'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 120 }: QRCodeDisplayProps) {
  return (
    <div className="inline-block p-2 bg-white rounded-xl shadow-sm border border-slate-200">
      <QRCodeSVG 
        value={value} 
        size={size} 
        level="H" 
        includeMargin={true} 
      />
    </div>
  );
}
