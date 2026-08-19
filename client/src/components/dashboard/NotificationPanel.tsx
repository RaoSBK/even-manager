import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkRead,
  onClearAll
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={15} className="text-yellow-600" />;
      case 'success':
        return <CheckCircle size={15} className="text-green-600" />;
      case 'error':
        return <XCircle size={15} className="text-red-600" />;
      default:
        return <Info size={15} className="text-blue-600" />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-100';
      case 'success':
        return 'bg-green-50 border-green-100';
      case 'error':
        return 'bg-red-50 border-red-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="bg-white border border-cream-200 shadow-luxury rounded-luxury w-full max-w-sm font-sans">
      <div className="flex justify-between items-center p-4 border-b border-cream-100 bg-cream-50/50 rounded-t-luxury">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gold-500" />
          <h4 className="font-bold text-sm text-primary-800">Notifications</h4>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="bg-gold-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length} new
            </span>
          )}
        </div>
        {onClearAll && notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] text-neutral-400 hover:text-primary-800 font-semibold transition-all"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-cream-100">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-400">No notifications.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkRead?.(notif.id)}
              className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-cream-50/50 ${
                !notif.read ? 'bg-gold-50/20' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${getIconBg(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h5 className={`text-xs truncate ${!notif.read ? 'font-bold text-primary-800' : 'text-neutral-700'}`}>
                    {notif.title}
                  </h5>
                  <span className="text-[9px] text-neutral-400 whitespace-nowrap">{notif.timestamp}</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
