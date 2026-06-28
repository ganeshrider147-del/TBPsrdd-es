import React from 'react';
import { useToast } from '../../context/ToastContext';

const ToastList = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-on-surface">{toast.title}</p>
              <p className="text-sm text-on-surface-variant mt-1">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-on-surface-variant hover:text-on-surface">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastList;
