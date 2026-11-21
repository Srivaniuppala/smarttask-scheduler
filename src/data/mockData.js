// Mock data for initial frontend experience and offline state
export const INITIAL_TASKS = [
  {
    id: 'TASK-101',
    isDemoData: true,
    title: 'Draft research proposal',
    description: 'Revise the research question, methodology, and project timeline.',
    category: 'Research',
    priority: 'High',
    deadline: '2026-11-21T17:00',
    estimatedHours: 2.5,
    status: 'In Progress',
    completedAt: null,
    createdAt: '2026-11-18T09:00:00Z'
  },
  {
    id: 'TASK-102',
    isDemoData: true,
    title: 'Review seminar readings',
    description: 'Annotate this week’s papers and prepare discussion questions.',
    category: 'Research',
    priority: 'Medium',
    deadline: '2026-11-21T12:00',
    estimatedHours: 1.0,
    status: 'Pending',
    completedAt: null,
    createdAt: '2026-11-19T08:30:00Z'
  },
  {
    id: 'TASK-103',
    isDemoData: true,
    title: 'Analyze pilot study results',
    description: 'Check the first round of data and summarize the main patterns.',
    category: 'Research',
    priority: 'High',
    deadline: '2026-11-21T18:00',
    estimatedHours: 2.0,
    status: 'Pending',
    completedAt: null,
    createdAt: '2026-11-19T10:15:00Z'
  },
  {
    id: 'TASK-104',
    isDemoData: true,
    title: 'Prepare lab meeting slides',
    description: 'Summarize progress, open questions, and next steps for the group.',
    category: 'Academic',
    priority: 'Low',
    deadline: '2026-11-22T15:00',
    estimatedHours: 1.5,
    status: 'Pending',
    completedAt: null,
    createdAt: '2026-11-19T11:00:00Z'
  },
  {
    id: 'TASK-105',
    isDemoData: true,
    title: 'Submit literature review outline',
    description: 'Index foreign keys on task_id and user_id to speed up query execution.',
    category: 'Operations',
    priority: 'Medium',
    deadline: '2026-11-20T16:00',
    estimatedHours: 1.0,
    status: 'Completed',
    completedAt: '2026-11-20T14:30:00Z',
    createdAt: '2026-11-17T09:00:00Z'
  },
  {
    id: 'TASK-106',
    isDemoData: true,
    title: 'Meet with thesis advisor',
    description: 'Synthesize productivity metrics and establish Q1 engineering milestones.',
    category: 'Operations',
    priority: 'High',
    deadline: '2026-11-20T11:00',
    estimatedHours: 2.0,
    status: 'Completed',
    completedAt: '2026-11-20T11:45:00Z',
    createdAt: '2026-11-16T14:00:00Z'
  },
  {
    id: 'TASK-107',
    isDemoData: true,
    title: 'Revise conference abstract',
    description: 'Verify JWT expiration, refresh tokens, and password reset email callbacks.',
    category: 'Development',
    priority: 'Medium',
    deadline: '2026-11-19T18:00',
    estimatedHours: 1.5,
    status: 'Completed',
    completedAt: '2026-11-19T17:10:00Z',
    createdAt: '2026-11-18T10:00:00Z'
  },
  {
    id: 'TASK-108',
    isDemoData: true,
    title: 'Complete methods chapter draft',
    description: 'Draft the study design and data collection sections.',
    category: 'Research',
    priority: 'High',
    deadline: '2026-11-19T14:00',
    estimatedHours: 3.0,
    status: 'Overdue',
    completedAt: null,
    createdAt: '2026-11-17T12:00:00Z'
  }
];

export const INITIAL_SCHEDULE = [
  {
    id: 'SCHED-1',
    time: '09:00 AM – 11:00 AM',
    title: 'Research proposal draft',
    category: 'Development',
    priority: 'High',
    type: 'Deep Work',
    reason: 'A focused block for substantial research work.',
    completed: false
  },
  {
    id: 'SCHED-2',
    time: '11:00 AM – 12:00 PM',
    title: 'Seminar reading and notes',
    category: 'Research',
    priority: 'Medium',
    type: 'Focus Block',
    reason: 'A shorter reading block before a break.',
    completed: false
  },
  {
    id: 'SCHED-3',
    time: '12:00 PM – 01:00 PM',
    title: 'Lunch break',
    category: 'Personal',
    priority: 'Low',
    type: 'Break',
    reason: 'Time reserved for a break.',
    completed: true
  },
  {
    id: 'SCHED-4',
    time: '02:00 PM – 04:00 PM',
    title: 'Analyze pilot study results',
    category: 'Development',
    priority: 'High',
    type: 'Analytical Work',
    reason: 'A longer block reserved for analysis.',
    completed: false
  },
  {
    id: 'SCHED-5',
    time: '04:00 PM – 05:00 PM',
    title: 'Review notes and plan next steps',
    category: 'Operations',
    priority: 'Low',
    type: 'Review',
    reason: 'A closing block to review work and plan what comes next.',
    completed: false
  }
];

