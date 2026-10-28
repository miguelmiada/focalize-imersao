/**
 * @file src/components/layout/Navbar.tsx
 * Barra de navegação principal seguindo o Top Bar Contract (3 zonas, uma única linha).
 */

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: 'goals' | 'flow';
  onNavigate: (view: 'goals' | 'flow') => void;
  onOpenNewGoalModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenNewGoalModal,
  onOpenHistoryModal,
  onOpenSettingsModal,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zona 1: Brand Wordmark (um único elemento textual limpo) */}
        <button
          type="button"
          onClick={() => onNavigate('goals')}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500 inline-block" aria-hidden="true" />
          <span>Focalize</span>
        </button>

        {/* Zona 2: Links de navegação principais (1 linha, rótulos objetivos) */}
        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          <button
            type="button"
            onClick={() => onNavigate('goals')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'goals'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Objetivos
          </button>

          <button
            type="button"
            onClick={() => onNavigate('flow')}
            className={`inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'flow'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flow Mode</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistoryModal}
            className="hidden sm:inline-block hover:text-slate-900 dark:hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Histórico
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="hidden sm:inline-block hover:text-slate-900 dark:hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Configurações
          </button>
        </nav>

        {/* Zona 3: Ação Primária + Alternador de Tema */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentView === 'goals' ? (
            <button
              type="button"
              onClick={onOpenNewGoalModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Objetivo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('goals')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-800"
            >
              Ver Objetivos
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
