import React from 'react';
import { Heart } from 'lucide-react';

// Loading básico com spinner
export const LoadingSpinner = ({ size = 'md', color = 'admin' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    admin: 'text-admin-600',
    primary: 'text-primary-500',
    gray: 'text-gray-400',
    white: 'text-white'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Loading com coração pulsante (temático para ONG)
export const LoadingHeart = () => {
  return (
    <div className="flex items-center justify-center">
      <Heart 
        className="w-8 h-8 text-primary-500 animate-pulse" 
        fill="currentColor"
      />
    </div>
  );
};

// Loading de página inteira
export const LoadingPage = ({ message = 'Carregando...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingHeart />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
        <p className="mt-2 text-sm text-gray-500">Liga do Bem - Cuidando com amor</p>
      </div>
    </div>
  );
};

// Loading inline para botões
export const LoadingButton = ({ children, loading = false, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-2">Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Loading para cards
export const LoadingCard = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

// Loading para tabelas
export const LoadingTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3">
          <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="flex space-x-4">
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading com overlay
export const LoadingOverlay = ({ show = false, message = 'Carregando...' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
        <LoadingHeart />
        <p className="mt-4 font-medium text-gray-900">{message}</p>
        <p className="mt-2 text-sm text-gray-500">Por favor, aguarde...</p>
      </div>
    </div>
  );
};

// Loading skeleton para lista
export const LoadingSkeleton = ({ lines = 3 }) => {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex space-x-3">
          <div className="rounded-full bg-gray-200 h-8 w-8"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente principal de Loading
const Loading = ({ 
  type = 'spinner', 
  size = 'md', 
  color = 'admin',
  message,
  fullPage = false,
  overlay = false,
  ...props 
}) => {
  if (fullPage) {
    return <LoadingPage message={message} />;
  }

  if (overlay) {
    return <LoadingOverlay show={true} message={message} />;
  }

  switch (type) {
    case 'heart':
      return <LoadingHeart {...props} />;
    case 'card':
      return <LoadingCard {...props} />;
    case 'table':
      return <LoadingTable {...props} />;
    case 'skeleton':
      return <LoadingSkeleton {...props} />;
    default:
      return <LoadingSpinner size={size} color={color} />;
  }
};

export default Loading;