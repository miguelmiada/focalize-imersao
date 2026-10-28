/**
 * @file src/hooks/useTimer.ts
 * Hook de timer de alta precisão com compensação de delta de timestamp
 * para prevenir atrasos quando a aba fica em segundo plano.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTimerOptions {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (secondsLeft: number) => void;
}

export interface UseTimerReturn {
  secondsLeft: number;
  totalDuration: number;
  isRunning: boolean;
  isPaused: boolean;
  progress: number; // 0 a 1
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTotalSeconds?: number) => void;
  setDuration: (newTotalSeconds: number) => void;
}

export function useTimer({
  initialSeconds,
  onComplete,
  onTick,
}: UseTimerOptions): UseTimerReturn {
  const [totalDuration, setTotalDuration] = useState<number>(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const endTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  onCompleteRef.current = onComplete;
  onTickRef.current = onTick;

  // Limpa qualquer interval ativo
  const clearTimerInterval = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimerInterval();
    const targetEnd = Date.now() + secondsLeft * 1000;
    endTimeRef.current = targetEnd;
    setIsRunning(true);
    setIsPaused(false);

    timerIntervalRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const now = Date.now();
      const remainingMs = Math.max(0, endTimeRef.current - now);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setSecondsLeft(remainingSec);
      if (onTickRef.current) {
        onTickRef.current(remainingSec);
      }

      if (remainingSec <= 0) {
        clearTimerInterval();
        setIsRunning(false);
        setIsPaused(false);
        endTimeRef.current = null;
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, 250);
  }, [clearTimerInterval, secondsLeft]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    clearTimerInterval();
    setIsPaused(true);
    setIsRunning(false);
  }, [clearTimerInterval, isRunning, isPaused]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    start();
  }, [isPaused, start]);

  const reset = useCallback(
    (newTotalSeconds?: number) => {
      clearTimerInterval();
      const targetSec = newTotalSeconds !== undefined ? newTotalSeconds : totalDuration;
      setSecondsLeft(targetSec);
      if (newTotalSeconds !== undefined) {
        setTotalDuration(newTotalSeconds);
      }
      setIsRunning(false);
      setIsPaused(false);
      endTimeRef.current = null;
    },
    [clearTimerInterval, totalDuration]
  );

  const setDuration = useCallback(
    (newTotalSeconds: number) => {
      reset(newTotalSeconds);
    },
    [reset]
  );

  // Limpa recursos ao desmontar o componente
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const progress =
    totalDuration > 0
      ? Math.min(1, Math.max(0, (totalDuration - secondsLeft) / totalDuration))
      : 0;

  return {
    secondsLeft,
    totalDuration,
    isRunning,
    isPaused,
    progress,
    start,
    pause,
    resume,
    reset,
    setDuration,
  };
}
