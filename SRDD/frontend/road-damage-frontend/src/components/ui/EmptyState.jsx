import React from 'react';

const EmptyState = ({ title, description, action }) => (
  <div className="rounded-3xl border border-outline-variant/50 bg-surface-container-lowest p-10 text-center">
    <p className="font-label-md text-label-md text-primary mb-4">{title}</p>
    <p className="text-body-md text-on-surface-variant max-w-lg mx-auto mb-6">{description}</p>
    {action}
  </div>
);

export default EmptyState;
