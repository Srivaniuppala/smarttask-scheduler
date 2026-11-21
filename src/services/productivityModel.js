const OUTCOME_KEY = 'smarttask_outcomes';
const MODEL_MIN_SAMPLES = 12;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function readOutcomes() {
  try {
    const user = JSON.parse(localStorage.getItem('focusai_user') || 'null');
    const userKey = `${OUTCOME_KEY}:${user?.id || 'guest'}`;
    const saved = JSON.parse(localStorage.getItem(userKey) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveOutcomes(outcomes) {
  try {
    const user = JSON.parse(localStorage.getItem('focusai_user') || 'null');
    const userKey = `${OUTCOME_KEY}:${user?.id || 'guest'}`;
    localStorage.setItem(userKey, JSON.stringify(outcomes.slice(-500)));
  } catch {
    // Forecasting can continue with the rule-based estimate if storage is full.
  }
}

function featuresForTask(task, now = Date.now()) {
  const priority = ({ High: 1, Medium: 0, Low: -1 })[task.priority] ?? 0;
  const hours = clamp(Number(task.estimatedHours) || 1, 0.25, 16);
  const deadline = task.deadline ? new Date(task.deadline).getTime() : NaN;
  const slackHours = Number.isFinite(deadline) ? (deadline - now) / 3600000 - hours : 24;
  return [1, priority, clamp(slackHours / 72, -1.5, 1.5), clamp(hours / 8, 0, 2)];
}

function taskDeadline(task) {
  const time = task.deadline ? new Date(task.deadline).getTime() : NaN;
  return Number.isFinite(time) ? time : null;
}

function taskOutcome(task) {
  const completed = String(task.status || '').toLowerCase() === 'completed' || Boolean(task.completedAt);
  if (completed) {
    const deadline = taskDeadline(task);
    const completedAt = task.completedAt ? new Date(task.completedAt).getTime() : Date.now();
    return deadline === null || completedAt <= deadline ? 1 : 0;
  }
  const deadline = taskDeadline(task);
  return deadline !== null && deadline < Date.now() ? 0 : null;
}

export function recordTaskOutcomes(tasks) {
  const outcomes = readOutcomes();
  const known = new Set(outcomes.map(item => item.id));
  let changed = false;
  tasks.forEach(task => {
    // Do not let the bundled TASK-101...TASK-108 examples masquerade as user outcomes.
    if (task.isDemoData || /^TASK-10[1-8]$/.test(String(task.id))) return;
    const label = taskOutcome(task);
    if (label === null || known.has(String(task.id))) return;
    const created = task.createdAt ? new Date(task.createdAt).getTime() : Date.now();
    outcomes.push({ id: String(task.id), x: featuresForTask(task, Number.isFinite(created) ? created : Date.now()), y: label, hasDeadline: Boolean(task.deadline) });
    known.add(String(task.id));
    changed = true;
  });
  if (changed) saveOutcomes(outcomes);
  return outcomes.length;
}

function trainLogisticModel(outcomes) {
  const weights = [0, 0, 0, 0];
  const rate = 0.08;
  for (let epoch = 0; epoch < 700; epoch += 1) {
    const gradient = [0, 0, 0, 0];
    outcomes.forEach(({ x, y }) => {
      const z = weights.reduce((sum, weight, index) => sum + weight * x[index], 0);
      const prediction = 1 / (1 + Math.exp(-clamp(z, -20, 20)));
      x.forEach((value, index) => { gradient[index] += (prediction - y) * value; });
    });
    weights.forEach((_, index) => {
      const regularization = index === 0 ? 0 : 0.015 * weights[index];
      weights[index] -= rate * (gradient[index] / outcomes.length + regularization);
    });
  }
  return weights;
}

export function estimateCompletionChance(task, now = Date.now()) {
  const outcomes = readOutcomes();
  const positives = outcomes.filter(item => item.y === 1).length;
  const negatives = outcomes.length - positives;
  const x = featuresForTask(task, now);
  const hasTrainingData = outcomes.length >= MODEL_MIN_SAMPLES && positives >= 3 && negatives >= 3;
  let probability;
  let source;

  if (hasTrainingData) {
    const weights = trainLogisticModel(outcomes);
    const z = weights.reduce((sum, weight, index) => sum + weight * x[index], 0);
    probability = 1 / (1 + Math.exp(-clamp(z, -20, 20)));
    source = `Learned from ${outcomes.length} completed or overdue tasks`;
  } else {
    const missedDeadline = taskDeadline(task) !== null && taskDeadline(task) < now;
    const logit = 0.25 + 0.45 * x[1] + 0.35 * x[2] - 0.35 * x[3] - (missedDeadline ? 1.2 : 0);
    probability = 1 / (1 + Math.exp(-logit));
    source = `Early estimate; learning from ${outcomes.length}/${MODEL_MIN_SAMPLES} outcomes`;
  }

  return { probability: Math.round(probability * 100), source, sampleCount: outcomes.length, modelTrained: hasTrainingData };
}

export function getCompletionModelSummary() {
  const outcomes = readOutcomes();
  const trained = outcomes.length >= MODEL_MIN_SAMPLES
    && outcomes.filter(item => item.y === 1).length >= 3
    && outcomes.filter(item => item.y === 0).length >= 3;
  const deadlineOutcomes = outcomes.filter(item => item.hasDeadline);
  const completedOnTime = deadlineOutcomes.filter(item => item.y === 1).length;
  return {
    sampleCount: outcomes.length,
    trained,
    completedOnTime,
    missed: deadlineOutcomes.length - completedOnTime,
    onTimeRate: deadlineOutcomes.length ? Math.round(completedOnTime / deadlineOutcomes.length * 100) : null
  };
}

export function getTaskPriorityScore(task, now = Date.now()) {
  const priorityPoints = ({ High: 35, Medium: 22, Low: 10 })[task.priority] ?? 18;
  const deadline = taskDeadline(task);
  const hoursToDeadline = deadline === null ? Infinity : (deadline - now) / 3600000;
  const deadlinePoints = deadline === null ? 0
    : hoursToDeadline < 0 ? 40
      : hoursToDeadline <= 24 ? 38
        : hoursToDeadline <= 72 ? 28
          : hoursToDeadline <= 168 ? 16 : 5;
  const created = task.createdAt ? new Date(task.createdAt).getTime() : now;
  const waitingDays = Number.isFinite(created) ? Math.max(0, (now - created) / 86400000) : 0;
  const waitingPoints = Math.min(15, Math.floor(waitingDays / 2));
  const riskPoints = (Number(task.estimatedHours) || 1) >= 4 ? 7 : 0;
  return Math.min(100, priorityPoints + deadlinePoints + waitingPoints + riskPoints);
}
