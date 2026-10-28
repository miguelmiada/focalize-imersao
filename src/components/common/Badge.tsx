/**
 * @file src/components/common/Badge.tsx
 * Indicadores semânticos limpos com disciplina zero-pill (tipografia sutil, sem cápsulas pesadas).
 */

import React from 'react';
import { GoalPriority, GoalStatus } from '../../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/formatters';

interface PriorityIndicatorProps {
  priority: GoalPriority;
  showIcon?: boolean;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ priority }) => {
  const config = {
    high: {
      label: PRIORITY_LABELS.high,
      textColor: 'text-amber-700 dark:text-amber-400',
      dotColor: 'bg-amber-500',
    },
    medium: {
      label: PRIORITY_LABELS.medium,
      textColor: 'text-blue-700 dark:text-blue-400',
      dotColor: 'bg-blue-500',
    },
    low: {
      label: PRIORITY_LABELS.low,
      textColor: 'text-slate-600 dark:text-slate-400',
      dotColor: 'bg-slate-400',
    },
  }[priority];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

interface StatusIndicatorProps {
  status: GoalStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const config = {
    completed: {
      label: STATUS_LABELS.completed,
      textColor: 'text-emerald-700 dark:text-emerald-400',
      dotColor: 'bg-emerald-500',
    },
    in_progress: {
      label: STATUS_LABELS.in_progress,
      textColor: 'text-blue-700 dark:text-blue-400',
      dotColor: 'bg-blue-500',
    },
    pending: {
      label: STATUS_LABELS.pending,
      textColor: 'text-slate-500 dark:text-slate-400',
      dotColor: 'bg-slate-400',
    },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
