export const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatStatus = (status) => {
  switch (status) {
    case 'Pending':
      return { label: 'Pending', variant: 'warning' };
    case 'In Progress':
      return { label: 'In Progress', variant: 'info' };
    case 'Completed':
      return { label: 'Completed', variant: 'success' };
    case 'Escalated':
      return { label: 'Escalated', variant: 'critical' };
    default:
      return { label: status || 'Unknown', variant: 'default' };
  }
};
