import api from './api';
import { accountStorageKey } from './accountStorage';

const STORAGE_KEY = 'smarttask_schedule';

function readLocalSchedule() {
  try {
    return JSON.parse(localStorage.getItem(accountStorageKey(STORAGE_KEY)) || 'null');
  } catch {
    return null;
  }
}

function saveLocalSchedule(scheduleRecord) {
  localStorage.setItem(accountStorageKey(STORAGE_KEY), JSON.stringify(scheduleRecord));
}

export const scheduleService = {
  async getLatest() {
    try {
      const response = await api.get('/schedules/latest');
      if (response.data) {
        saveLocalSchedule(response.data);
        return response.data;
      }
      const cached = readLocalSchedule();
      if (cached) {
        const saved = await api.put(`/schedules/${cached.date}`, cached);
        saveLocalSchedule(saved.data);
        return saved.data;
      }
      return null;
    } catch {
      return readLocalSchedule();
    }
  },

  async save(scheduleRecord) {
    saveLocalSchedule(scheduleRecord);
    try {
      const response = await api.put(`/schedules/${scheduleRecord.date}`, scheduleRecord);
      saveLocalSchedule(response.data);
      return response.data;
    } catch {
      return scheduleRecord;
    }
  }
};
