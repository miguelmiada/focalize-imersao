/**
 * @file src/components/goals/GoalFilters.tsx
 * Controles de filtragem, busca e ordenação de objetivos de estudo.
 */

import React from 'react';
import { GoalFiltersState, GoalPriority, GoalStatus, SortByOption } from '../../types';
import { Search, ArrowUpDown, X } from 'lucide-react';

interface GoalFiltersProps {
  filters: GoalFiltersState;
  onFilterChange: (filters: GoalFiltersState) => void;
  categories: string[];
}

export const GoalFilters: React.FC<GoalFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
}) => {
  const updateField = <K extends keyof GoalFiltersState>(key: K, value: GoalFiltersState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.priority !== 'all';

  const resetFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      category: 'all',
      priority: 'all',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Linha principal: Busca e Categorias */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <label htmlFor="goal-search" className="sr-only">
            Buscar objetivos
          </label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="goal-search"
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={filters.search}
            onChange={(e) => updateField('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => updateField('search', '')}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Categoria */}
          <label htmlFor="goal-category-filter" className="sr-only">
            Filtrar por matéria
          </label>
          <select
            id="goal-category-filter"
            value={filters.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Matérias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Seletor de Prioridade */}
          <label htmlFor="goal-priority-filter" className="sr-only">
            Filtrar por prioridade
          </label>
          <select
            id="goal-priority-filter"
            value={filters.priority}
            onChange={(e) => updateField('priority', e.target.value as GoalPriority | 'all')}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Qualquer Prioridade</option>
            <option value="high">Alta Prioridade</option>
            <option value="medium">Média Prioridade</option>
            <option value="low">Baixa Prioridade</option>
          </select>

          {/* Ordenação */}
          <label htmlFor="goal-sort-filter" className="sr-only">
            Ordenar por
          </label>
          <select
            id="goal-sort-filter"
            value={filters.sortBy}
            onChange={(e) => updateField('sortBy', e.target.value as SortByOption)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Criado recentemente</option>
            <option value="deadline">Prazo de entrega</option>
            <option value="priority">Prioridade</option>
            <option value="studied">Tempo estudado</option>
            <option value="title">Título (A-Z)</option>
          </select>

          <button
            type="button"
            onClick={() =>
              updateField('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')
            }
            aria-label={`Alternar ordem para ${
              filters.sortDirection === 'asc' ? 'decrescente' : 'crescente'
            }`}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented status controls e botão de limpar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs">
          {(
            [
              { key: 'all', label: 'Todos' },
              { key: 'in_progress', label: 'Em Andamento' },
              { key: 'pending', label: 'Pendentes' },
              { key: 'completed', label: 'Concluídos' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateField('status', item.key as GoalStatus | 'all')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.status === item.key
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
};
