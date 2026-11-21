import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskTable } from '../components/common/TaskTable';
import { getTaskDisplayStatus } from '../components/common/StatusBadge';
import { parseTaskDate, toDateTimeLocalInput } from '../utils/dates';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Sparkles,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const [searchParams] = useSearchParams();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('deadline-asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    category: 'Development',
    deadline: '',
    estimatedHours: '2.0',
    priority: 'Medium',
    status: 'Pending'
  };
  const [formData, setFormData] = useState(initialFormState);

  // Include built-in categories and categories already used by tasks.
  const categories = ['ALL', ...new Set([
    'Development', 'Research', 'Design', 'Operations', 'Personal',
    ...tasks.map((task) => task.category).filter(Boolean)
  ])];

  // Handle Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      category: task.category || 'Development',
      deadline: toDateTimeLocalInput(task.deadline),
      estimatedHours: task.estimatedHours?.toString() || '1.0',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending'
    });
    setIsModalOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        ...formData,
        estimatedHours: parseFloat(formData.estimatedHours) || 1.0
      });
    } else {
      await addTask({
        ...formData,
        estimatedHours: parseFloat(formData.estimatedHours) || 1.0
      });
    }

    setIsModalOpen(false);
    setEditingTask(null);
    setFormData(initialFormState);
  };

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const displayStatus = getTaskDisplayStatus(task);
      // Search
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()));

      // Priority
      const matchesPriority = 
        selectedPriority === 'ALL' || task.priority?.toUpperCase() === selectedPriority;

      // Status
      const matchesStatus = 
        selectedStatus === 'ALL' || 
        (selectedStatus === 'COMPLETED' && displayStatus === 'Completed') ||
        (selectedStatus === 'PENDING' && (displayStatus === 'Pending' || displayStatus === 'In Progress')) ||
        (selectedStatus === 'OVERDUE' && displayStatus === 'Overdue');

      // Category
      const matchesCategory = 
        selectedCategory === 'ALL' || task.category?.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'deadline-asc') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return (parseTaskDate(a.deadline)?.getTime() || Infinity) - (parseTaskDate(b.deadline)?.getTime() || Infinity);
      }
      if (sortBy === 'deadline-desc') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return (parseTaskDate(b.deadline)?.getTime() || -Infinity) - (parseTaskDate(a.deadline)?.getTime() || -Infinity);
      }
      if (sortBy === 'priority') {
        const score = { High: 3, Medium: 2, Low: 1 };
        return (score[b.priority] || 0) - (score[a.priority] || 0);
      }
      if (sortBy === 'hours') {
        return (b.estimatedHours || 0) - (a.estimatedHours || 0);
      }
      return a.title.localeCompare(b.title);
    });
  }, [tasks, searchQuery, selectedPriority, selectedStatus, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Task Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredTasks.length} of {tasks.length} tasks matching criteria
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/ai-task-creation"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Task Entry</span>
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter tasks by keyword, tag or description..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending / In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-600"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-600"
            >
              <option value="deadline-asc">Deadline (Soonest)</option>
              <option value="deadline-desc">Deadline (Latest)</option>
              <option value="priority">Priority (Highest)</option>
              <option value="hours">Estimated Hours</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <TaskTable
        tasks={filteredTasks}
        onToggleStatus={toggleTaskStatus}
        onEdit={handleOpenEditModal}
        onDelete={deleteTask}
      />

      {/* Clean Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Task" : "Create New Task"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement user login API endpoint"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add key objectives, criteria, or notes..."
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                list="task-category-options"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter or choose a category"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
              <datalist id="task-category-options">
                {categories.filter((category) => category !== 'ALL').map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="40"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              {editingTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
