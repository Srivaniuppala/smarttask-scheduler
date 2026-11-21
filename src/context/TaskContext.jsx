import React, { createContext, useContext, useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';
import { aiService } from '../services/aiService';
import { INITIAL_SCHEDULE } from '../data/mockData';
import { useNotifications } from './NotificationContext';
import { parseTaskDate } from '../utils/dates';
import { recordTaskOutcomes } from '../services/productivityModel';
import { accountStorageKey, hasSignedInAccount } from '../services/accountStorage';
import { scheduleService } from '../services/scheduleService';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem(accountStorageKey('focusai_schedule'));
    return saved ? JSON.parse(saved) : (hasSignedInAccount() ? [] : INITIAL_SCHEDULE);
  });
  const [scheduleDate, setScheduleDate] = useState(() => localStorage.getItem(accountStorageKey('focusai_schedule_date')) || '');
  const [scheduleExplanation, setScheduleExplanation] = useState(
    'Build a daily plan to see pending tasks ordered by deadline, priority, and estimated effort.'
  );
  const [, setModelRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Load initial tasks and goals
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedTasks = await taskService.getTasks();
        const loadedGoals = await goalService.getGoals();
        const latestSchedule = await scheduleService.getLatest();
        setTasks(loadedTasks);
        setGoals(loadedGoals);
        if (latestSchedule) {
          setSchedule(latestSchedule.schedule || []);
          setScheduleDate(latestSchedule.date || '');
          setScheduleExplanation(latestSchedule.explanation || '');
        }
      } catch (err) {
        console.error('Error loading task data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && tasks.length) {
      recordTaskOutcomes(tasks);
      setModelRevision(revision => revision + 1);
    }
  }, [tasks, loading]);

  useEffect(() => {
    if (loading || localStorage.getItem(accountStorageKey('smarttask_deadline_reminders')) !== 'true') return undefined;
    const checkDeadlines = () => {
      const now = Date.now();
      tasks.forEach(task => {
        if (String(task.status || '').toLowerCase() === 'completed' || task.completedAt || !task.deadline) return;
        const deadline = parseTaskDate(task.deadline);
        if (!deadline || deadline.getTime() <= now || deadline.getTime() - now > 30 * 60 * 1000) return;
        const reminderKey = accountStorageKey(`smarttask_reminded_${task.id}_${task.deadline}`);
        if (localStorage.getItem(reminderKey)) return;
        const message = `“${task.title}” is due at ${deadline.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`;
        addNotification('Deadline in 30 minutes', message, 'deadline');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Task deadline approaching', { body: message });
        }
        localStorage.setItem(reminderKey, 'sent');
      });
    };
    checkDeadlines();
    const intervalId = window.setInterval(checkDeadlines, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [tasks, loading, addNotification]);

  // Statistics computations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Completed') return false;
    if (!t.deadline) return false;
    const deadline = parseTaskDate(t.deadline);
    return deadline && deadline < new Date();
  }).length;

  const productivityScore = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Actions
  const addTask = async (taskData) => {
    const newTask = await taskService.createTask(taskData);
    setTasks(prev => [newTask, ...prev]);
    addNotification('Task Created', `"${newTask.title}" was added to your task list.`, 'success');
    return newTask;
  };

  const updateTask = async (id, updates) => {
    const updated = await taskService.updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    return updated;
  };

  const deleteTask = async (id) => {
    const target = tasks.find(t => t.id === id);
    await taskService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (target) {
      addNotification('Task Deleted', `"${target.title}" was removed.`, 'info');
    }
  };

  // Remove completed tasks at their 24-hour mark while the app remains open.
  useEffect(() => {
    const completed = tasks.filter(task => task.status === 'Completed' && task.completedAt);
    if (!completed.length) return undefined;
    const nextExpiry = Math.min(...completed.map(task => new Date(task.completedAt).getTime() + 24 * 60 * 60 * 1000));
    const timer = setTimeout(() => {
      completed
        .filter(task => Date.now() >= new Date(task.completedAt).getTime() + 24 * 60 * 60 * 1000)
        .forEach(task => deleteTask(task.id));
    }, Math.max(0, nextExpiry - Date.now()));
    return () => clearTimeout(timer);
  }, [tasks]);

  const toggleTaskStatus = async (id) => {
    const target = tasks.find(task => task.id === id);
    if (!target) return;
    const status = target.status === 'Completed' ? 'Pending' : 'Completed';
    const updated = await taskService.updateTask(id, {
      status,
      completedAt: status === 'Completed' ? new Date().toISOString() : null
    });
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    if (updated?.status === 'Completed') {
      addNotification('Task Completed! 🎉', `"${updated.title}" marked as complete.`, 'success');
    }
  };

  const toggleMilestone = async (goalId, milestoneId) => {
    const updatedGoal = await goalService.toggleMilestone(goalId, milestoneId);
    setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
  };

  const addGoal = async (goalData) => {
    const newGoal = await goalService.createGoal(goalData);
    setGoals(prev => [newGoal, ...prev]);
    addNotification('New Goal Added', `"${newGoal.title}" has been tracked.`, 'success');
    return newGoal;
  };

  const updateGoal = async (id, updates) => {
    const updated = await goalService.updateGoal(id, updates);
    if (updated) setGoals(prev => prev.map(goal => goal.id === id ? updated : goal));
    return updated;
  };

  const deleteGoal = async (id) => {
    const target = goals.find(goal => goal.id === id);
    await goalService.deleteGoal(id);
    setGoals(prev => prev.filter(goal => goal.id !== id));
    if (target) addNotification('Goal deleted', `“${target.title}” was removed.`, 'info');
  };

  const triggerScheduleGeneration = async (date, hours) => {
    const result = await aiService.generateSchedule(date, hours, tasks);
    const saved = await scheduleService.save({ date, schedule: result.schedule, explanation: result.explanation });
    setSchedule(saved.schedule);
    setScheduleDate(saved.date);
    setScheduleExplanation(saved.explanation);
    addNotification('Daily plan ready', 'Your task timeline has been generated.', 'success');
    return result;
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      productivityScore,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      schedule,
      scheduleDate,
      scheduleExplanation,
      triggerScheduleGeneration,
      goals,
      toggleMilestone,
      addGoal,
      updateGoal,
      deleteGoal
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
