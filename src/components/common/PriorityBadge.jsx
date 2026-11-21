import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const norm = (priority || 'medium').toLowerCase();
  
  if (norm === 'high' || norm === 'urgent') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        High
      </span>
    );
  }
  
  if (norm === 'medium') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Medium
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
      Low
    </span>
  );
};
