import React from 'react';

const Loader = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
    <span className="ml-4 text-body-md text-on-surface-variant">{label}</span>
  </div>
);

export default Loader;
