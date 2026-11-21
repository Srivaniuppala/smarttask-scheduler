import React from 'react';

export const LoadingSpinner = ({ size = "md", text }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div 
        className={`${sizeClasses[size] || sizeClasses.md} border-gray-200 border-t-blue-600 rounded-full animate-spin`} 
      />
      {text && <p className="mt-3 text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );
};
