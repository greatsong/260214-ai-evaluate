import { LEVEL_COLORS } from '@/lib/constants';

export default function LevelBadge({ level }) {
  const colorClass = LEVEL_COLORS[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  return (
    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${colorClass}`}>
      {level}
    </span>
  );
}
