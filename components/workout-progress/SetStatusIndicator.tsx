'use client';

import React from 'react';

interface SetStatusIndicatorProps {
  setNumber: number;
  status: 'completed' | 'current' | 'remaining';
  size?: 'sm' | 'md' | 'lg';
}

export const SetStatusIndicator: React.FC<SetStatusIndicatorProps> = ({
  setNumber,
  status,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'completed':
        return 'bg-[#10B981] text-white shadow-[0_0_0_3px_rgba(16,185,129,0.2)] scale-95 success-flash';
      case 'current':
        return 'bg-[#F59E0B] text-white set-current-pulse shadow-[0_0_0_3px_rgba(245,158,11,0.3)] current-set-glow';
      case 'remaining':
        return 'bg-[#374151] text-[#9CA3AF] border-2 border-[#4B5563] hover:border-[#6B7280] transition-colors duration-200';
      default:
        return 'bg-[#374151] text-[#9CA3AF]';
    }
  };

  const getContent = () => {
    if (status === 'completed') {
      return '✓';
    }
    return setNumber.toString();
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        ${getStatusClasses()}
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-bold 
        transition-all 
        duration-300 
        ease-out
        ${status === 'current' ? 'z-10' : ''}
      `}
    >
      {getContent()}
    </div>
  );
};