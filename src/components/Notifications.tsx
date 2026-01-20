'use client';

import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Notification, NotificationType } from '@/types';
import { cn } from '@/lib/utils';

const ICONS: Record<NotificationType, typeof CheckCircle> = {
  SUCCESS: CheckCircle,
  ERROR: XCircle,
  WARNING: AlertCircle,
  INFO: Info,
};

const STYLES: Record<NotificationType, string> = {
  SUCCESS: 'bg-success-50 text-success-800 border-success-200',
  ERROR: 'bg-danger-50 text-danger-800 border-danger-200',
  WARNING: 'bg-amber-50 text-amber-800 border-amber-200',
  INFO: 'bg-primary-50 text-primary-800 border-primary-200',
};

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function Notifications({ notifications, onDismiss }: NotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.slice(0, 5).map((notification) => {
        const Icon = ICONS[notification.type];
        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right',
              STYLES[notification.type]
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => onDismiss(notification.id)}
              className="p-1 hover:bg-black/5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
