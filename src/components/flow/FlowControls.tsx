/**
 * @file src/components/flow/FlowControls.tsx
 * Controles de reprodução, pausa, reinício e avanço de fase do Flow Mode.
 */

import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCheck } from 'lucide-react';

interface FlowControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStartOrResume: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onCompleteEarly: () => void;
  canCompleteEarly: boolean;
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  isRunning,
  isPaused,
  onStartOrResume,
  onPause,
  onReset,
  onSkip,
  onCompleteEarly,
  canCompleteEarly,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
      {/* Botão de Reset */}
      <button
        type="button"
        onClick={onReset}
        title="Reiniciar contador (R)"
        aria-label="Reiniciar contador"
        className="p-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Botão Principal: Play / Pause */}
      {isRunning ? (
        <button
          type="button"
          onClick={onPause}
          title="Pausar (Espaço)"
          aria-label="Pausar timer"
          className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <Pause className="w-5 h-5 fill-current" />
          <span className="text-sm font-semibold">Pausar</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartOrResume}
          title={isPaused ? 'Retomar (Espaço)' : 'Iniciar (Espaço)'}
          aria-label={isPaused ? 'Retomar timer' : 'Iniciar timer'}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <Play className="w-5 h-5 fill-current" />
          <span className="text-sm font-semibold">{isPaused ? 'Retomar' : 'Iniciar'}</span>
        </button>
      )}

      {/* Botão Pular Fase */}
      <button
        type="button"
        onClick={onSkip}
        title="Pular para a próxima fase"
        aria-label="Pular para a próxima fase"
        className="p-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        <SkipForward className="w-5 h-5" />
      </button>

      {/* Botão Concluir Antecipadamente (apenas se houver progresso) */}
      {canCompleteEarly && (
        <button
          type="button"
          onClick={onCompleteEarly}
          title="Salvar e concluir sessão agora"
          aria-label="Concluir e registrar tempo estudado agora"
          className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Salvar Tempo</span>
        </button>
      )}
    </div>
  );
};
