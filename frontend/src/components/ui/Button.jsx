import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-white text-black hover:bg-[#E4E4E7] font-semibold shadow-sm',
    accent: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 font-semibold',
    secondary: 'bg-[#121214] text-[#E4E4E7] border border-[#27272A] hover:bg-[#18181B] hover:border-[#3F3F46]',
    outline: 'bg-transparent text-[#D4D4D8] border border-[#27272A] hover:bg-[#121214] hover:border-[#3F3F46]',
    ghost: 'bg-transparent text-[#A1A1AA] hover:text-white hover:bg-[#141414]',
    danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/25 hover:bg-rose-500/20'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-3.5 py-2 text-xs font-medium rounded-lg gap-2',
    lg: 'px-5 py-2.5 text-sm font-medium rounded-xl gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}

