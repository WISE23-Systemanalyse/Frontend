'use client';

import HallLayout from '@/components/hall/HallLayout';

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test: Saal-Layout</h1>
      <HallLayout hallId={26} />
    </div>
  );
}
