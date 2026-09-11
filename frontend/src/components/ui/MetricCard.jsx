import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Card from './Card';

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  onClick,
  className = ''
}) {
  return (
    <Card interactive={!!onClick} onClick={onClick} className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#71717A] tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-[#141414] border border-[#222226] flex items-center justify-center text-[#A1A1AA]">
            <Icon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
            {trend} <ArrowUpRight className="w-3 h-3" />
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-[#71717A]">{subtitle}</p>}
    </Card>
  );
}

