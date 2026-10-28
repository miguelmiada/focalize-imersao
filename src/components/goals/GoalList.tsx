/**
 * @file src/components/goals/GoalList.tsx
 * Lista principal de objetivos de estudo com filtros, ordenação e diálogo de confirmação.
 */

import React, { useState, useMemo } from 'react';
import { Goal, GoalFiltersState, GoalFormData } from '../../types';
import { useGoals } from '../../context/GoalsContext';
import { GoalCard } from './GoalCard';
import { GoalFilters } from './GoalFilters';
import { GoalForm } from './GoalForm';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { Plus, RotateCcw } from 'lucide-react';

interface GoalListProps {
  onStartFlow: (goal: Goal) => void;
}

const DEFAULT_FILTERS: GoalFiltersState = {
  search: '',
  status: 'all',
  category: 'all',
  priority: 'all',
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

export const GoalList: React.FC<GoalListProps> = ({ onStartFlow }) => {
  const {
    goals,
    categories,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    resetToInitialSeed,
  } = useGoals();

  const [filters, setFilters] = useState<GoalFiltersState>(DEFAULT_FILTERS);

  // Estados de controle de modais
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Filtragem e ordenação dos objetivos
  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        // Busca textual
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchTitle = goal.title.toLowerCase().includes(query);
          const matchDesc = goal.description.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc) return false;
        }

        // Filtro de status
        if (filters.status !== 'all' && goal.status !== filters.status) {
          return false;
        }

        // Filtro de matéria / categoria
        if (filters.category !== 'all' && goal.category !== filters.category) {
          return false;
        }

        // Filtro de prioridade
        if (filters.priority !== 'all' && goal.priority !== filters.priority) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;

        if (filters.sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        } else if (filters.sortBy === 'deadline') {
          if (!a.deadline && !b.deadline) comp = 0;
          else if (!a.deadline) comp = 1;
          else if (!b.deadline) comp = -1;
          else comp = a.deadline.localeCompare(b.deadline);
        } else if (filters.sortBy === 'priority') {
          const priorityWeights = { high: 3, medium: 2, low: 1 };
          comp = priorityWeights[b.priority] - priorityWeights[a.priority];
        } else if (filters.sortBy === 'studied') {
          comp = b.totalStudiedSeconds - a.totalStudiedSeconds;
        } else {
          // createdAt
          comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return filters.sortDirection === 'asc' ? comp : -comp;
      });
  }, [goals, filters]);

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
  };

  const targetDeleteGoal = goals.find((g) => g.id === deletingGoalId);

  return (
    <div>
      {/* Barra de ação superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Meus Objetivos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize suas matérias, defina prioridades e avance no seu cronograma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {goals.length === 0 && (
            <button
              type="button"
              onClick={resetToInitialSeed}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Carregar Exemplos</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCreateClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Objetivo</span>
          </button>
        </div>
      </div>

      {/* Controles de filtro se houver objetivos */}
      {goals.length > 0 && (
        <GoalFilters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
        />
      )}

      {/* Grid de objetivos ou Estados Vazios */}
      {goals.length === 0 ? (
        <EmptyState
          title="Nenhum objetivo cadastrado ainda"
          description="Crie seu primeiro objetivo de estudo para começar a planejar suas horas e sessões de foco."
          actionLabel="Criar Primeiro Objetivo"
          onAction={handleCreateClick}
        />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          title="Nenhum objetivo encontrado com esses filtros"
          description="Tente ajustar os termos de busca, limpar filtros de prioridade ou status."
          actionLabel="Limpar Todos os Filtros"
          onAction={() => setFilters(DEFAULT_FILTERS)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditClick}
              onDelete={setDeletingGoalId}
              onToggleStatus={toggleGoalStatus}
              onStartFlow={onStartFlow}
            />
          ))}
        </div>
      )}

      {/* Modal de Formulário (Criar / Editar) */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        goalToEdit={editingGoal}
        existingCategories={categories}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={deletingGoalId !== null}
        title="Excluir Objetivo"
        message={`Tem certeza que deseja excluir o objetivo "${targetDeleteGoal?.title || ''}"? Esta ação não pode ser desfeita e removerá o progresso associado.`}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        isDestructive
        onConfirm={() => {
          if (deletingGoalId) deleteGoal(deletingGoalId);
        }}
        onCancel={() => setDeletingGoalId(null)}
      />
    </div>
  );
};
