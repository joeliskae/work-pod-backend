import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'maintenance' | 'active' | 'inactive';
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'offline':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
      {children}
    </span>
  );
};