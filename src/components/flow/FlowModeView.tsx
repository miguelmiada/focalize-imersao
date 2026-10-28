/**
 * @file src/components/flow/FlowModeView.tsx
 * Visão de Modo Foco imersivo e livre de distrações com suporte a tela cheia,
 * atalhos de teclado e confirmação de saída se o cronômetro estiver em andamento.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGoals } from '../../context/GoalsContext';
import { useFlow } from '../../context/FlowContext';
import { useTimer } from '../../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { FlowControls } from './FlowControls';
import { FlowSettingsModal } from './FlowSettingsModal';
import { SessionHistoryModal } from './SessionHistoryModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { playChime, triggerHaptic } from '../../utils/audio';
import { formatDuration } from '../../utils/formatters';
import {
  Maximize2,
  Minimize2,
  Settings,
  History,
  ArrowLeft,
  Target,
  Sparkles,
} from 'lucide-react';

interface FlowModeViewProps {
  onExit: () => void;
}

export const FlowModeView: React.FC<FlowModeViewProps> = ({ onExit }) => {
  const { goals } = useGoals();
  const {
    activeGoalId,
    setActiveGoalId,
    sessionType,
    completedPomodoros,
    settings,
    isFullScreen,
    toggleFullScreen,
    advancePhase,
    logSession,
  } = useFlow();

  // Estados dos modais de apoio
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState<boolean>(false);
  const [cycleCompletedBanner, setCycleCompletedBanner] = useState<string | null>(null);

  // Calcula a duração em segundos para o tipo de sessão ativo
  const currentDurationSeconds = useMemo(() => {
    switch (sessionType) {
      case 'focus':
        return settings.focusMinutes * 60;
      case 'short_break':
        return settings.shortBreakMinutes * 60;
      case 'long_break':
        return settings.longBreakMinutes * 60;
    }
  }, [sessionType, settings]);

  const activeGoal = useMemo(
    () => goals.find((g) => g.id === activeGoalId),
    [goals, activeGoalId]
  );

  // Callback ao término natural do timer
  const handleTimerComplete = useCallback(() => {
    if (settings.soundEnabled) {
      playChime(sessionType === 'focus' ? 'focus_completed' : 'break_completed');
    }
    triggerHaptic();

    // Registra a sessão concluída
    logSession(currentDurationSeconds, sessionType, true);

    // Mensagem de feedback visual
    if (sessionType === 'focus') {
      setCycleCompletedBanner('Parabéns! Ciclo de foco concluído com sucesso.');
    } else {
      setCycleCompletedBanner('Pausa finalizada. Pronto para retomar o foco?');
    }

    // Avança para a próxima etapa (pausa ou foco)
    const { nextType } = advancePhase();

    // Configura nova duração
    const nextSeconds =
      nextType === 'focus'
        ? settings.focusMinutes * 60
        : nextType === 'short_break'
        ? settings.shortBreakMinutes * 60
        : settings.longBreakMinutes * 60;

    timer.reset(nextSeconds);

    if (
      (nextType !== 'focus' && settings.autoStartBreaks) ||
      (nextType === 'focus' && settings.autoStartFocus)
    ) {
      timer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sessionType,
    currentDurationSeconds,
    settings,
    logSession,
    advancePhase,
  ]);

  const timer = useTimer({
    initialSeconds: currentDurationSeconds,
    onComplete: handleTimerComplete,
  });

  // Atualiza o timer se a duração padrão foi alterada nas configurações
  useEffect(() => {
    if (!timer.isRunning && !timer.isPaused) {
      timer.reset(currentDurationSeconds);
    }
  }, [currentDurationSeconds, timer]);

  // Salva tempo decorrido ao encerrar antecipadamente
  const handleCompleteEarly = () => {
    const elapsedSeconds = currentDurationSeconds - timer.secondsLeft;
    if (elapsedSeconds > 10) {
      logSession(elapsedSeconds, sessionType, false);
    }
    timer.reset(currentDurationSeconds);
  };

  // Pula manualmente para a próxima fase
  const handleSkip = () => {
    const elapsedSeconds = currentDurationSeconds - timer.secondsLeft;
    if (elapsedSeconds > 30) {
      logSession(elapsedSeconds, sessionType, false);
    }
    const { nextType } = advancePhase();
    const nextSeconds =
      nextType === 'focus'
        ? settings.focusMinutes * 60
        : nextType === 'short_break'
        ? settings.shortBreakMinutes * 60
        : settings.longBreakMinutes * 60;
    timer.reset(nextSeconds);
  };

  // Validação ao tentar sair do Flow Mode com cronômetro em execução
  const handleAttemptExit = () => {
    if (timer.isRunning) {
      timer.pause();
      setIsConfirmExitOpen(true);
    } else {
      onExit();
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora atalhos se o foco estiver em inputs ou selects
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (timer.isRunning) {
          timer.pause();
        } else {
          timer.start();
        }
      } else if (e.code === 'KeyR') {
        timer.reset(currentDurationSeconds);
      } else if (e.code === 'KeyF') {
        toggleFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer, currentDurationSeconds, toggleFullScreen]);

  // Aviso no navegador antes de fechar a aba se o timer estiver correndo
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timer.isRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timer.isRunning]);

  return (
    <div className="relative min-h-[82vh] flex flex-col justify-between p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Barra Superior do Flow Mode */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleAttemptExit}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos Objetivos</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Seletor rápido de objetivo */}
          <div className="relative">
            <label htmlFor="flow-goal-select" className="sr-only">
              Alterar objetivo em foco
            </label>
            <select
              id="flow-goal-select"
              value={activeGoalId || ''}
              onChange={(e) => setActiveGoalId(e.target.value || null)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px] sm:max-w-[240px] truncate"
            >
              <option value="">Estudo Livre (Sem meta)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Histórico */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Abrir histórico de sessões"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Configurações */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Configurar tempos do timer"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Tela cheia */}
          <button
            type="button"
            onClick={toggleFullScreen}
            aria-label={isFullScreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Banner de Feedback de Ciclo Concluído */}
      {cycleCompletedBanner && (
        <div className="my-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-800 dark:text-blue-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{cycleCompletedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setCycleCompletedBanner(null)}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-medium ml-2"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Núcleo do Timer */}
      <div className="py-6 flex flex-col items-center justify-center">
        <TimerDisplay
          secondsLeft={timer.secondsLeft}
          totalDuration={timer.totalDuration}
          progress={timer.progress}
          sessionType={sessionType}
          cycleCount={completedPomodoros}
          cyclesUntilLongBreak={settings.cyclesUntilLongBreak}
          goalTitle={activeGoal ? activeGoal.title : 'Estudo Livre'}
        />

        <FlowControls
          isRunning={timer.isRunning}
          isPaused={timer.isPaused}
          onStartOrResume={timer.start}
          onPause={timer.pause}
          onReset={() => timer.reset(currentDurationSeconds)}
          onSkip={handleSkip}
          onCompleteEarly={handleCompleteEarly}
          canCompleteEarly={
            timer.totalDuration - timer.secondsLeft > 15 && sessionType === 'focus'
          }
        />
      </div>

      {/* Rodapé Informativo: Total Estudado no Objetivo e Atalhos */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          {activeGoal ? (
            <>
              <Target className="w-3.5 h-3.5 text-blue-500" />
              <span>
                Total acumulado nesta meta:{' '}
                <strong className="text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatDuration(activeGoal.totalStudiedSeconds)}
                </strong>
              </span>
            </>
          ) : (
            <span>Selecione um objetivo acima para contabilizar seu tempo nele.</span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">Espaço</kbd> Iniciar/Pausar</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">R</kbd> Reiniciar</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">F</kbd> Tela Cheia</span>
        </div>
      </div>

      {/* Modais de Suporte */}
      <FlowSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Confirmação de Saída com Sessão Ativa */}
      <ConfirmDialog
        isOpen={isConfirmExitOpen}
        title="Sessão em andamento"
        message="Seu cronômetro está em execução. Se você sair agora, o tempo em curso não salvo será descartado. Deseja realmente sair do Flow Mode?"
        confirmLabel="Sim, sair"
        cancelLabel="Continuar no foco"
        isDestructive
        onConfirm={onExit}
        onCancel={() => {
          setIsConfirmExitOpen(false);
          timer.start();
        }}
      />
    </div>
  );
};
