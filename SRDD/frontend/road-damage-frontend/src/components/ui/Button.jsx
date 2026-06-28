import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-container',
    secondary: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
    ghost: 'bg-transparent text-primary hover:bg-primary/10',
    danger: 'bg-error text-white hover:bg-error-container',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-xl',
    lg: 'px-5 py-4 text-base rounded-2xl',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
