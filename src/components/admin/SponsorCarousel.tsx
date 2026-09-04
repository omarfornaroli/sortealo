import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface SponsorCarouselProps {
  sponsors: string[]; // array of sponsor logo URLs
  interval?: number; // rotation interval in ms, default 10000
}

export default function SponsorCarousel({ sponsors, interval = 10000 }: SponsorCarouselProps) {
  // Split sponsors into three groups (left, right, bottom)
  const groupSize = Math.ceil(sponsors.length / 3);
  const leftGroup = sponsors.slice(0, groupSize);
  const rightGroup = sponsors.slice(groupSize, groupSize * 2);
  const bottomGroup = sponsors.slice(groupSize * 2);

  const [rotIdx, setRotIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRotIdx((i) => i + 1);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  const getCurrent = (group: string[]) => {
    if (group.length === 0) return null;
    return group[rotIdx % group.length];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Left Sponsor */}
      <Card className="rounded-xl border-slate-200 overflow-hidden shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-center text-sm font-bold uppercase text-slate-600">Sponsor – Izquierda</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4">
          {getCurrent(leftGroup) ? (
            <Image src={getCurrent(leftGroup)!} alt="Sponsor" width={120} height={60} className="object-contain" />
          ) : (
            <span className="text-xs text-slate-400">Sin sponsors</span>
          )}
        </CardContent>
      </Card>

      {/* Right Sponsor */}
      <Card className="rounded-xl border-slate-200 overflow-hidden shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-center text-sm font-bold uppercase text-slate-600">Sponsor – Derecha</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4">
          {getCurrent(rightGroup) ? (
            <Image src={getCurrent(rightGroup)!} alt="Sponsor" width={120} height={60} className="object-contain" />
          ) : (
            <span className="text-xs text-slate-400">Sin sponsors</span>
          )}
        </CardContent>
      </Card>

      {/* Bottom Sponsor – spans both columns */}
      <Card className="rounded-xl border-slate-200 overflow-hidden shadow-lg bg-white col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-center text-sm font-bold uppercase text-slate-600">Sponsor – Abajo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4">
          {getCurrent(bottomGroup) ? (
            <Image src={getCurrent(bottomGroup)!} alt="Sponsor" width={180} height={80} className="object-contain" />
          ) : (
            <span className="text-xs text-slate-400">Sin sponsors</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
