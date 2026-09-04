import React from 'react';

export default function Card({
  children,
  className = '',
  interactive = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0B0B0B] border border-[#1C1C1F] rounded-xl p-5 sm:p-6 transition-all duration-150 ${
        interactive ? 'hover:border-[#333338] hover:bg-[#0E0E10] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

