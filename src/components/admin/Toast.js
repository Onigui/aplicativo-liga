import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Aguarda animação de saída
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg p-4
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        ${getBackgroundColor()}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className={`
              rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2
              ${type === 'success' ? 'text-green-400 hover:text-green-500 focus:ring-green-500' : ''}
              ${type === 'error' ? 'text-red-400 hover:text-red-500 focus:ring-red-500' : ''}
              ${type === 'warning' ? 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500' : ''}
              ${type === 'info' ? 'text-blue-400 hover:text-blue-500 focus:ring-blue-500' : ''}
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showToast,
    ToastContainer,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration)
  };
};

export default Toast;