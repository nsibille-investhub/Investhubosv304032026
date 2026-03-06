import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CountBadgeProps {
  count: number;
  icon?: LucideIcon;
  variant?: 'default' | 'purple' | 'blue' | 'green' | 'red' | 'gray';
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({ 
  count, 
  icon: Icon, 
  variant = 'purple',
  className = '' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'gray':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${getVariantClasses()} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span className="text-sm font-medium">{count}</span>
    </div>
  );
};
