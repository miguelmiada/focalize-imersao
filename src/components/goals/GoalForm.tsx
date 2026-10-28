/**
 * @file src/components/goals/GoalForm.tsx
 * Formulário reutilizado para criação e edição de objetivos de estudo com validação completa.
 */

import React, { useState, useEffect } from 'react';
import { Goal, GoalFormData, FormValidationErrors } from '../../types';
import { validateGoalForm } from '../../utils/validation';
import { Modal } from '../common/Modal';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
  goalToEdit?: Goal | null;
  existingCategories?: string[];
}

const INITIAL_FORM: GoalFormData = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  deadline: '',
  status: 'pending',
};

export const GoalForm: React.FC<GoalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goalToEdit,
  existingCategories = [],
}) => {
  const [formData, setFormData] = useState<GoalFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof GoalFormData, boolean>>>({});

  const isEditing = Boolean(goalToEdit);

  useEffect(() => {
    if (goalToEdit) {
      setFormData({
        title: goalToEdit.title,
        description: goalToEdit.description,
        category: goalToEdit.category,
        priority: goalToEdit.priority,
        deadline: goalToEdit.deadline,
        status: goalToEdit.status,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
    setTouched({});
  }, [goalToEdit, isOpen]);

  const handleChange = (field: keyof GoalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const validation = validateGoalForm({ ...formData, [field]: value });
      setErrors(validation.errors);
    }
  };

  const handleBlur = (field: keyof GoalFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validation = validateGoalForm(formData);
    setErrors(validation.errors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateGoalForm(formData);
    setTouched({
      title: true,
      description: true,
      category: true,
      deadline: true,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Objetivo' : 'Novo Objetivo de Estudo'}
      description={
        isEditing
          ? 'Atualize os detalhes, prioridade ou prazo do seu plano de estudo.'
          : 'Defina claramente a matéria, escopo e prioridade para manter o foco.'
      }
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Campo Título */}
        <div>
          <label
            htmlFor="goal-title"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Título do Objetivo <span className="text-rose-500">*</span>
          </label>
          <input
            id="goal-title"
            type="text"
            required
            placeholder="Ex.: Dominar Algoritmos de Ordenação em Java"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.title && touched.title
                ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500'
            }`}
          />
          {errors.title && touched.title && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        {/* Campo Descrição */}
        <div>
          <label
            htmlFor="goal-desc"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Descrição ou Escopo (Opcional)
          </label>
          <textarea
            id="goal-desc"
            rows={3}
            placeholder="Descreva capítulos, exercícios, tópicos principais ou metas específicas..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
          />
          {errors.description && touched.description && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        {/* Linha Dupla: Categoria e Prazo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="goal-category"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Matéria ou Categoria
            </label>
            <input
              id="goal-category"
              type="text"
              list="category-suggestions"
              placeholder="Ex.: Programação, Física, Idiomas"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              onBlur={() => handleBlur('category')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {existingCategories.length > 0 && (
              <datalist id="category-suggestions">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
            {errors.category && touched.category && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400" role="alert">
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="goal-deadline"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Prazo Estimado
            </label>
            <input
              id="goal-deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              onBlur={() => handleBlur('deadline')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.deadline && touched.deadline && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400" role="alert">
                {errors.deadline}
              </p>
            )}
          </div>
        </div>

        {/* Linha Dupla: Prioridade e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nível de Prioridade
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
              {(
                [
                  { value: 'low', label: 'Baixa' },
                  { value: 'medium', label: 'Média' },
                  { value: 'high', label: 'Alta' },
                ] as const
              ).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleChange('priority', p.value)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    formData.priority === p.value
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="goal-status"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Status Inicial
            </label>
            <select
              id="goal-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
        </div>

        {/* Ações de envio */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Objetivo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
