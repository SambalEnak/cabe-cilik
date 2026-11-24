import { Flame } from 'lucide-react';

interface SpiceMeterProps {
  level: 1 | 2 | 3 | 'combo';
  label: string;
}

export function SpiceMeter({ level, label }: SpiceMeterProps) {
  const activeCount = level === 'combo' ? 3 : level;

  return (
    <div className="inline-flex items-center gap-2 text-xs text-[#57534E]">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((idx) => (
          <Flame
            key={idx}
            className={`w-3.5 h-3.5 ${
              idx <= activeCount
                ? level === 1
                  ? 'text-[#15803D] fill-[#15803D]'
                  : level === 3
                    ? 'text-[#9D174D] fill-[#9D174D]'
                    : 'text-[#B91C1C] fill-[#B91C1C]'
                : 'text-[#D6D3CD]'
            }`}
            strokeWidth={1.75}
          />
        ))}
      </span>
      <span className="font-medium text-[#1C1917]">{label}</span>
    </div>
  );
}
