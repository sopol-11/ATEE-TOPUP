
import React, { createContext, useContext, useState, ReactNode } from 'react';

type DialogType = 'success' | 'warning' | 'danger' | 'info';

interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const showDialog = (opts: DialogOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const hideDialog = () => {
    setIsOpen(false);
  };

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {isOpen && options && (
        <DialogComponent options={options} onClose={hideDialog} />
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within DialogProvider');
  return context;
};

import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const DialogComponent = ({ options, onClose }: { options: DialogOptions, onClose: () => void }) => {
  const { title, message, type = 'info', confirmText = 'ตกลง', cancelText = 'ยกเลิก', onConfirm, onCancel, showCancel = true } = options;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const icons = {
    success: <CheckCircle2 className="text-green-500" size={48} />,
    warning: <AlertTriangle className="text-orange-500" size={48} />,
    danger: <XCircle className="text-red-500" size={48} />,
    info: <Info className="text-blue-500" size={48} />,
  };

  const colors = {
    success: 'bg-green-50 border-green-100',
    warning: 'bg-orange-50 border-orange-100',
    danger: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[60px] w-full max-w-md p-10 shadow-2xl border border-white space-y-8 animate-scale-in relative overflow-hidden">
        <div className={`absolute top-0 inset-x-0 h-3 ${colors[type].split(' ')[0]}`}></div>
        
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className={`p-6 rounded-[35px] ${colors[type]}`}>
            {icons[type]}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {showCancel && (
            <button 
              onClick={handleCancel}
              className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-full font-black text-sm hover:bg-slate-100 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={`flex-1 py-4 text-white rounded-full font-black text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
              type === 'danger' ? 'bg-red-500 shadow-red-100' :
              type === 'warning' ? 'bg-orange-500 shadow-orange-100' :
              type === 'success' ? 'bg-green-500 shadow-green-100' :
              'bg-slate-900 shadow-slate-100'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
