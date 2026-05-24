export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    
    // Check if the date is invalid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Date value:', date);
    return '';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    borrowed: 'bg-purple-100 text-purple-800',
    returned: 'bg-gray-100 text-gray-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
    available: 'bg-green-500 text-white', // Make available stand out more as green
    archived: 'bg-amber-100 text-amber-800',
    maintenance: 'bg-blue-100 text-blue-800',
    damaged: 'bg-red-500 text-white',
    lost: 'bg-red-800 text-white',
    closed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityBadgeColor = (priority) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export const getConditionBadgeColor = (condition) => {
  const colors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-orange-100 text-orange-800',
    damaged: 'bg-red-100 text-red-800',
    lost: 'bg-red-800 text-white',
  };
  return colors[condition] || 'bg-gray-100 text-gray-800';
};
