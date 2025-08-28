
import React from 'react';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-2xl shadow-lg">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-cyan-400 rounded-full animate-spin"></div>
      <p className="mt-6 text-xl font-bold text-cyan-300 tracking-wider">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
