import React from 'react';
import { Calendar, User, CreditCard, ShoppingBag, PlusCircle, CheckCircle } from 'lucide-react';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'booking' | 'user' | 'payment' | 'vendor' | 'task' | 'other';
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar size={16} className="text-gold-600" />;
      case 'user':
        return <User size={16} className="text-blue-600" />;
      case 'payment':
        return <CreditCard size={16} className="text-green-600" />;
      case 'vendor':
        return <ShoppingBag size={16} className="text-purple-600" />;
      case 'task':
        return <CheckCircle size={16} className="text-emerald-600" />;
      default:
        return <PlusCircle size={16} className="text-neutral-500" />;
    }
  };

  const getIconBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-gold-50 border-gold-100';
      case 'user':
        return 'bg-blue-50 border-blue-100';
      case 'payment':
        return 'bg-green-50 border-green-100';
      case 'vendor':
        return 'bg-purple-50 border-purple-100';
      case 'task':
        return 'bg-emerald-50 border-emerald-100';
      default:
        return 'bg-neutral-50 border-neutral-100';
    }
  };

  if (activities.length === 0) {
    return <div className="text-center py-6 text-sm text-neutral-400 font-sans">No recent activities.</div>;
  }

  return (
    <div className="flow-root font-sans">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-cream-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center border shadow-sm ${getIconBg(activity.type)}`}>
                    {getIcon(activity.type)}
                  </span>
                </div>
                <div className="flex-grow min-w-0 pt-0.5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-primary-800">
                        {activity.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right text-[10px] whitespace-nowrap text-neutral-400">
                      <time dateTime={activity.timestamp}>{activity.timestamp}</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
