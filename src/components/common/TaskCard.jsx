import React from 'react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge, getTaskDisplayStatus } from './StatusBadge';
import { Clock, Calendar, Check, Trash2, Edit2 } from 'lucide-react';
import { parseTaskDate } from '../../utils/dates';

export const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const taskStatus = getTaskDisplayStatus(task);
  const isCompleted = taskStatus === 'Completed';

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'No deadline';
    const date = parseTaskDate(dateStr);
    if (!date) return 'No deadline';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white border rounded-lg p-4 transition-colors ${
      isCompleted ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            onClick={() => onToggleStatus(task.id)}
            className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border transition-colors ${
              isCompleted
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-gray-300 hover:border-blue-600 text-transparent'
            }`}
            title={isCompleted ? "Mark incomplete" : "Mark completed"}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold truncate ${
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <PriorityBadge priority={task.priority} />
        <StatusBadge status={taskStatus} />
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {formatDeadline(task.deadline)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {task.estimatedHours}h
          </span>
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px]">
            {task.category}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="Edit task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
