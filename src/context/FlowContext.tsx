/**
 * @file src/context/FlowContext.tsx
 * Gerenciador de estado do Flow Mode (Pomodoro, sessões de estudo, histórico e preferências).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FlowSettings, SessionType, StudySession } from '../types';
import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  isFlowSettings,
  isStudySessionList,
  loadFromStorage,
  saveToStorage,
} from '../utils/storage';
import { useGoals } from './GoalsContext';

interface FlowContextValue {
  activeGoalId: string | null;
  sessionType: SessionType;
  completedPomodoros: number;
  settings: FlowSettings;
  sessions: StudySession[];
  isFullScreen: boolean;
  setActiveGoalId: (goalId: string | null) => void;
  setSessionType: (type: SessionType) => void;
  advancePhase: () => { nextType: SessionType; nextCycles: number };
  logSession: (durationSeconds: number, type: SessionType, completed: boolean) => void;
  updateSettings: (newSettings: Partial<FlowSettings>) => void;
  resetSettings: () => void;
  clearHistory: () => void;
  toggleFullScreen: () => void;
  setIsFullScreen: (val: boolean) => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { goals, recordStudyTime } = useGoals();

  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Carrega e sincroniza configurações
  const [settings, setSettings] = useState<FlowSettings>(() => {
    return loadFromStorage<FlowSettings>(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_SETTINGS,
      isFlowSettings
    );
  });

  // Carrega e sincroniza histórico de sessões
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    return loadFromStorage<StudySession[]>(
      STORAGE_KEYS.SESSIONS,
      [],
      isStudySessionList
    );
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  }, [sessions]);

  // Se o objetivo ativo for deletado em outro ponto, remove a referência
  useEffect(() => {
    if (activeGoalId && !goals.some((g) => g.id === activeGoalId)) {
      setActiveGoalId(null);
    }
  }, [goals, activeGoalId]);

  const updateSettings = useCallback((newSettings: Partial<FlowSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
  }, []);

  /**
   * Registra uma sessão no histórico e acumula tempo no objetivo se for foco.
   */
  const logSession = useCallback(
    (durationSeconds: number, type: SessionType, completed: boolean) => {
      if (durationSeconds <= 0) return;

      const matchedGoal = goals.find((g) => g.id === activeGoalId);
      const goalTitle = matchedGoal ? matchedGoal.title : 'Estudo Livre';

      const now = new Date();
      const startedAt = new Date(now.getTime() - durationSeconds * 1000).toISOString();
      const endedAt = now.toISOString();

      const newSession: StudySession = {
        id: crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        goalId: activeGoalId,
        goalTitle,
        startedAt,
        endedAt,
        durationSeconds,
        type,
        completed,
      };

      setSessions((prev) => [newSession, ...prev]);

      // Se for sessão de foco, incrementa os segundos estudados no objetivo
      if (type === 'focus' && activeGoalId) {
        recordStudyTime(activeGoalId, durationSeconds);
      }
    },
    [activeGoalId, goals, recordStudyTime]
  );

  /**
   * Calcula o próximo estágio do Pomodoro de acordo com as regras tradicionais:
   * 4 ciclos de foco intercalados com pausa curta; ao 4º ciclo, pausa longa.
   */
  const advancePhase = useCallback((): { nextType: SessionType; nextCycles: number } => {
    if (sessionType === 'focus') {
      const nextCount = completedPomodoros + 1;
      setCompletedPomodoros(nextCount);

      const isLongBreak = nextCount % settings.cyclesUntilLongBreak === 0;
      const nextType: SessionType = isLongBreak ? 'long_break' : 'short_break';
      setSessionType(nextType);
      return { nextType, nextCycles: nextCount };
    } else {
      // De volta ao foco
      setSessionType('focus');
      return { nextType: 'focus', nextCycles: completedPomodoros };
    }
  }, [completedPomodoros, sessionType, settings.cyclesUntilLongBreak]);

  const toggleFullScreen = useCallback(() => {
    if (typeof document === 'undefined') return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Ignora se bloqueado pelo navegador
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
    }
  }, []);

  // Monitora alterações de tela cheia disparadas pela tecla ESC ou pelo navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const value: FlowContextValue = {
    activeGoalId,
    sessionType,
    completedPomodoros,
    settings,
    sessions,
    isFullScreen,
    setActiveGoalId,
    setSessionType,
    advancePhase,
    logSession,
    updateSettings,
    resetSettings,
    clearHistory,
    toggleFullScreen,
    setIsFullScreen,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow deve ser utilizado dentro de um FlowProvider');
  }
  return context;
}
