/**
 * @file src/utils/validation.ts
 * Validações de formulário do Focalize com mensagens em português.
 */

import { GoalFormData, FormValidationErrors } from '../types';

export function validateGoalForm(data: GoalFormData): {
  isValid: boolean;
  errors: FormValidationErrors;
} {
  const errors: FormValidationErrors = {};

  // Título: obrigatório, entre 3 e 100 caracteres
  const trimmedTitle = data.title.trim();
  if (!trimmedTitle) {
    errors.title = 'O título do objetivo é obrigatório.';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'O título deve ter pelo menos 3 caracteres.';
  } else if (trimmedTitle.length > 100) {
    errors.title = 'O título não pode exceder 100 caracteres.';
  }

  // Descrição: opcional, mas no máximo 500 caracteres
  if (data.description && data.description.length > 500) {
    errors.description = 'A descrição não pode exceder 500 caracteres.';
  }

  // Categoria: opcional, máximo 40 caracteres
  if (data.category && data.category.length > 40) {
    errors.category = 'A matéria ou categoria deve ter no máximo 40 caracteres.';
  }

  // Prazo: se preenchido, deve ser uma data válida
  if (data.deadline) {
    const parsedDate = new Date(data.deadline);
    if (isNaN(parsedDate.getTime())) {
      errors.deadline = 'Por favor, insira uma data de prazo válida.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
