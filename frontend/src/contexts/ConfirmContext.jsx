import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: true,
    resolve: null
  });

  const confirm = useCallback((message, title = 'Confirm Action', options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isDestructive: options.isDestructive !== undefined ? options.isDestructive : true,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2119]/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-[#BDD2B6]">
            <div className="flex items-center gap-3.5 mb-4">
              <div className={`p-2.5 rounded-xl ${confirmState.isDestructive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#BDD2B6]/30 text-[#798777] border border-[#BDD2B6]'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#283227]">
                {confirmState.title}
              </h3>
            </div>
            <p className="text-[#5B6859] text-sm mb-6 leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 text-xs font-bold text-[#5B6859] bg-[#F8EDE3] hover:bg-[#ebdcd0] rounded-xl border border-[#BDD2B6] transition-colors"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-colors ${
                  confirmState.isDestructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#798777] hover:bg-[#687566] shadow-[#798777]/25'
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
