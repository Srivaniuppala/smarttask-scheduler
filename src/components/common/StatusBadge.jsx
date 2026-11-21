import React from 'react';
import { parseTaskDate } from '../../utils/dates';

export const getTaskDisplayStatus = (task, now = new Date()) => {
  if (task.status === 'Completed') return 'Completed';
  const deadline = parseTaskDate(task.deadline);
  if (deadline && deadline.getTime() < now.getTime()) return 'Overdue';
  return task.status || 'Pending';
};

export const StatusBadge = ({ status }) => {
  const norm = (status || 'pending').toLowerCase();

  if (norm === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
        Completed
      </span>
    );
  }

  if (norm === 'in progress' || norm === 'inprogress') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
        In Progress
      </span>
    );
  }

  if (norm === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
        Overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
      Pending
    </span>
  );
};
