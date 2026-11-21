import React from 'react';
import { ArrowRight, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { parseTaskDate } from '../../utils/dates';
import { estimateCompletionChance, getTaskPriorityScore } from '../../services/productivityModel';

export const AIRecommendationCard = () => {
  const { tasks, pendingTasks } = useTasks();
  const nextTask = [...tasks]
    .filter(task => task.status !== 'Completed')
    .sort((a, b) => {
      const deadlineA = parseTaskDate(a.deadline)?.getTime() ?? Infinity;
      const deadlineB = parseTaskDate(b.deadline)?.getTime() ?? Infinity;
      return deadlineA - deadlineB || ({ High: 0, Medium: 1, Low: 2 }[a.priority] ?? 1) - ({ High: 0, Medium: 1, Low: 2 }[b.priority] ?? 1);
    })[0];
  const nextTaskForecast = nextTask ? estimateCompletionChance(nextTask) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <CalendarClock className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Planning Snapshot</h3>
          <p className="text-xs text-gray-500">Based on the tasks in your list</p>
        </div>
      </div>

      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-md">
        {nextTask ? (
          <>
            <p className="text-sm font-medium text-gray-900">
              {pendingTasks} task{pendingTasks === 1 ? '' : 's'} need attention.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {nextTask.deadline
                ? `The earliest deadline is “${nextTask.title}” (${parseTaskDate(nextTask.deadline)?.toLocaleString() || nextTask.deadline}).`
                : `“${nextTask.title}” is the next task without a deadline.`}
            </p>
            {nextTaskForecast && <p className="text-xs text-gray-600 mt-1">Priority score {getTaskPriorityScore(nextTask)}/100 · {nextTaskForecast.modelTrained ? 'Learned' : 'Baseline'} completion estimate {nextTaskForecast.probability}%</p>}
          </>
        ) : (
          <p className="text-sm font-medium text-gray-900">Your task list is clear. Add coursework or research when you’re ready.</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <Link to="/smart-scheduler" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
            Plan my day
          </Link>
          <Link to="/tasks" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Review tasks
          </Link>
        </div>
      </div>
    </div>
  );
};
