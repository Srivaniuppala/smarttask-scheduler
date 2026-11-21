import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', subtitle }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 transition-colors hover:border-gray-300">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-md border border-gray-100 flex items-center justify-center text-gray-600 bg-gray-50">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-medium ${
            changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};
