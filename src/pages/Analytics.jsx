import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { PRODUCTIVITY_METRICS } from '../data/mockData';
import { estimateCompletionChance, getCompletionModelSummary } from '../services/productivityModel';
import { 
  BarChart2, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

export const Analytics = () => {
  const { tasks, totalTasks, completedTasks, overdueTasks } = useTasks();
  const [timeRange, setTimeRange] = useState('7d');
  const pendingTasks = tasks.filter(task => String(task.status || '').toLowerCase() !== 'completed' && !task.completedAt);
  const completionForecast = pendingTasks.length
    ? Math.round(pendingTasks.reduce((sum, task) => sum + estimateCompletionChance(task).probability, 0) / pendingTasks.length)
    : null;
  const modelSummary = getCompletionModelSummary();

  // Clean colors for category pie chart
  const PIE_COLORS = ['#2563EB', '#4B5563', '#9CA3AF', '#60A5FA', '#D1D5DB'];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Productivity Analytics</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Quantitative analysis of your focus velocity, execution rates, and time allocation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md text-gray-700 focus:outline-none focus:border-blue-600"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">This Quarter</option>
          </select>

          <button
            onClick={() => alert('Productivity report summary exported as CSV.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Daily Score"
          value={`${PRODUCTIVITY_METRICS.dailyScore}/100`}
          icon={TrendingUp}
          change={PRODUCTIVITY_METRICS.scoreDelta}
          changeType="positive"
        />
        <StatCard
          title="Weekly Completion"
          value={`${PRODUCTIVITY_METRICS.weeklyCompletionRate}%`}
          icon={CheckCircle2}
          change={PRODUCTIVITY_METRICS.rateDelta}
          changeType="positive"
        />
        <StatCard
          title="Total Completed"
          value={completedTasks || PRODUCTIVITY_METRICS.totalCompletedTasks}
          icon={CheckCircle2}
          subtitle="All time verified"
        />
        <StatCard
          title="Delayed Tasks"
          value={overdueTasks || PRODUCTIVITY_METRICS.delayedTasks}
          icon={AlertCircle}
          change={overdueTasks > 0 ? "Requires review" : "Optimal"}
          changeType={overdueTasks > 0 ? "negative" : "positive"}
        />
        <StatCard
          title="Avg Completion"
          value={`${PRODUCTIVITY_METRICS.averageCompletionTimeHours}h`}
          icon={Clock}
          subtitle="Per task block"
        />
        <StatCard
          title="Completion Forecast"
          value={completionForecast === null ? '—' : `${completionForecast}%`}
          icon={TrendingUp}
          subtitle={modelSummary.trained ? `Learned from ${modelSummary.sampleCount} outcomes` : `Early estimate · ${modelSummary.sampleCount}/12 outcomes`}
        />
        <StatCard
          title="On-time Rate"
          value={modelSummary.onTimeRate === null ? '—' : `${modelSummary.onTimeRate}%`}
          icon={CheckCircle2}
          subtitle={`${modelSummary.completedOnTime} on time · ${modelSummary.missed} late or missed`}
        />
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Productivity Trends (2 cols) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Productivity Trends"
            subtitle="Performance score trajectory and focus hours"
          >
            <div className="h-72 w-full pt-4">
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
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    wrapperStyle={{ fontSize: '12px' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Productivity Score" 
                    stroke="#2563EB" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#2563EB', r: 3 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    name="Focus Hours" 
                    stroke="#9CA3AF" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Pie Chart: Task Distribution by Category (1 col) */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Category Distribution"
            subtitle="Percentage of tasks by functional domain"
          >
            <div className="h-72 w-full pt-2 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={PRODUCTIVITY_METRICS.categoryDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PRODUCTIVITY_METRICS.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => `${val}%`}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '6px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 px-2 text-[11px] text-gray-600">
                {PRODUCTIVITY_METRICS.categoryDistribution.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-sm" 
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                    />
                    <span>{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Bar Chart: Tasks Completed Per Day (Full width) */}
      <ChartCard
        title="Tasks Completed Per Day"
        subtitle="Completed tasks compared against target daily thresholds"
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
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="completed" name="Completed Tasks" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Daily Target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};
