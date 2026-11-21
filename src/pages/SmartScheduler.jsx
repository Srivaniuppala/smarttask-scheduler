import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  CalendarClock, 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  Flame,
  Coffee,
  Check
} from 'lucide-react';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { estimateCompletionChance, getTaskPriorityScore } from '../services/productivityModel';

export const SmartScheduler = () => {
  const { schedule, scheduleDate, scheduleExplanation, triggerScheduleGeneration, tasks } = useTasks();


  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [workingHours, setWorkingHours] = useState('8');
  const [startHour, setStartHour] = useState('09:00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const datedSchedule = scheduleDate === selectedDate ? schedule : [];
  const isCompletedBlock = (block) => {
    if (!block || block.type === 'Break') return false;
    const task = tasks.find(item => (block.taskId && item.id === block.taskId) || item.title === block.title);
    return Boolean(task && (String(task.status).toLowerCase() === 'completed' || task.completedAt));
  };
  const visibleSchedule = datedSchedule.filter((block, index) => {
    if (isCompletedBlock(block)) return false;
    if (block.type !== 'Break') return true;
    return !isCompletedBlock(datedSchedule[index - 1]) && !isCompletedBlock(datedSchedule[index + 1]);
  });
  const pendingTasks = tasks.filter(task => String(task.status || '').toLowerCase() !== 'completed' && !task.completedAt);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 600));
    await triggerScheduleGeneration(selectedDate, { workingHours, startHour });
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <CalendarClock className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Smart Daily Scheduler</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Build a day plan from pending tasks, deadlines, priorities, and available work hours. Review the suggested blocks and adjust them to fit your day.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-subtle"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Building Schedule...' : 'Build Daily Schedule'}</span>
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Selected Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Workday Start Time
            </label>
            <input
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Available Working Hours
            </label>
            <select
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            >
              <option value="4">4 Hours (Half Day)</option>
              <option value="6">6 Hours (Light Focus)</option>
              <option value="8">8 Hours (Standard Full Day)</option>
              <option value="10">10 Hours (Sprint Mode)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Vertical Timeline and Plan Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vertical Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Schedule Timeline for {new Date(`${selectedDate}T12:00:00`).toLocaleDateString()}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              {visibleSchedule.length} Blocks Planned
            </span>
          </div>

          {/* Timeline container */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-6">
            <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 space-y-8">
              {visibleSchedule.map((item, index) => {
                const isBreak = item.type === 'Break';
                return (
                  <div key={item.id || index} className="relative group">
                    {/* Timeline Node Icon / Dot */}
                    <div className={`absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center ${
                      isBreak 
                        ? 'border-gray-400 text-gray-500' 
                        : item.priority === 'High' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-gray-400 text-gray-600'
                    }`}>
                      {isBreak ? (
                        <Coffee className="w-3 h-3" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    {/* Timeline Card Content */}
                    <div className={`p-4 rounded-lg border transition-colors ${
                      isBreak 
                        ? 'bg-gray-50/70 border-gray-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {item.time}
                          </span>
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                            {item.type}
                          </span>
                        </div>
                        {item.priority && (
                          <PriorityBadge priority={item.priority} />
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </h4>

                      {!isBreak && item.completionChance !== undefined && (
                        <p className="text-[11px] text-blue-700 mt-1">{item.completionModelTrained ? 'Learned completion estimate' : 'Baseline completion estimate'}: {item.completionChance}%</p>
                      )}

                      {item.reason && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium text-gray-700">Rationale: </span>
                          {item.reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Plan explanation and task pool */}
        <div className="space-y-6">
          {/* Plan explanation card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">How this plan was ordered</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {scheduleDate === selectedDate ? scheduleExplanation : 'Choose a date, then generate a schedule to see a plan built for that day.'}
            </p>

            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Flame className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Higher priority scores combine task priority, deadline pressure, waiting time, and effort.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Coffee className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Completion estimates improve as you record more finished and overdue tasks.</span>
              </div>
            </div>
          </div>

          {/* Existing Tasks in Queue */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Task Pool for Scheduling</h3>
              <span className="text-xs text-gray-500">{pendingTasks.length} pending</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...pendingTasks].sort((a, b) => getTaskPriorityScore(b) - getTaskPriorityScore(a)).slice(0, 8).map((task) => {
                const chance = estimateCompletionChance(task);
                return (
                <div 
                  key={task.id}
                  className="p-2.5 rounded border border-gray-100 bg-gray-50/50 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-800 truncate">{task.title}</span>
                    <span className="text-gray-400 font-mono flex-shrink-0">{task.estimatedHours}h</span>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                    <span>Priority score {getTaskPriorityScore(task)}/100</span>
                    <span>{chance.modelTrained ? 'Learned estimate' : 'Baseline estimate'} {chance.probability}%</span>
                  </div>
                </div>
                );
              })}
              {pendingTasks.length === 0 && <p className="text-xs text-gray-500 py-2">No pending tasks. Add a task to build a plan.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
