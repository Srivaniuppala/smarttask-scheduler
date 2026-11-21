import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus 
} from 'lucide-react';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { parseTaskDate } from '../utils/dates';

export const Calendar = () => {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get tasks for the selected date
  const selectedDateTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const d = parseTaskDate(task.deadline);
    if (!d) return false;
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Calendar</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View upcoming deliverables and daily scheduled milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-md">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-l-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-semibold text-gray-900">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-r-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Calendar Month Grid (2 cols) & Day Inspector (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
          <div className="grid grid-cols-7 gap-px text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-xs font-semibold text-gray-500 py-2">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty offset padding days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 p-1.5 bg-gray-50/40 rounded border border-transparent" />
            ))}

            {/* Real Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              
              // Tasks for this calendar square
              const dayTasks = tasks.filter(t => {
                if (!t.deadline) return false;
                const d = parseTaskDate(t.deadline);
                if (!d) return false;
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
              });

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 sm:h-24 p-1.5 rounded border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${
                      isSelected ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] font-medium text-gray-700 bg-gray-100/90 truncate px-1 py-0.5 rounded"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-gray-400 block">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Inspector */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Agenda for {monthNames[month]} {selectedDay}
              </h3>
              <p className="text-xs text-gray-400">{selectedDateTasks.length} deadlines scheduled</p>
            </div>
            <CalendarIcon className="w-4 h-4 text-gray-400" />
          </div>

          <div className="mt-4 space-y-3">
            {selectedDateTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No tasks or deadlines scheduled for this day.
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-md border border-gray-100 bg-gray-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{task.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Est. {task.estimatedHours}h</span>
                    <span>•</span>
                    <span>{task.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
