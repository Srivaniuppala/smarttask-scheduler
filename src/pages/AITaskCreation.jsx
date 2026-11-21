import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { aiService } from '../services/aiService';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Zap,
  Clock,
  Calendar,
  Layers,
  AlertTriangle
} from 'lucide-react';

export const AITaskCreation = () => {
  const navigate = useNavigate();
  const { addTask } = useTasks();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sample quick prompt chips
  const samplePrompts = [
    "I need to complete my machine learning assignment by next Friday.",
    "Prepare quarterly financial review presentation for Monday morning executive meeting, around 3 hours.",
    "Fix authentication token expiration bug in user login flow by tomorrow 4pm, estimated 2 hours, high priority.",
    "Review Figma design wireframes for settings page before Wednesday afternoon, takes 1.5 hours."
  ];

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!inputPrompt.trim()) return;

    setIsGenerating(true);
    setIsSuccess(false);

    try {
      // Keep the loading state visible while task details are extracted.
      await new Promise(r => setTimeout(r, 600));
      const result = await aiService.parseTaskFromText(inputPrompt);
      setExtractedData(result);
    } catch (err) {
      console.error('Failed to parse task', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmCreate = async () => {
    if (!extractedData) return;

    await addTask({
      title: extractedData.title,
      description: extractedData.description,
      category: extractedData.category,
      deadline: extractedData.deadline,
      priority: extractedData.priority,
      estimatedHours: parseFloat(extractedData.estimatedHours) || 1.0,
      status: 'Pending'
    });

    setIsSuccess(true);
    setTimeout(() => {
      navigate('/tasks');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Quick Task Entry</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Describe a task and review the suggested title, deadline, priority, and time estimate before adding it. Local extraction works without an AI service; an OpenAI key enables optional AI extraction.
        </p>
      </div>

      {/* Input Prompt Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
            Task Description
          </label>
          <textarea
            rows={4}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Describe your task in natural language. Example: I need to complete my machine learning assignment by next Friday."
            className="w-full p-3.5 text-sm sm:text-base bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors leading-relaxed"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5">
          <span className="text-xs text-gray-400 font-medium">Or try one of these examples:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputPrompt(prompt)}
                className="text-xs text-left px-2.5 py-1.5 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
              >
                "{prompt.length > 50 ? prompt.slice(0, 48) + '...' : prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            disabled={!inputPrompt.trim() || isGenerating}
            onClick={handleGenerate}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-md transition-colors ${
              !inputPrompt.trim() || isGenerating
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Preparing task details...' : 'Prepare Task Details'}</span>
          </button>
        </div>
      </div>

      {/* Extracted Information Section */}
      {extractedData && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900">Extracted Task Attributes</h3>
            </div>
            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              Ready for verification
            </span>
          </div>

          {/* Extraction notes */}
          {extractedData.reasoning && (
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold">How these details were inferred: </span>
              {extractedData.reasoning}
            </div>
          )}

          {/* Editable Fields Grid */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={extractedData.title}
                onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
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
                  value={extractedData.category}
                  onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
                  placeholder="Type a category"
                />
                <datalist id="task-category-options">
                  <option value="Development" />
                  <option value="Research" />
                  <option value="Design" />
                  <option value="Operations" />
                  <option value="Personal" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={extractedData.priority}
                  onChange={(e) => setExtractedData({ ...extractedData, priority: e.target.value })}
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
                  value={extractedData.deadline}
                  onChange={(e) => setExtractedData({ ...extractedData, deadline: e.target.value })}
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
                  value={extractedData.estimatedHours}
                  onChange={(e) => setExtractedData({ ...extractedData, estimatedHours: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Attributes can be fine-tuned anytime after creation.
            </span>
            <button
              type="button"
              onClick={handleConfirmCreate}
              disabled={isSuccess}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-md transition-colors ${
                isSuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Task Added Successfully!</span>
                </>
              ) : (
                <>
                  <span>Confirm and Create Task</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
