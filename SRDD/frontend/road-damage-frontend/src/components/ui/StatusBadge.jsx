import React from 'react';

const StatusBadge = ({ status }) => {
  const classes = {
    Pending: 'bg-amber-100 text-amber-700',
    'In Progress': 'bg-sky-100 text-sky-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Escalated: 'bg-red-100 text-red-700',
    Unknown: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes[status] || classes.Unknown}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
