import React from 'react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-cream-200 shadow-luxury rounded-luxury p-6 ${className}`}>
      <div className="flex justify-between items-center pb-4 border-b border-cream-100 mb-6">
        <div>
          <h3 className="font-bold text-lg text-primary-800 font-serif">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;
