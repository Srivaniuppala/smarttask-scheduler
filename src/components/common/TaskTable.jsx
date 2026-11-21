import React from 'react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge, getTaskDisplayStatus } from './StatusBadge';
import { Check, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { parseTaskDate } from '../../utils/dates';

export const TaskTable = ({ tasks = [], onToggleStatus, onEdit, onDelete }) => {
  const formatDeadline = (dateStr) => {
    if (!dateStr) return '—';
    const date = parseTaskDate(dateStr);
    if (!date) return '—';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-sm font-medium text-gray-900">No tasks found</p>
        <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search term, or create a new task.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3 w-10">
                <span className="sr-only">Status</span>
              </th>
              <th scope="col" className="px-4 py-3">Task Name</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" className="px-4 py-3">Deadline</th>
              <th scope="col" className="px-4 py-3">Estimated Hours</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {tasks.map((task) => {
              const displayStatus = getTaskDisplayStatus(task);
              const isCompleted = displayStatus === 'Completed';
              return (
                <tr 
                  key={task.id} 
                  className={`hover:bg-gray-50/70 transition-colors ${isCompleted ? 'bg-gray-50/30' : ''}`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(task.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isCompleted
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 hover:border-blue-600 text-transparent'
                      }`}
                      title={isCompleted ? "Mark pending" : "Mark completed"}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 line-clamp-1">
                      <span className={isCompleted ? 'text-gray-400 line-through' : ''}>
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {task.category || 'General'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDeadline(task.deadline)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {task.estimatedHours} hrs
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={displayStatus} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