export const INITIAL_GOALS = [
  {
    id: 'GOAL-1',
    title: 'Master Machine Learning & Deep Learning Foundations',
    description: 'Build intuition in core neural network architectures and mathematical foundations.',
    category: 'Professional',
    targetDate: '2026-12-31',
    milestones: [
      { id: 'M-101', text: 'Complete Stanford CS229 lecture notes', completed: true },
      { id: 'M-102', text: 'Build CNN image classifier from scratch in PyTorch', completed: true },
      { id: 'M-103', text: 'Implement Transformer attention mechanism', completed: false },
      { id: 'M-104', text: 'Deploy model using Flask REST API and Docker', completed: false }
    ]
  },
  {
    id: 'GOAL-2',
    title: 'Submit research proposal draft',
    description: 'Release high-performance productivity web app to first 250 early adopters.',
    category: 'Productivity',
    targetDate: '2026-12-15',
    milestones: [
      { id: 'M-201', text: 'Finalize clean monochrome SaaS UI/UX design', completed: true },
      { id: 'M-202', text: 'Build React + Vite frontend with Tailwind CSS', completed: true },
      { id: 'M-203', text: 'Connect Flask API to account-scoped SQLite storage', completed: false },
      { id: 'M-204', text: 'Onboard 50 beta test power users', completed: false }
    ]
  },
  {
    id: 'GOAL-3',
    title: 'Algorithm & Data Structure Fluency',
    description: 'Solve 100 high-frequency LeetCode questions across key patterns.',
    category: 'Education',
    targetDate: '2027-01-30',
    milestones: [
      { id: 'M-301', text: 'Solve 25 Two-Pointer and Sliding Window problems', completed: true },
      { id: 'M-302', text: 'Solve 25 Binary Tree and Graph BFS/DFS questions', completed: true },
      { id: 'M-303', text: 'Solve 25 Dynamic Programming patterns', completed: false },
      { id: 'M-304', text: 'Participate in 4 weekly live algorithmic contests', completed: false }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: 'Daily plan generated',
    message: 'Your task timeline is ready to review.',
    time: '15 mins ago',
    read: false,
    type: 'ai'
  },
  {
    id: 'NOTIF-2',
    title: 'Deadline Approaching',
    message: 'AI Project Development deadline is scheduled for tomorrow at 5:00 PM.',
    time: '1 hour ago',
    read: false,
    type: 'deadline'
  },
  {
    id: 'NOTIF-3',
    title: 'Task Completed',
    message: 'Database Schema Optimization was marked completed (+15 Focus points).',
    time: '3 hours ago',
    read: true,
    type: 'success'
  }
];

export const PRODUCTIVITY_METRICS = {
  dailyScore: 88,
  scoreDelta: '+6% vs yesterday',
  weeklyCompletionRate: 92,
  rateDelta: '+4% vs last week',
  totalCompletedTasks: 42,
  delayedTasks: 1,
  averageCompletionTimeHours: 1.8,
  weeklyProductivity: [
    { day: 'Mon', completed: 6, target: 5, score: 85 },
    { day: 'Tue', completed: 8, target: 6, score: 92 },
    { day: 'Wed', completed: 7, target: 6, score: 88 },
    { day: 'Thu', completed: 5, target: 6, score: 78 },
    { day: 'Fri', completed: 9, target: 7, score: 95 },
    { day: 'Sat', completed: 4, target: 4, score: 90 },
    { day: 'Sun', completed: 3, target: 3, score: 82 }
  ],
  trends: [
    { date: 'Nov 8', score: 72, hours: 5.5 },
    { date: 'Nov 10', score: 76, hours: 6.0 },
    { date: 'Nov 12', score: 81, hours: 6.8 },
    { date: 'Nov 14', score: 79, hours: 5.9 },
    { date: 'Nov 16', score: 85, hours: 7.2 },
    { date: 'Nov 18', score: 84, hours: 7.0 },
    { date: 'Nov 20', score: 88, hours: 7.5 }
  ],
  categoryDistribution: [
    { name: 'Development', value: 45, color: '#2563EB' },
    { name: 'Research', value: 20, color: '#4B5563' },
    { name: 'Operations', value: 18, color: '#9CA3AF' },
    { name: 'Design', value: 12, color: '#60A5FA' },
    { name: 'Personal', value: 5, color: '#D1D5DB' }
  ]
};
