/**
 * @file src/components/goals/GoalStats.tsx
 * Visão consolidada de métricas de estudo em layout de elevação única e números tabulares.
 */

import React from 'react';
import { useGoals } from '../../context/GoalsContext';
import { formatDuration } from '../../utils/formatters';
import { Target, CheckCircle2, Clock, Hourglass } from 'lucide-react';

export const GoalStats: React.FC = () => {
  const { totalGoals, completedGoals, inProgressGoals, totalSecondsStudied } = useGoals();

  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <section
      aria-label="Estatísticas gerais de objetivos"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
    >
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Total de Objetivos</span>
          <Target className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {totalGoals}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Em Andamento</span>
          <Hourglass className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {inProgressGoals}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Concluídos</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {completedGoals}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">({completionRate}%)</span>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-medium">Tempo Focado</span>
          <Clock className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {formatDuration(totalSecondsStudied)}
        </div>
      </div>
    </section>
  );
};
