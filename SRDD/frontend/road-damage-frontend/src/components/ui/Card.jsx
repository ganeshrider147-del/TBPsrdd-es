import React from 'react';

const Card = ({ title, subtitle, className = '', children }) => (
  <section className={`rounded-[20px] border border-outline-variant/50 bg-white p-6 shadow-sm ${className}`}>
    {(title || subtitle) && (
      <div className="mb-5">
        {title && <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>}
        {subtitle && <p className="mt-2 text-body-sm text-on-surface-variant">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

export default Card;
