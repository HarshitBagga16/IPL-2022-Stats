import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'blue' | 'gold' | 'green' | 'red' | 'purple';
  className?: string;
}

const colorMap = {
  blue: 'from-blue-600 to-blue-800 border-blue-700',
  gold: 'from-yellow-600 to-yellow-800 border-yellow-700',
  green: 'from-green-600 to-green-800 border-green-700',
  red: 'from-red-600 to-red-800 border-red-700',
  purple: 'from-purple-600 to-purple-800 border-purple-700',
};

export function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue', className }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-gradient-to-br border rounded-xl p-5 flex flex-col gap-2',
      colorMap[color],
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/80">{title}</span>
        {Icon && <Icon size={20} className="text-white/60" />}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-xs text-white/60">{subtitle}</div>}
    </div>
  );
}
