/**
 * @file src/components/goals/GoalCard.tsx
 * Card de objetivo de estudo com ações rápidas, progresso de tempo e foco.
 */

import React from 'react';
import { Goal } from '../../types';
import { PriorityIndicator, StatusIndicator } from '../common/Badge';
import { formatDuration, getDeadlineInfo } from '../../utils/formatters';
import { Play, Edit3, Trash2, Calendar, Clock, Check } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onStartFlow: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onToggleStatus,
  onStartFlow,
}) => {
  const isCompleted = goal.status === 'completed';
  const deadlineInfo = getDeadlineInfo(goal.deadline);

  return (
    <article
      className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-80'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Cabeçalho do Card: Checkbox + Título */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleStatus(goal.id)}
            role="checkbox"
            aria-checked={isCompleted}
            aria-label={`Marcar "${goal.title}" como ${isCompleted ? 'não concluído' : 'concluído'}`}
            className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800'
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold leading-snug break-words ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {goal.title}
            </h3>

            {goal.description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Metadados limpos com separadores tipográficos (Anti-slop zero-pill) */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {goal.category || 'Geral'}
          </span>
          <span aria-hidden="true">·</span>
          <PriorityIndicator priority={goal.priority} />
          <span aria-hidden="true">·</span>
          <StatusIndicator status={goal.status} />

          {goal.deadline && (
            <>
              <span aria-hidden="true">·</span>
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  deadlineInfo.isOverdue
                    ? 'text-rose-600 dark:text-rose-400'
                    : deadlineInfo.isToday || deadlineInfo.isSoon
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{deadlineInfo.label}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Rodapé do Card: Tempo Estudado + Ações */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">
            {formatDuration(goal.totalStudiedSeconds)}
          </span>
          <span className="text-[11px] text-slate-400">estudados</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onStartFlow(goal)}
            title="Iniciar sessão de foco neste objetivo"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Focar</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label={`Editar objetivo "${goal.title}"`}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            aria-label={`Excluir objetivo "${goal.title}"`}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
