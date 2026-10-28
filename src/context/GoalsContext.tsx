/**
 * @file src/context/GoalsContext.tsx
 * Gerenciador de estado global dos Objetivos de Estudo do Focalize via useReducer.
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { Goal, GoalFormData, GoalStatus } from '../types';
import {
  STORAGE_KEYS,
  INITIAL_SEED_GOALS,
  isGoalList,
  loadFromStorage,
  saveToStorage,
} from '../utils/storage';

type GoalsAction =
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; data: Partial<GoalFormData> } }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'TOGGLE_STATUS'; payload: { id: string } }
  | { type: 'INCREMENT_STUDIED'; payload: { goalId: string; seconds: number } }
  | { type: 'RESET_SEED' };

interface GoalsState {
  goals: Goal[];
}

function goalsReducer(state: GoalsState, action: GoalsAction): GoalsState {
  switch (action.type) {
    case 'SET_GOALS': {
      return { goals: action.payload };
    }

    case 'ADD_GOAL': {
      return { goals: [action.payload, ...state.goals] };
    }

    case 'UPDATE_GOAL': {
      const now = new Date().toISOString();
      const updated = state.goals.map((goal) => {
        if (goal.id !== action.payload.id) return goal;
        return {
          ...goal,
          ...action.payload.data,
          updatedAt: now,
        };
      });
      return { goals: updated };
    }

    case 'DELETE_GOAL': {
      return {
        goals: state.goals.filter((g) => g.id !== action.payload.id),
      };
    }

    case 'TOGGLE_STATUS': {
      const now = new Date().toISOString();
      const updated = state.goals.map((goal) => {
        if (goal.id !== action.payload.id) return goal;
        const newStatus: GoalStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
        return {
          ...goal,
          status: newStatus,
          updatedAt: now,
        };
      });
      return { goals: updated };
    }

    case 'INCREMENT_STUDIED': {
      const now = new Date().toISOString();
      const updated = state.goals.map((goal) => {
        if (goal.id !== action.payload.goalId) return goal;
        return {
          ...goal,
          totalStudiedSeconds: goal.totalStudiedSeconds + action.payload.seconds,
          status: goal.status === 'pending' ? 'in_progress' : goal.status,
          updatedAt: now,
        };
      });
      return { goals: updated };
    }

    case 'RESET_SEED': {
      return { goals: INITIAL_SEED_GOALS };
    }

    default:
      return state;
  }
}

interface GoalsContextValue {
  goals: Goal[];
  categories: string[];
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  totalSecondsStudied: number;
  addGoal: (data: GoalFormData) => Goal;
  updateGoal: (id: string, data: Partial<GoalFormData>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalStatus: (id: string) => void;
  recordStudyTime: (goalId: string, seconds: number) => void;
  resetToInitialSeed: () => void;
  getGoalById: (id: string) => Goal | undefined;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(goalsReducer, undefined, () => {
    const stored = loadFromStorage<Goal[]>(
      STORAGE_KEYS.GOALS,
      INITIAL_SEED_GOALS,
      isGoalList
    );
    return { goals: stored };
  });

  // Salva no storage a cada modificação da lista
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOALS, state.goals);
  }, [state.goals]);

  const addGoal = useCallback((formData: GoalFormData): Goal => {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim() || 'Geral',
      priority: formData.priority,
      deadline: formData.deadline,
      status: formData.status,
      createdAt: now,
      updatedAt: now,
      totalStudiedSeconds: 0,
    };

    dispatch({ type: 'ADD_GOAL', payload: newGoal });
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, data: Partial<GoalFormData>) => {
    dispatch({ type: 'UPDATE_GOAL', payload: { id, data } });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: { id } });
  }, []);

  const toggleGoalStatus = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: { id } });
  }, []);

  const recordStudyTime = useCallback((goalId: string, seconds: number) => {
    if (seconds <= 0) return;
    dispatch({ type: 'INCREMENT_STUDIED', payload: { goalId, seconds } });
  }, []);

  const resetToInitialSeed = useCallback(() => {
    dispatch({ type: 'RESET_SEED' });
  }, []);

  const getGoalById = useCallback(
    (id: string): Goal | undefined => {
      return state.goals.find((g) => g.id === id);
    },
    [state.goals]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    state.goals.forEach((g) => {
      if (g.category && g.category.trim()) {
        set.add(g.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [state.goals]);

  const totalGoals = state.goals.length;
  const completedGoals = useMemo(
    () => state.goals.filter((g) => g.status === 'completed').length,
    [state.goals]
  );
  const inProgressGoals = useMemo(
    () => state.goals.filter((g) => g.status === 'in_progress').length,
    [state.goals]
  );
  const totalSecondsStudied = useMemo(
    () => state.goals.reduce((acc, curr) => acc + curr.totalStudiedSeconds, 0),
    [state.goals]
  );

  const value: GoalsContextValue = {
    goals: state.goals,
    categories,
    totalGoals,
    completedGoals,
    inProgressGoals,
    totalSecondsStudied,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    recordStudyTime,
    resetToInitialSeed,
    getGoalById,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};

export function useGoals(): GoalsContextValue {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals deve ser utilizado dentro de um GoalsProvider');
  }
  return context;
}
