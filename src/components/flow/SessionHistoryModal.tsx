/**
 * @file src/components/flow/SessionHistoryModal.tsx
 * Histórico de sessões de estudo com detalhamento de objetivo, data, duração e limpeza segura.
 */

import React, { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDateTime, formatDuration, SESSION_TYPE_LABELS } from '../../utils/formatters';
import { Trash2, History, CheckCircle2, Clock } from 'lucide-react';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sessions, clearHistory } = useFlow();
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);

  const focusSessions = sessions.filter((s) => s.type === 'focus');
  const totalFocusSeconds = focusSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Histórico de Sessões"
        description="Registro de todos os blocos de foco e pausas cronometradas."
        maxWidthClass="max-w-2xl"
      >
        {/* Resumo rápido */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Sessões de Foco
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {focusSessions.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Tempo Total Registrado
            </span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {formatDuration(totalFocusSeconds)}
            </span>
          </div>
        </div>

        {/* Lista de sessões */}
        {sessions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhuma sessão registrada ainda.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Conclua um ciclo no Flow Mode para acompanhar seus registros aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-xs"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {session.goalTitle}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        session.type === 'focus'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {SESSION_TYPE_LABELS[session.type]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTime(session.startedAt)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatDuration(session.durationSeconds)}
                  </span>
                  {session.completed && (
                    <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completa</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rodapé com botão de limpar histórico */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {sessions.length > 0 ? (
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar histórico</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        title="Limpar Histórico"
        message="Tem certeza que deseja apagar todas as sessões registradas? Os tempos totais já atribuídos aos objetivos não serão afetados."
        confirmLabel="Sim, limpar histórico"
        cancelLabel="Cancelar"
        isDestructive
        onConfirm={clearHistory}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </>
  );
};
