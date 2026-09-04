import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Sponsor {
  name: string;
  logoUrl?: string;
}

interface SponsorCardsProps {
  sponsors: Array<Sponsor | string>;
  interval?: number; // milliseconds
  position?: 'left' | 'right' | 'bottom';
}

/**
 * Splits the sponsor list into three groups (left, right, bottom) and rotates them
 * synchronously based on the provided interval. Each group is displayed in its own Card.
 */
const SponsorCards: React.FC<SponsorCardsProps> = ({ sponsors, interval = 10000, position }) => {
  // Normalize sponsors to objects
  const normalizedSponsors: Sponsor[] = sponsors.map((s) =>
    typeof s === 'string' ? { name: '', logoUrl: s } : s
  );

  // Group sponsors by index modulo 3
  const groupSponsors = (arr: Sponsor[]) => {
    const left: Sponsor[] = [];
    const right: Sponsor[] = [];
    const bottom: Sponsor[] = [];
    arr.forEach((s, i) => {
      if (i % 3 === 0) left.push(s);
      else if (i % 3 === 1) right.push(s);
      else bottom.push(s);
    });
    return { left, right, bottom };
  };

  const { left, right, bottom } = groupSponsors(normalizedSponsors);

  const [rotIdx, setRotIdx] = useState(0);

  useEffect(() => {
    if (!normalizedSponsors || normalizedSponsors.length === 0) return;
    const id = setInterval(() => {
      setRotIdx((prev) => (prev + 1) % 3); // rotate between left, right, bottom
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  const getCurrent = (group: Sponsor[]) => group;

  const renderGroup = (title: string, group: Sponsor[]) => (
    <Card className="rounded-[2rem] border-slate-200 p-8 shadow-lg bg-white mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {getCurrent(group).map((s, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            {s.logoUrl ? (
              <img src={s.logoUrl} alt={s.name} className="relative h-[144px] w-[384px] md:h-[168px] md:w-[528px] object-contain" />
            ) : (
              <div className="h-8 w-8 bg-slate-200 rounded-full" />
            )}
            <span className="text-sm font-medium text-slate-700">{s.name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const positions: Array<'left' | 'right' | 'bottom'> = ['left', 'right', 'bottom'];
  const activePosition = positions[rotIdx % positions.length];

  // Rotate groups across panels based on rotIdx (0:left,1:right,2:bottom)
  const groups = [left, right, bottom] as const;
  const rotatedGroups = groups.map((_, i) => groups[(i + rotIdx) % groups.length]);

  return (
    <div className="mt-8">
      {/* Left Sponsor Panel */}
      <section className="hidden md:block">
        {(!position || position === 'left') && renderGroup('Patrocinadores', rotatedGroups[0])}
      </section>
      {/* Right Sponsor Panel */}
      <section className="hidden md:block">
        {(!position || position === 'right') && renderGroup('Patrocinadores', rotatedGroups[1])}
      </section>
      {/* Bottom Sponsor Panel */}
      <section className="hidden md:block">
        {(!position || position === 'bottom') && renderGroup('Patrocinadores', rotatedGroups[2])}
      </section>
    </div>
  );
};

export default SponsorCards;
