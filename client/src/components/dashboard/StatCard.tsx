import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    type: 'up' | 'down';
  };
  color?: 'primary' | 'gold' | 'green' | 'blue' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  color = 'primary'
}) => {
  const colorMap = {
    primary: 'bg-primary-50 border-primary-100 text-primary-800',
    gold: 'bg-gold-50 border-gold-200 text-gold-600',
    green: 'bg-green-50 border-green-100 text-green-800',
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
    red: 'bg-red-50 border-red-100 text-red-800'
  };

  return (
    <div className={`border p-6 rounded-luxury shadow-sm transition-all duration-300 hover:shadow-luxury ${colorMap[color]}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">{title}</p>
          <h4 className="text-3xl font-extrabold font-serif mt-2">{value}</h4>
        </div>
        <div className="p-3 rounded-full bg-white/60 shadow-inner">
          {icon}
        </div>
      </div>
      {(description || trend) && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          {trend && (
            <span className={`font-bold ${trend.type === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {trend.value}
            </span>
          )}
          {description && <span className="text-neutral-400">{description}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
