/**
 * @file src/hooks/useLocalStorage.ts
 * Hook React customizado para gerenciar estado sincronizado com localStorage de forma reativa e segura.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (data: unknown) => data is T
): [T, (valOrUpdater: T | ((prev: T) => T)) => void] {
  // Inicializa o estado a partir do storage seguro
  const [storedValue, setStoredValue] = useState<T>(() => {
    return loadFromStorage<T>(key, initialValue, validator);
  });

  const validatorRef = useRef(validator);
  validatorRef.current = validator;

  // Atualiza o storage e o estado local
  const setValue = useCallback(
    (valOrUpdater: T | ((prev: T) => T)) => {
      setStoredValue((current) => {
        const nextValue =
          typeof valOrUpdater === 'function'
            ? (valOrUpdater as (prev: T) => T)(current)
            : valOrUpdater;

        saveToStorage(key, nextValue);
        return nextValue;
      });
    },
    [key]
  );

  // Escuta alterações de storage vindas de outras abas ou janelas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (!validatorRef.current || validatorRef.current(parsed)) {
            setStoredValue(parsed);
          }
        } catch {
          // Ignora se o JSON for inválido
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
