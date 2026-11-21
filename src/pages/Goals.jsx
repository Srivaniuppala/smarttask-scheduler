import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Modal } from '../components/common/Modal';
import { 
  Target, 
  Plus, 
  Calendar, 
  Check,
  Pencil,
  Trash2
} from 'lucide-react';

export const Goals = () => {
  const { goals, toggleMilestone, addGoal, updateGoal, deleteGoal } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);

  // Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('Productivity');
  const [targetDate, setTargetDate] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  const resetForm = () => {
    setGoalTitle('');
    setGoalDescription('');
    setGoalCategory('Productivity');
    setTargetDate('');
    setMilestonesInput('');
    setEditingGoalId(null);
  };

  const openCreateGoal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditGoal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title || '');
    setGoalDescription(goal.description || '');
    setGoalCategory(goal.category || 'Productivity');
    setTargetDate(goal.targetDate || '');
    setMilestonesInput((goal.milestones || []).map(milestone => milestone.text).join('\n'));
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goal) => {
    if (!window.confirm(`Delete “${goal.title}” and its milestones?`)) return;
    await deleteGoal(goal.id);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const existingGoal = goals.find(goal => goal.id === editingGoalId);
    const existingMilestones = existingGoal?.milestones || [];
    const parsedMilestones = milestonesInput
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0)
      .map((text, idx) => {
        const previous = existingMilestones.find(milestone => milestone.text === text);
        return { id: previous?.id || `M-${Date.now()}-${idx}`, text, completed: Boolean(previous?.completed) };
      });

    const goalData = {
      title: goalTitle,
      description: goalDescription,
      category: goalCategory,
      targetDate,
      milestones: parsedMilestones.length > 0 ? parsedMilestones : (editingGoalId ? [] : [
        { id: `M-${Date.now()}-1`, text: 'Initial scoping and milestone planning', completed: false }
      ])
    };
    if (editingGoalId) await updateGoal(editingGoalId, goalData);
    else await addGoal(goalData);

    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Goals & Milestones</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track strategic long-term initiatives broken down into actionable milestones
          </p>
        </div>

        <button
          onClick={openCreateGoal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Long-Term Goal</span>
        </button>
      </div>

      {/* Goals List Grid */}
      <div className="grid grid-cols-1 gap-6">
        {goals.map((goal) => {
          const totalMilestones = goal.milestones?.length || 0;
          const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
          const percentage = totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);

          return (
            <div 
              key={goal.id}
              className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-5"
            >
              {/* Goal Title & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {goal.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Target: {goal.targetDate}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Completion Badge */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 font-mono">{percentage}%</div>
                    <span className="text-xs text-gray-400">{completedMilestones} of {totalMilestones} done</span>
                  </div>
                  <button type="button" onClick={() => openEditGoal(goal)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" aria-label={`Edit ${goal.title}`} title="Edit goal">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleDeleteGoal(goal)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" aria-label={`Delete ${goal.title}`} title="Delete goal">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Milestones Subtasks Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Milestones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {goal.milestones?.map((milestone) => (
                    <div
                      key={milestone.id}
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                      className={`p-3 rounded-md border flex items-center gap-2.5 cursor-pointer transition-colors ${
                        milestone.completed 
                          ? 'bg-gray-50/70 border-gray-200 text-gray-400' 
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${
                          milestone.completed
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {milestone.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className={`text-xs font-medium ${
                        milestone.completed ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>
                        {milestone.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingGoalId ? 'Edit Goal' : 'Add New Long-Term Goal'}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Master Machine Learning Foundations"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Why this goal matters and what success looks like..."
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Productivity">Productivity</option>
                <option value="Professional">Professional</option>
                <option value="Education">Education</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Key Milestones (one per line)
            </label>
            <textarea
              rows={4}
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              placeholder="Complete textbook chapters 1-5&#10;Build practice project&#10;Write final report"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              {editingGoalId ? 'Save Changes' : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
