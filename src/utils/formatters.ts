/**
 * @file src/utils/formatters.ts
 * Utilitários para formatação de tempo, prazos, datas e rótulos semânticos.
 */

import { GoalPriority, GoalStatus, SessionType } from '../types';

/**
 * Formata segundos no formato MM:SS para o timer.
 */
export function formatTimer(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSec / 60);
  const seconds = safeSec % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formata segundos em exibição amigável de horas e minutos (ex.: "2h 30m" ou "45m").
 */
export function formatDuration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);

  if (hours === 0 && minutes === 0) {
    return safeSec > 0 ? `${safeSec}s` : '0m';
  }
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Formata string de data ISO ou YYYY-MM-DD para o padrão brasileiro (DD/MM/AAAA).
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Sem prazo';

  try {
    // Para YYYY-MM-DD simples, evita desvio de fuso horário
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata data e hora para o histórico de sessões.
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Avalia o status do prazo em relação ao dia atual.
 */
export function getDeadlineInfo(deadline: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isSoon: boolean;
} {
  if (!deadline) {
    return { label: 'Sem prazo', isOverdue: false, isToday: false, isSoon: false };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      const [y, m, d] = deadline.split('-').map(Number);
      targetDate = new Date(y, m - 1, d);
    } else {
      targetDate = new Date(deadline);
      targetDate.setHours(0, 0, 0, 0);
    }

    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      const past = Math.abs(diffDays);
      return {
        label: past === 1 ? 'Atrasado há 1 dia' : `Atrasado há ${past} dias`,
        isOverdue: true,
        isToday: false,
        isSoon: false,
      };
    }

    if (diffDays === 0) {
      return { label: 'Vence hoje', isOverdue: false, isToday: true, isSoon: false };
    }

    if (diffDays === 1) {
      return { label: 'Vence amanhã', isOverdue: false, isToday: false, isSoon: true };
    }

    if (diffDays <= 3) {
      return { label: `Vence em ${diffDays} dias`, isOverdue: false, isToday: false, isSoon: true };
    }

    return { label: formatDate(deadline), isOverdue: false, isToday: false, isSoon: false };
  } catch {
    return { label: deadline, isOverdue: false, isToday: false, isSoon: false };
  }
}

export const PRIORITY_LABELS: Record<GoalPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export const STATUS_LABELS: Record<GoalStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  focus: 'Foco Profundo',
  short_break: 'Pausa Curta',
  long_break: 'Pausa Longa',
};
