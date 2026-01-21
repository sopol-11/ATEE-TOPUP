
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 text-green-700 border-green-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    warning: 'bg-orange-50 text-orange-700 border-orange-100'
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />
  };

  return (
    <div className={`fixed top-6 right-6 z-[999] p-4 pr-12 rounded-[25px] border shadow-xl flex items-center gap-3 animate-scale-in ${styles[type]}`}>
      <div className="shrink-0">{icons[type]}</div>
      <div className="text-sm font-bold">{message}</div>
      <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};