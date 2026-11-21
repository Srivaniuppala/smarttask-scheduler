import api from './api';
import { clearAccountBrowserData } from './accountStorage';

const USER_STORAGE_KEY = 'focusai_user';
const TOKEN_STORAGE_KEY = 'focusai_token';

export const authService = {
  getCurrentUser() {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return null;
    try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)); } catch { return null; }
  },
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    return data;
  },
  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    // A newly issued account starts with a clean browser cache. Its database
    // rows will be loaded after the account becomes active.
    clearAccountBrowserData(data.user.id);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    return data;
  },
  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};
