import React from 'react';
import { getStatusBadgeColor, getPriorityBadgeColor } from '../../utils/formatters';

interface BadgeProps {
  label: string;
  status?: string | null;
  priority?: string | null;
}

export function Badge({ label, status = null, priority = null }: BadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-800';

  if (status) {
    colorClass = getStatusBadgeColor(status);
  } else if (priority) {
    colorClass = getPriorityBadgeColor(priority);
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {label}
    </span>
  );
}
