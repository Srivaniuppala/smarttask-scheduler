import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountStorageKey } from '../services/accountStorage';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Clock, 
  Database, 
  Check, 
  ShieldCheck,
  Server
} from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'student@example.edu');
  const [timezone, setTimezone] = useState('America/New_York');
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('17:00');
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:5000/api');
  const [apiStatus, setApiStatus] = useState('idle'); // idle | checking | connected | offline
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(() => localStorage.getItem(accountStorageKey('smarttask_deadline_reminders')) === 'true');

  const toggleDeadlineReminders = async () => {
    const enabled = !deadlineReminders;
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { /* In-app reminders remain available. */ }
    }
    localStorage.setItem(accountStorageKey('smarttask_deadline_reminders'), String(enabled));
    setDeadlineReminders(enabled);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const testApiConnection = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch(`${apiEndpoint}/health`, { method: 'GET' });
      if (res.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('offline');
      }
    } catch (e) {
      setApiStatus('offline');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Settings</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your account profile, working hour constraints, and backend service connections
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <User className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">User Profile</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                Settings updated successfully
              </span>
            ) : <div />}

            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Working Hours & Timezone */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Clock className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Working Hours & Circadian Scheduling</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Kolkata">India (IST)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Daily Start Time
            </label>
            <input
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Daily End Time
            </label>
            <input
              type="time"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-4 h-4 mt-0.5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Deadline reminders</h3>
              <p className="text-xs text-gray-500 mt-1">Show an in-app and browser reminder 30 minutes before a task is due while the planner is open.</p>
            </div>
          </div>
          <button type="button" role="switch" aria-checked={deadlineReminders} onClick={toggleDeadlineReminders} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${deadlineReminders ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${deadlineReminders ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
          </button>
        </div>
        {deadlineReminders && 'Notification' in window && Notification.permission === 'denied' && (
          <p className="text-xs text-amber-700 mt-3">Browser notifications are blocked in your browser settings. In-app reminders will still appear while the planner is open.</p>
        )}
      </div>

      {/* Flask API and SQLite configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Flask API & SQLite Database</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
            REST API
          </span>
        </div>

        <p className="text-xs text-gray-500">
          SmartTask AI stores demo and local tasks in your browser by default, and can connect to the optional Python Flask REST API for account-backed data.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Backend REST API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="http://localhost:5000/api"
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={testApiConnection}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
              >
                {apiStatus === 'checking' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {apiStatus === 'connected' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Connected to Flask REST API successfully!</span>
            </div>
          )}

          {apiStatus === 'offline' && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600">
              <span className="font-semibold text-gray-800">Backend server is offline: </span>
              SmartTask AI is using browser storage. Start the Flask server with <code className="bg-white px-1.5 py-0.5 border rounded">python app.py</code> from the <code className="bg-white px-1.5 py-0.5 border rounded">backend/</code> directory to enable the optional API.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
