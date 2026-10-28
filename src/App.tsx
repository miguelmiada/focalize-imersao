/**
 * @file src/App.tsx
 * Ponto de entrada central do Focalize integrando Providers, Visões e Navegação.
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { GoalsProvider, useGoals } from './context/GoalsContext';
import { FlowProvider, useFlow } from './context/FlowContext';
import { Goal, GoalFormData } from './types';
import { Navbar } from './components/layout/Navbar';
import { GoalStats } from './components/goals/GoalStats';
import { GoalList } from './components/goals/GoalList';
import { GoalForm } from './components/goals/GoalForm';
import { FlowModeView } from './components/flow/FlowModeView';
import { FlowSettingsModal } from './components/flow/FlowSettingsModal';
import { SessionHistoryModal } from './components/flow/SessionHistoryModal';

const FocalizeApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'goals' | 'flow'>('goals');
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const { addGoal, categories } = useGoals();
  const { setActiveGoalId } = useFlow();

  const handleStartFlowWithGoal = (goal: Goal) => {
    setActiveGoalId(goal.id);
    setCurrentView('flow');
  };

  const handleCreateGoal = (data: GoalFormData) => {
    addGoal(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNewGoalModal={() => setIsNewGoalModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'goals' ? (
          <div>
            <GoalStats />
            <GoalList onStartFlow={handleStartFlowWithGoal} />
          </div>
        ) : (
          <FlowModeView onExit={() => setCurrentView('goals')} />
        )}
      </main>

      {/* Rodapé institucional sutil */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-500">
        <p className="flex items-center justify-center gap-2">
          <span>Focalize</span>
          <span aria-hidden="true">·</span>
          <span>Gestão de Objetivos & Foco sem distrações</span>
          <span aria-hidden="true">·</span>
          <span>Dados salvos localmente</span>
        </p>
      </footer>

      {/* Modal global de criação rápida de objetivo */}
      <GoalForm
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
        existingCategories={categories}
      />

      {/* Modais globais disparados pelo menu superior */}
      <FlowSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <SessionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <GoalsProvider>
        <FlowProvider>
          <FocalizeApp />
        </FlowProvider>
      </GoalsProvider>
    </ThemeProvider>
  );
}
