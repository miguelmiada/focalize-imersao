/**
 * @file src/components/flow/TimerDisplay.tsx
 * Display minimalista e acessível do timer com anel de progresso SVG e números tabulares.
 */

import React from 'react';
import { SessionType } from '../../types';
import { formatTimer, SESSION_TYPE_LABELS } from '../../utils/formatters';

interface TimerDisplayProps {
  secondsLeft: number;
  totalDuration: number;
  progress: number;
  sessionType: SessionType;
  cycleCount: number;
  cyclesUntilLongBreak: number;
  goalTitle: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  secondsLeft,
  progress,
  sessionType,
  cycleCount,
  cyclesUntilLongBreak,
  goalTitle,
}) => {
  // Configuração de cores por tipo de sessão
  const themeStyles = {
    focus: {
      stroke: 'text-blue-600 dark:text-blue-500',
      textAccent: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    },
    short_break: {
      stroke: 'text-emerald-600 dark:text-emerald-500',
      textAccent: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    },
    long_break: {
      stroke: 'text-indigo-600 dark:text-indigo-500',
      textAccent: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    },
  }[sessionType];

  const currentCycleInSet = (cycleCount % cyclesUntilLongBreak) || (cycleCount > 0 ? cyclesUntilLongBreak : 0);

  // Cálculo do perímetro circular do SVG
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Indicador do Objetivo Atual */}
      <div className="mb-4 text-center max-w-md px-4">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
          Objetivo em Foco
        </span>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
          {goalTitle}
        </h2>
      </div>

      {/* Anel Circular de Progresso com SVG */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 320 320"
          aria-hidden="true"
        >
          {/* Círculo de fundo */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Círculo animado de progresso */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            className={`transition-all duration-300 ease-linear ${themeStyles.stroke}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Informações Centrais com aria-live */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${themeStyles.badgeBg}`}>
            {SESSION_TYPE_LABELS[sessionType]}
          </span>

          <span className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatTimer(secondsLeft)}
          </span>

          {/* Contador de Ciclos */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Ciclo {currentCycleInSet} de {cyclesUntilLongBreak}</span>
            <div className="flex items-center gap-1 ml-1">
              {Array.from({ length: cyclesUntilLongBreak }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx < currentCycleInSet
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
