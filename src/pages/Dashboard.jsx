import React from 'react';
import { useTasks } from '../context/TaskContext';
import { parseTaskDate } from '../utils/dates';
import { StatCard } from '../components/common/StatCard';
import { AIRecommendationCard } from '../components/common/AIRecommendationCard';
import { ChartCard } from '../components/common/ChartCard';
import { TaskTable } from '../components/common/TaskTable';
import { PRODUCTIVITY_METRICS } from '../data/mockData';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ListTodo, 
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { 
    tasks, 
    totalTasks, 
    completedTasks, 
    pendingTasks, 
    overdueTasks, 
    toggleTaskStatus, 
    deleteTask 
  } = useTasks();

  // Filter tasks for today's tasks
  const todayTasks = tasks.slice(0, 5);

  // Upcoming deadlines (first 3 pending tasks sorted by date)
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'Completed' && t.deadline)
    .sort((a, b) => (parseTaskDate(a.deadline)?.getTime() || Infinity) - (parseTaskDate(b.deadline)?.getTime() || Infinity))
    .slice(0, 3);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    const date = parseTaskDate(dateStr);
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Your graduate work, in one place.
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track coursework, research, deadlines, and focused work sessions from one dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <ListTodo className="w-4 h-4" />
            <span>Add or review tasks</span>
          </Link>
          <Link
            to="/smart-scheduler"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Smart Schedule</span>
          </Link>
        </div>
      </div>

      {/* 4 Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={ListTodo}
          change="+3 this week"
          changeType="positive"
          subtitle="Across all categories"
        />
        <StatCard
          title="Completed Tasks"
          value={completedTasks}
          icon={CheckCircle2}
          change={`${Math.round((completedTasks / (totalTasks || 1)) * 100)}% rate`}
          changeType="positive"
          subtitle="On track with weekly target"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={Clock}
          change="5 active"
          changeType="neutral"
          subtitle="Needs focus allocation"
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueTasks}
          icon={AlertCircle}
          change={overdueTasks > 0 ? "Requires action" : "All clear"}
          changeType={overdueTasks > 0 ? "negative" : "positive"}
          subtitle="Check deadline list"
        />
      </div>

      {/* AI Recommendations Section */}
          <AIRecommendationCard />

      {/* Productivity Charts: Overview & Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Trends (2 cols) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Productivity Overview"
            subtitle="Daily focus score index over the past 2 weeks"
            action={
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                +6% upward trend
              </span>
            }
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PRODUCTIVITY_METRICS.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E5E7EB' }} 
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E5E7EB' }}
                    domain={[60, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Productivity Score"
                    stroke="#2563EB" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#2563EB', r: 3 }} 
                    activeDot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Weekly Productivity Bar Chart (1 col) */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Weekly Productivity"
            subtitle="Tasks completed vs targets (Monâ€“Sun)"
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PRODUCTIVITY_METRICS.weeklyProductivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E5E7EB' }} 
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E5E7EB' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="completed" name="Completed" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Bottom Grid: Today's Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks Section (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Today's Tasks</h3>
              <p className="text-xs text-gray-500">Tasks scheduled for immediate execution</p>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <TaskTable
            tasks={todayTasks}
            onToggleStatus={toggleTaskStatus}
            onDelete={deleteTask}
          />
        </div>

        {/* Small Upcoming Deadlines Section (1 col) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h3>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((task) => (
                  <div 
                    key={task.id}
                    className="p-3 rounded-md border border-gray-100 hover:border-gray-200 transition-colors bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{task.title}</p>
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                        {task.estimatedHours}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{formatDeadline(task.deadline)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Link
                to="/calendar"
                className="w-full inline-flex items-center justify-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <span>Open Calendar View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
