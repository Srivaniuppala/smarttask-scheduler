import api from './api';
import { INITIAL_TASKS } from '../data/mockData';
import { accountStorageKey, hasSignedInAccount } from './accountStorage';

const STORAGE_KEY = 'focusai_tasks';
const PENDING_DELETES_KEY = 'smarttask_pending_task_deletes';

const readCachedTasks = () => {
  const stored = localStorage.getItem(accountStorageKey(STORAGE_KEY));
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
};

const getLocalTasks = () => {
  const cached = readCachedTasks();
  if (cached) return hasSignedInAccount() ? cached.filter(task => task._syncPending) : cached;
  return hasSignedInAccount() ? [] : INITIAL_TASKS;
};

const isExpiredCompletedTask = (task, now = Date.now()) => {
  if (String(task.status).toLowerCase() !== 'completed' || !task.completedAt) return false;
  const completedAt = new Date(task.completedAt).getTime();
  return Number.isFinite(completedAt) && now - completedAt >= 24 * 60 * 60 * 1000;
};

const saveLocalTasks = (tasks) => {
  localStorage.setItem(accountStorageKey(STORAGE_KEY), JSON.stringify(tasks));
};

const cleanTask = (task) => {
  const { _syncPending, ...savedTask } = task;
  return savedTask;
};

const readPendingDeletes = () => {
  try { return JSON.parse(localStorage.getItem(accountStorageKey(PENDING_DELETES_KEY)) || '[]'); }
  catch { return []; }
};

const savePendingDeletes = (ids) => {
  localStorage.setItem(accountStorageKey(PENDING_DELETES_KEY), JSON.stringify([...new Set(ids)]));
};

const cacheTask = (task) => {
  const tasks = getLocalTasks();
  saveLocalTasks([task, ...tasks.filter(item => item.id !== task.id)]);
};

export const taskService = {
  // Fetch all tasks
  async getTasks() {
    try {
      const response = await api.get('/tasks');
      let serverTasks = (response.data || []).filter(task => !isExpiredCompletedTask(task));
      const pendingDeletes = readPendingDeletes();
      const completedDeletes = [];
      for (const id of pendingDeletes) {
        try {
          await api.delete(`/tasks/${id}`);
          completedDeletes.push(id);
        } catch { /* Keep the delete queued until the API is available. */ }
      }
      if (completedDeletes.length) {
        const removed = new Set(completedDeletes);
        serverTasks = serverTasks.filter(task => !removed.has(task.id));
        savePendingDeletes(pendingDeletes.filter(id => !removed.has(id)));
      }
      const cachedTasks = (readCachedTasks() || []).filter(task => task._syncPending && !isExpiredCompletedTask(task));
      const serverIds = new Set(serverTasks.map(task => task.id));
      const recoveredTasks = [];
      for (const task of cachedTasks) {
        const payload = cleanTask(task);
        try {
          const saved = serverIds.has(task.id)
            ? await api.put(`/tasks/${task.id}`, payload)
            : await api.post('/tasks', payload);
          recoveredTasks.push(saved.data);
          serverIds.add(task.id);
        } catch {
          // Keep only explicitly queued offline changes for this account.
          recoveredTasks.push(task);
        }
      }
      const allTasks = [...serverTasks, ...recoveredTasks];
      saveLocalTasks(allTasks);
      return allTasks;
    } catch (error) {
      // Graceful offline fallback to localStorage
      const tasks = getLocalTasks().filter(task => !isExpiredCompletedTask(task));
      saveLocalTasks(tasks);
      return tasks;
    }
  },

  // Create new task
  async createTask(taskData) {
    const newTask = {
      id: `TASK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      status: taskData.status || 'Pending',
      ...taskData,
      estimatedHours: parseFloat(taskData.estimatedHours) || 1.0,
    };

    try {
      const response = await api.post('/tasks', newTask);
      cacheTask(response.data);
      return response.data;
    } catch (error) {
      const tasks = getLocalTasks();
      const updated = [{ ...newTask, _syncPending: true }, ...tasks];
      saveLocalTasks(updated);
      return updated[0];
    }
  },

  // Update existing task
  async updateTask(id, updates) {
    try {
      const response = await api.put(`/tasks/${id}`, updates);
      const cached = getLocalTasks().map(task => task.id === id ? response.data : task);
      saveLocalTasks(cached.some(task => task.id === id) ? cached : [response.data, ...cached]);
      return response.data;
    } catch (error) {
      const tasks = getLocalTasks();
      const updated = tasks.map(t => t.id === id ? { ...t, ...updates, _syncPending: true } : t);
      saveLocalTasks(updated);
      return updated.find(t => t.id === id);
    }
  },

  // Delete task
  async deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`);
      savePendingDeletes(readPendingDeletes().filter(taskId => taskId !== id));
      saveLocalTasks(getLocalTasks().filter(task => task.id !== id));
      return true;
    } catch (error) {
      savePendingDeletes([...readPendingDeletes(), id]);
      const tasks = getLocalTasks();
      const updated = tasks.filter(t => t.id !== id);
      saveLocalTasks(updated);
      return true;
    }
  },

  // Toggle task completed status
  async toggleTaskStatus(id) {
    const tasks = getLocalTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return null;

    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const completedAt = newStatus === 'Completed' ? new Date().toISOString() : null;

    return this.updateTask(id, { status: newStatus, completedAt });
  }
};
