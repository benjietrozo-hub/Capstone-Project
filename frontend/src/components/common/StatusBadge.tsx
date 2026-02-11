import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor, getConditionBadgeColor, getPriorityBadgeColor } from '../../utils/formatters';

interface StatusBadgeProps {
  label: string;
  status?: string | null;
  priority?: string | null;
  condition?: string | null;
}

/**
 * StatusBadge - Wrapper component for shadcn/ui Badge with status-based styling
 * This maintains backward compatibility with the old Badge API
 */
export function StatusBadge({ label, status = null, priority = null, condition = null }: StatusBadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-800';

  if (status) {
    colorClass = getStatusBadgeColor(status);
  } else if (priority) {
    colorClass = getPriorityBadgeColor(priority);
  } else if (condition) {
    colorClass = getConditionBadgeColor(condition);
  }

  return (
    <Badge className={`${colorClass} border-0`}>
      {label}
    </Badge>
  );
}

export default StatusBadge;
