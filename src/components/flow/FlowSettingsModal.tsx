/**
 * @file src/components/flow/FlowSettingsModal.tsx
 * Modal de personalização de tempos do Pomodoro, ciclos e alertas sonoros.
 */

import React, { useState, useEffect } from 'react';
import { FlowSettings } from '../../types';
import { useFlow } from '../../context/FlowContext';
import { Modal } from '../common/Modal';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface FlowSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlowSettingsModal: React.FC<FlowSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, resetSettings } = useFlow();

  const [form, setForm] = useState<FlowSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      focusMinutes: Math.max(1, Math.min(120, Number(form.focusMinutes))),
      shortBreakMinutes: Math.max(1, Math.min(30, Number(form.shortBreakMinutes))),
      longBreakMinutes: Math.max(1, Math.min(60, Number(form.longBreakMinutes))),
      cyclesUntilLongBreak: Math.max(1, Math.min(10, Number(form.cyclesUntilLongBreak))),
      soundEnabled: form.soundEnabled,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações do Flow Mode"
      description="Personalize os intervalos de foco, pausas e notificações sonoras."
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Minutos de Foco */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="settings-focus"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Duração do Foco (minutos)
            </label>
            <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
              {form.focusMinutes} min
            </span>
          </div>
          <input
            id="settings-focus"
            type="range"
            min="1"
            max="90"
            value={form.focusMinutes}
            onChange={(e) => setForm({ ...form, focusMinutes: Number(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Minutos de Pausa Curta */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="settings-short-break"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Pausa Curta (minutos)
            </label>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {form.shortBreakMinutes} min
            </span>
          </div>
          <input
            id="settings-short-break"
            type="range"
            min="1"
            max="20"
            value={form.shortBreakMinutes}
            onChange={(e) => setForm({ ...form, shortBreakMinutes: Number(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* Minutos de Pausa Longa */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="settings-long-break"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Pausa Longa (minutos)
            </label>
            <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
              {form.longBreakMinutes} min
            </span>
          </div>
          <input
            id="settings-long-break"
            type="range"
            min="5"
            max="45"
            value={form.longBreakMinutes}
            onChange={(e) => setForm({ ...form, longBreakMinutes: Number(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Ciclos até Pausa Longa */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="settings-cycles"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Ciclos de foco antes da pausa longa
            </label>
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              {form.cyclesUntilLongBreak} ciclos
            </span>
          </div>
          <input
            id="settings-cycles"
            type="number"
            min="1"
            max="8"
            value={form.cyclesUntilLongBreak}
            onChange={(e) => setForm({ ...form, cyclesUntilLongBreak: Number(e.target.value) })}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Toggle de Alerta Sonoro */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {form.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Alerta sonoro ao fim de cada ciclo
            </span>
          </div>
          <input
            type="checkbox"
            checked={form.soundEnabled}
            onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        {/* Rodapé com Ações */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrões</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
