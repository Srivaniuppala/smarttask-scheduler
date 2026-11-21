import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Target,
  Maximize2
} from 'lucide-react';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const FocusMode = () => {
  const { tasks, toggleTaskStatus } = useTasks();

  // Mode: 25 mins (Pomodoro), 5 mins (Short Break), 15 mins (Long Break)
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [durations, setDurations] = useState({ pomodoro: 25, shortBreak: 5, longBreak: 15 });

  // Selected task for focus block
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const [selectedTaskId, setSelectedTaskId] = useState(pendingTasks[0]?.id || '');

  const currentTask = tasks.find(t => t.id === selectedTaskId);

  // Timer Tick Effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Ding notification
      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
          // AudioContext not supported
        }
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SmartTask AI timer finished', { body: mode === 'pomodoro' ? 'Focus session complete. Take a break.' : 'Break complete. Ready to focus?' });
      }
      if (mode === 'pomodoro') {
        setCompletedSessions((prev) => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, soundEnabled]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode] * 60);
  };

  const handleCompleteCurrentTask = async () => {
    if (selectedTaskId) {
      await toggleTaskStatus(selectedTaskId);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 sm:py-6 text-center">
      {/* Page Title & Mute toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="text-left">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Focus Mode</h2>
          <p className="text-xs text-gray-500">Distraction-free environment for deep work blocks</p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
          title={soundEnabled ? "Mute chimes" : "Enable chimes"}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="inline-flex p-1 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            mode === 'pomodoro'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Focus ({durations.pomodoro}m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            mode === 'shortBreak'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Short Break ({durations.shortBreak}m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            mode === 'longBreak'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Long Break ({durations.longBreak}m)
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
        <label htmlFor="timer-duration">{mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short break' : 'Long break'} duration</label>
        <input id="timer-duration" type="number" min="1" max="180" value={durations[mode]} disabled={isRunning} onChange={(e) => { const minutes = Math.max(1, Math.min(180, Number(e.target.value) || 1)); setDurations(prev => ({ ...prev, [mode]: minutes })); setTimeLeft(minutes * 60); }} className="w-20 px-2 py-1 border border-gray-200 rounded" />
        <span>minutes</span>
      </div>
      {/* Large Pomodoro Timer Display */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-14 shadow-subtle space-y-6">
        <div className="font-mono text-7xl sm:text-9xl font-bold text-gray-900 tracking-tighter select-none">
          {formatTime(timeLeft)}
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={async () => { if (!isRunning && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); setIsRunning(!isRunning); }}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-subtle"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-3 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-gray-400 font-medium">
          Sessions completed today: <span className="text-gray-800 font-semibold">{completedSessions}</span>
        </div>
      </div>

      {/* Current Task Selector Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 text-left space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Active Task in Focus
          </span>
          {currentTask && (
            <PriorityBadge priority={currentTask.priority} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
          >
            <option value="">-- Choose a task to focus on --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} {task.status === 'Completed' ? '✓ (Completed)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleCompleteCurrentTask}
            disabled={!currentTask || currentTask.status === 'Completed'}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Task</span>
          </button>
        </div>

        {currentTask?.description && (
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-100">
            {currentTask.description}
          </p>
        )}
      </div>
    </div>
  );
};
