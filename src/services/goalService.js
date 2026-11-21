import api from './api';
import { INITIAL_GOALS } from '../data/mockData';
import { accountStorageKey, hasSignedInAccount } from './accountStorage';

const GOALS_STORAGE_KEY = 'focusai_goals';

const getLocalGoals = () => {
  const stored = localStorage.getItem(accountStorageKey(GOALS_STORAGE_KEY));
  if (!stored) return hasSignedInAccount() ? [] : INITIAL_GOALS;
  try {
    return JSON.parse(stored);
  } catch {
    return hasSignedInAccount() ? [] : INITIAL_GOALS;
  }
};

const saveLocalGoals = (goals) => {
  localStorage.setItem(accountStorageKey(GOALS_STORAGE_KEY), JSON.stringify(goals));
};

export const goalService = {
  async getGoals() {
    try {
      const response = await api.get('/goals');
      saveLocalGoals(response.data || []);
      return response.data;
    } catch (e) {
      return getLocalGoals();
    }
  },

  async createGoal(goalData) {
    const newGoal = {
      id: `GOAL-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      milestones: goalData.milestones || [],
      ...goalData
    };
    try {
      const response = await api.post('/goals', newGoal);
      const goals = getLocalGoals();
      saveLocalGoals([response.data, ...goals.filter(goal => goal.id !== response.data.id)]);
      return response.data;
    } catch (e) {
      const goals = getLocalGoals();
      const updated = [newGoal, ...goals];
      saveLocalGoals(updated);
      return newGoal;
    }
  },

  async updateGoal(id, updates) {
    try {
      const response = await api.put(`/goals/${id}`, updates);
      const goals = getLocalGoals().map(goal => goal.id === id ? response.data : goal);
      saveLocalGoals(goals);
      return response.data;
    } catch {
      const goals = getLocalGoals().map(goal => goal.id === id ? { ...goal, ...updates } : goal);
      saveLocalGoals(goals);
      return goals.find(goal => goal.id === id) || null;
    }
  },

  async deleteGoal(id) {
    try {
      await api.delete(`/goals/${id}`);
    } catch {
      // Keep browser-only accounts usable when the API is offline.
    }
    saveLocalGoals(getLocalGoals().filter(goal => goal.id !== id));
    return true;
  },

  async toggleMilestone(goalId, milestoneId) {
    const goals = getLocalGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return null;

    goal.milestones = goal.milestones.map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    try {
      const response = await api.put(`/goals/${goalId}/milestones/${milestoneId}`, { completed: goal.milestones.find(m => m.id === milestoneId).completed });
      const updatedGoal = response.data || goal;
      saveLocalGoals(goals.map(item => item.id === goalId ? updatedGoal : item));
      return updatedGoal;
    } catch (e) {
      // offline fallback
    }

    saveLocalGoals(goals);
    return goal;
  }
};
