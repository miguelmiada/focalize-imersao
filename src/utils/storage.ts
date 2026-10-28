/**
 * @file src/utils/storage.ts
 * Utilitário seguro para interação com o localStorage do navegador.
 * Possui suporte a chaves versionadas, detecção de corrupção de JSON,
 * type guards e tratamento de quota esgotada.
 */

import { Goal, StudySession, FlowSettings } from '../types';

export const STORAGE_KEYS = {
  GOALS: 'focalize:v1:goals',
  SESSIONS: 'focalize:v1:sessions',
  SETTINGS: 'focalize:v1:settings',
  THEME: 'focalize:v1:theme',
} as const;

export const DEFAULT_SETTINGS: FlowSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartFocus: false,
};

/**
 * Type guard para validar se um objeto desconhecido é um Goal válido.
 */
export function isGoal(item: unknown): item is Goal {
  if (typeof item !== 'object' || item === null) return false;
  const g = item as Partial<Goal>;
  return (
    typeof g.id === 'string' &&
    typeof g.title === 'string' &&
    typeof g.description === 'string' &&
    typeof g.category === 'string' &&
    (g.priority === 'low' || g.priority === 'medium' || g.priority === 'high') &&
    typeof g.deadline === 'string' &&
    (g.status === 'pending' || g.status === 'in_progress' || g.status === 'completed') &&
    typeof g.createdAt === 'string' &&
    typeof g.updatedAt === 'string' &&
    typeof g.totalStudiedSeconds === 'number'
  );
}

/**
 * Type guard para validar lista de Goals.
 */
export function isGoalList(data: unknown): data is Goal[] {
  return Array.isArray(data) && data.every(isGoal);
}

/**
 * Type guard para validar se um objeto é uma StudySession.
 */
export function isStudySession(item: unknown): item is StudySession {
  if (typeof item !== 'object' || item === null) return false;
  const s = item as Partial<StudySession>;
  return (
    typeof s.id === 'string' &&
    (s.goalId === null || typeof s.goalId === 'string') &&
    typeof s.goalTitle === 'string' &&
    typeof s.startedAt === 'string' &&
    typeof s.endedAt === 'string' &&
    typeof s.durationSeconds === 'number' &&
    (s.type === 'focus' || s.type === 'short_break' || s.type === 'long_break') &&
    typeof s.completed === 'boolean'
  );
}

/**
 * Type guard para validar lista de StudySessions.
 */
export function isStudySessionList(data: unknown): data is StudySession[] {
  return Array.isArray(data) && data.every(isStudySession);
}

/**
 * Type guard para validar FlowSettings.
 */
export function isFlowSettings(item: unknown): item is FlowSettings {
  if (typeof item !== 'object' || item === null) return false;
  const s = item as Partial<FlowSettings>;
  return (
    typeof s.focusMinutes === 'number' &&
    s.focusMinutes > 0 &&
    typeof s.shortBreakMinutes === 'number' &&
    s.shortBreakMinutes > 0 &&
    typeof s.longBreakMinutes === 'number' &&
    s.longBreakMinutes > 0 &&
    typeof s.cyclesUntilLongBreak === 'number' &&
    s.cyclesUntilLongBreak > 0 &&
    typeof s.soundEnabled === 'boolean' &&
    typeof s.autoStartBreaks === 'boolean' &&
    typeof s.autoStartFocus === 'boolean'
  );
}

/**
 * Lê item do localStorage com fallback seguro e validação opcional.
 */
export function loadFromStorage<T>(
  key: string,
  fallback: T,
  validator?: (data: unknown) => data is T
): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;

    const parsed: unknown = JSON.parse(raw);

    if (validator) {
      if (validator(parsed)) {
        return parsed;
      }
      console.warn(`[Focalize Storage] Dados inválidos na chave "${key}". Usando fallback.`);
      return fallback;
    }

    return parsed as T;
  } catch (err) {
    console.error(`[Focalize Storage] Falha ao ler ou converter "${key}". Fallback acionado.`, err);
    return fallback;
  }
}

/**
 * Salva item no localStorage com tratamento de exceções (ex.: QuotaExceededError).
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`[Focalize Storage] Não foi possível persistir dados em "${key}".`, err);
    return false;
  }
}

/**
 * Remove chave do storage.
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error(`[Focalize Storage] Erro ao remover chave "${key}".`, err);
  }
}

/**
 * Conjunto inicial de objetivos demonstrativos caso o usuário inicie pela primeira vez.
 */
export const INITIAL_SEED_GOALS: Goal[] = [
  {
    id: 'seed-goal-1',
    title: 'Aprender Fundamentos de TypeScript & Tipagem Estrita',
    description: 'Estudar tipos utilitários, generics, type guards e configuração do tsconfig com strict: true.',
    category: 'Programação',
    priority: 'high',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    totalStudiedSeconds: 3600, // 1h
  },
  {
    id: 'seed-goal-2',
    title: 'Revisar Cálculo Diferencial e Integral',
    description: 'Resolver exercícios de derivadas parciais e aplicações em otimização.',
    category: 'Matemática',
    priority: 'medium',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalStudiedSeconds: 1500, // 25 min
  },
  {
    id: 'seed-goal-3',
    title: 'Leitura do Livro "Clean Code" - Capítulos 1 a 4',
    description: 'Anotar práticas sobre nomes expressivos, funções pequenas e comentários limpos.',
    category: 'Leitura',
    priority: 'low',
    deadline: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    status: 'completed',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    totalStudiedSeconds: 5400, // 1h30
  },
];
