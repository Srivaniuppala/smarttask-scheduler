import api from './api';
import { parseTaskDate } from '../utils/dates';
import { estimateCompletionChance, getTaskPriorityScore } from './productivityModel';

export const aiService = {
  // Parse natural language description into structured task attributes
  async parseTaskFromText(inputText) {
    try {
      const response = await api.post('/ai/parse-task', { text: inputText });
      return response.data;
    } catch (error) {
      const fallback = this.localNLPParser(inputText);
      fallback.reasoning = (error?.code === 'AI_NOT_CONFIGURED'
        ? 'OpenAI is not configured on the backend; using local extraction. '
        : 'OpenAI could not be reached; using local extraction. ') + fallback.reasoning;
      return fallback;
    }
  },

  // Heuristic parser simulating AI reasoning
  localNLPParser(text) {
    const lower = text.toLowerCase();

    let priority = 'Medium';
    if (/\b(urgent|asap|critical|high priority|immediately|urgent)\b/.test(lower)) {
      priority = 'High';
    } else if (/\b(low priority|when possible|minor|casual)\b/.test(lower)) {
      priority = 'Low';
    }

    let category = 'Development';
    const explicitCategory = text.match(/\b(?:in|under|as)\s+([a-z][a-z0-9 &/-]*?)\s+category\b/i);
    if (explicitCategory) category = explicitCategory[1].trim().replace(/\b\w/g, letter => letter.toUpperCase());
    else if (/\b(cybersecurity|programming|coding|software|bug|api|website|app|development|hackathon)\b/.test(lower)) category = 'Development';
    else if (/\b(assignment|study|research|read|paper|exam|learn)\b/.test(lower)) category = 'Research';
    else if (/\b(design|figma|ui|ux|wireframe|prototype)\b/.test(lower)) category = 'Design';
    else if (/\b(meeting|email|report|presentation|sync|competition|hackathon)\b/.test(lower)) category = 'Operations';
    else if (/\b(workout|gym|doctor|groceries|dance|personal)\b/.test(lower)) category = 'Personal';

    let estimatedHours = 2.0;
    const hourMatch = lower.match(/\b(?:for\s+)?(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)\b/);
    if (hourMatch) {
      estimatedHours = parseFloat(hourMatch[1]);
    } else if (/\b(quick|short)\b/.test(lower)) {
      estimatedHours = 0.5;
    } else if (/\b(large|assignment|project|hackathon)\b/.test(lower)) {
      estimatedHours = 3.0;
    }

    const targetDate = extractDeadline(text);
    const deadlineString = toLocalDateTimeInput(targetDate);

    let title = text
      .replace(/^(?:i need to|i need|please|i want to|i have to|have to|must|add|create|schedule)\s+/i, '')
      .replace(/\b(?:on|by)\s+(?:the\s+)?(?:date\s+)?\d{1,2}(?:st|nd|rd|th)?\s+[a-z]+(?:\s+\d{4})?(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i, '')
      .replace(/\b(?:on|by)\s+(?:today|tomorrow|next\s+\w+|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i, '')
      .replace(/\b(?:in|under|as)\s+[a-z][a-z0-9 &/-]*?\s+category\b/i, '')
      .replace(/\b(?:for\s+)?\d+(?:\.\d+)?\s*(?:hours?|hrs?|h)\b/i, '')
      .replace(/\b(?:urgent|asap|critical|high priority|low priority|when possible|immediately)\b/ig, '')
      .replace(/\s+/g, ' ').replace(/[,.\s]+$/, '').trim();
    title = title.replace(/\bhackthon\b/ig, 'hackathon');
    if (title.length > 55) {
      title = title.slice(0, 52) + '...';
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
      title: title || 'New AI Generated Task',
      description: text,
      category,
      priority,
      deadline: deadlineString,
      estimatedHours,
      confidence: 0.94,
      reasoning: `Detected category "${category}"${explicitCategory ? ' from the category you specified' : ' from the task topic'}, ${priority.toLowerCase()} priority, ${estimatedHours} hour${estimatedHours === 1 ? '' : 's'} estimated, and deadline ${targetDate.toLocaleDateString()}.`
    };
  },

  // Generate optimal daily schedule
  async generateSchedule(selectedDate, options, tasksList) {
    const settings = typeof options === 'object' ? options : { workingHours: options, startHour: '09:00' };
    const hours = Math.max(1, Number(settings.workingHours) || 8);
    const parts = (settings.startHour || '09:00').split(':').map(Number);
    let cursor = parts[0] * 60 + parts[1];
    let remaining = hours * 60;
    const dateParts = selectedDate.split('-').map(Number);
    const dayNumber = Math.floor(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]) / 86400000);
    const tasks = [...tasksList].filter(task => String(task.status || '').toLowerCase() !== 'completed' && !task.completedAt);
    const deadlineDistance = task => {
      if (!task.deadline) return Number.MAX_SAFE_INTEGER;
      const [year, month, day] = task.deadline.slice(0, 10).split('-').map(Number);
      return Math.floor(Date.UTC(year, month - 1, day) / 86400000) - dayNumber;
    };
    const daysWaiting = task => {
      if (!task.createdAt) return 0;
      const created = parseTaskDate(task.createdAt);
      return created ? Math.floor((dayNumber * 86400000 - Date.UTC(created.getFullYear(), created.getMonth(), created.getDate())) / 86400000) : 0;
    };
    const scheduledPriority = task => {
      const score = getTaskPriorityScore(task);
      return score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    };
    const dateGroup = task => {
      const distance = deadlineDistance(task);
      if (distance === 0) return 0; // Tasks due on the selected day come first.
      if (distance < 0) return 1; // Then clear overdue work.
      if (distance !== Number.MAX_SAFE_INTEGER) return 2; // Upcoming deadlines follow.
      return 3; // Undated tasks are scheduled last.
    };
    tasks.sort((a, b) => getTaskPriorityScore(b) - getTaskPriorityScore(a)
      || dateGroup(a) - dateGroup(b)
      || deadlineDistance(a) - deadlineDistance(b)
      || daysWaiting(b) - daysWaiting(a));
    const blocks = [];
    let index = 0;
    while (remaining > 0 && index < tasks.length) {
      const task = tasks[index++];
      const duration = Math.min(remaining, Math.max(30, Math.round((Number(task.estimatedHours) || 1) * 60)));
      const end = cursor + duration;
      const priority = scheduledPriority(task);
      const completion = estimateCompletionChance(task);
      const urgencyNote = ' Priority score ' + getTaskPriorityScore(task) + '/100; estimated completion chance ' + completion.probability + '%.';
      blocks.push({ id: 'block-' + selectedDate + '-' + index, taskId: task.id, time: formatRange(cursor, end), title: task.title, category: task.category, priority, completionChance: completion.probability, completionModelTrained: completion.modelTrained, type: priority === 'High' ? 'Deep Work' : 'Focus Block', reason: 'Scheduled from deadline, priority, waiting time, and effort.' + urgencyNote });
      cursor = end;
      remaining -= duration;
      if (remaining >= 30 && index < tasks.length) {
        blocks.push({ id: 'break-' + selectedDate + '-' + index, time: formatRange(cursor, cursor + 15), title: 'Short Break', priority: 'Low', type: 'Break', reason: 'A short recovery break helps maintain focus.' });
        cursor += 15;
        remaining -= 15;
      }
    }
    if (!blocks.length) blocks.push({ id: 'block-' + selectedDate + '-empty', time: formatRange(cursor, cursor + remaining), title: 'Focused Work Session', priority: 'Medium', type: 'Focus Block', reason: 'Reserved focus time for ' + selectedDate + '. Add pending tasks to personalize this schedule.' });
    let explanation = 'Schedule for ' + selectedDate + ', starting at ' + (settings.startHour || '09:00') + ' with ' + hours + ' available work hours. Tasks due that day come first, followed by urgent and long-waiting work.';
    try {
      const response = await api.post('/ai/explain-schedule', {
        date: selectedDate,
        startTime: settings.startHour || '09:00',
        workingHours: hours,
        schedule: blocks
      });
      explanation = response.data?.explanation || explanation;
    } catch (error) {
      explanation = (error?.code === 'AI_NOT_CONFIGURED'
        ? 'OpenAI is not configured on the backend; using a local explanation. '
        : 'OpenAI could not be reached; using a local explanation. ') + explanation;
    }
    return { schedule: blocks, explanation };
  },
  // Assistant Chatbot response
  async askAssistant(message, conversationHistory = [], tasks = []) {
    try {
      const response = await api.post('/ai/assistant', { message, history: conversationHistory });
      if (response.data?.reply) return response.data.reply;
    } catch {
      // Keep the chat useful when the optional API is unavailable. Never show
      // transport or provider errors as if they were an answer to the question.
      return this.localAssistant(message, conversationHistory, tasks);
    }
    return this.localAssistant(message, conversationHistory, tasks);
  },

  localAssistant(message, conversationHistory = [], tasks = []) {
    const lower = message.toLowerCase().replace(/\bcur{2,}ent\b/g, 'current');
    const pending = tasks.filter(task => String(task.status || '').toLowerCase() !== 'completed' && !task.completedAt);
    const completed = tasks.filter(task => String(task.status || '').toLowerCase() === 'completed' || task.completedAt);
    const overdue = pending.filter(task => { const deadline = parseTaskDate(task.deadline); return deadline && deadline < new Date(); });
    const byUrgency = (a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] ?? 1) - ({ High: 0, Medium: 1, Low: 2 }[b.priority] ?? 1) || (parseTaskDate(a.deadline)?.getTime() ?? Infinity) - (parseTaskDate(b.deadline)?.getTime() ?? Infinity);
    const listTasks = (items, heading) => items.length
      ? heading + ':\n' + items.map(task => '- ' + task.title + ' (' + task.priority + ' priority' + (task.deadline ? ', due ' + (parseTaskDate(task.deadline)?.toLocaleString() || task.deadline) : '') + ')').join('\n')
      : 'There are no ' + heading.toLowerCase() + ' in your task list.';

    if (/\b(pending|unfinished|incomplete|to-do|todo)\b/.test(lower)) return listTasks(pending.sort(byUrgency), 'Pending tasks');
    if (/\b(current|active)\b/.test(lower) && /\b(tasks?|work|todo)\b/.test(lower)) return listTasks(pending.sort(byUrgency), 'Current tasks');
    if (/\b(completed|finished|done)\b/.test(lower) && /\b(task|work|list|show|give|what|which|all|ones)\b/.test(lower)) return listTasks(completed, 'Completed tasks');
    if (/\b(overdue|late|missed deadline)\b/.test(lower)) return listTasks(overdue.sort(byUrgency), 'Overdue tasks');
    if (/\b(all tasks|every task|task list)\b/.test(lower)) return listTasks(tasks, 'All tasks');

    const mentionedTask = [...tasks].sort((a, b) => b.title.length - a.title.length).find(task => lower.includes(task.title.toLowerCase()));
    if (mentionedTask && /\b(status|deadline|due|priority|how long|hours)\b/.test(lower)) {
      const deadline = mentionedTask.deadline ? (parseTaskDate(mentionedTask.deadline)?.toLocaleString() || mentionedTask.deadline) : 'no deadline set';
      return mentionedTask.title + ' is ' + String(mentionedTask.status || 'pending').toLowerCase() + ', has ' + String(mentionedTask.priority || 'medium').toLowerCase() + ' priority, is estimated at ' + (Number(mentionedTask.estimatedHours) || 1) + ' hours, and is due ' + deadline + '.';
    }
    if (/\b(focus|priorities|priority|prioritize|prioritise|what.*(do|work)|start)\b/.test(lower)) {
      const next = [...pending].sort(byUrgency)[0];
      return next ? 'Start with "' + next.title + '" (' + next.priority + ' priority)' + (next.deadline ? ', due ' + (parseTaskDate(next.deadline)?.toLocaleDateString() || next.deadline) : '') + '. You have ' + pending.length + ' unfinished tasks.' : 'You have no pending tasks. Add a task or use this time for planned deep work.';
    }
    if (/\b(break down|steps|how.*start)\b/.test(lower)) {
      if (!mentionedTask) return 'Which task should I break down? Tell me its title and I’ll tailor the steps to the task and its deadline.';
      const hours = Math.max(1, Number(mentionedTask.estimatedHours) || 1);
      const deadline = mentionedTask.deadline ? (parseTaskDate(mentionedTask.deadline)?.toLocaleDateString() || mentionedTask.deadline) : 'the deadline you set';
      const firstStepMinutes = Math.min(45, Math.max(20, Math.round(hours * 60 / 3)));
      return 'For "' + mentionedTask.title + '":\n1. (' + firstStepMinutes + ' min) Define the deliverable and check the requirements.\n2. (30 min) Identify the riskiest or least certain part and make a small first attempt.\n3. (' + Math.max(15, Math.round(hours * 60) - firstStepMinutes - 30) + ' min) Complete the remaining work in focused chunks under an hour.\n4. (15 min) Review the result and leave time to submit it by ' + deadline + '.';
    }
    if (/\b(schedule|plan|sprint)\b/.test(lower)) {
      const nextTasks = [...pending].sort(byUrgency).slice(0, 3);
      return nextTasks.length ? 'Your best candidates are ' + nextTasks.map(task => task.title).join(', ') + '. Set the date, start time, and hours in Smart Scheduler to build the timeline.' : 'There are no pending tasks to schedule. Add tasks first, then generate a plan in Smart Scheduler.';
    }
    if (/\b(score|productiv)\b/.test(lower)) {
      if (/\b(improve|increase|raise|boost|better|how can|how do)\b/.test(lower)) {
        return 'To improve your completion rate, choose one clearly defined pending task, schedule a focused block for it, and mark it complete when finished. Break larger coursework or research tasks into smaller steps and review your deadlines at the start of each day.';
      }
      const score = tasks.length ? Math.round(completed.length / tasks.length * 100) : 0;
      return 'You have completed ' + completed.length + ' of ' + tasks.length + ' tasks (' + score + '%).';
    }
    if (/\b(hello|hi|hey)\b/.test(lower)) return 'Hi! I can list your pending, completed, or overdue tasks, help choose what to work on, or plan your day.';
    if (/\b(thank you|thanks)\b/.test(lower)) return 'You’re welcome. Tell me what you want to work on next and I’ll use your current task list to help.';

    const previousTopic = conversationHistory.filter(item => item.sender === 'user').slice(-1)[0]?.text;
    return 'I read your question about "' + message + '". I can look up task status, deadlines, priorities, and workload from your task list. If you meant something else, add a little context and I’ll narrow it down.' + (previousTopic ? ' We were previously discussing "' + previousTopic + '".' : '');
  }
};

function formatRange(start, end) {
  const format = minutes => {
    const h24 = Math.floor(minutes / 60) % 24;
    const hour = String(h24 % 12 || 12).padStart(2, '0');
    const minute = String(minutes % 60).padStart(2, '0');
    return hour + ':' + minute + ' ' + (h24 < 12 ? 'AM' : 'PM');
  };
  return format(start) + ' – ' + format(end);
}

function toLocalDateTimeInput(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function extractDeadline(text) {
  const date = new Date();
  const monthNames = 'january february march april may june july august september october november december'.split(' ');
  const monthPattern = monthNames.join('|');
  let match = text.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthPattern})(?:\\s+(\\d{4}))?\\b`, 'i'));
  let day;
  let month;
  let year;
  if (match) {
    day = Number(match[1]);
    month = monthNames.indexOf(match[2].toLowerCase());
    year = Number(match[3]) || date.getFullYear();
  } else {
    match = text.match(new RegExp(`\\b(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, 'i'));
    if (match) {
      month = monthNames.indexOf(match[1].toLowerCase());
      day = Number(match[2]);
      year = Number(match[3]) || date.getFullYear();
    } else {
      match = text.match(/\b(?:on|by|date)\s+(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?\b/i);
      if (match) {
        day = Number(match[1]);
        month = Number(match[2]) - 1;
        year = Number(match[3]) || date.getFullYear();
      }
    }
  }

  if (day && month >= 0 && month <= 11) {
    const parsed = new Date(year, month, day, 17, 0, 0, 0);
    if (parsed.getDate() === day && parsed.getMonth() === month) date.setTime(parsed.getTime());
  } else if (/\btomorrow\b/i.test(text)) {
    date.setDate(date.getDate() + 1);
  } else if (/\btoday\b/i.test(text)) {
    // Keep today as the deadline date.
  } else {
    const weekdayMatch = text.match(/\b(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (weekdayMatch) {
      const weekdays = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      const distance = (weekdays[weekdayMatch[1].toLowerCase()] - date.getDay() + 7) % 7 || 7;
      date.setDate(date.getDate() + distance);
    } else {
      date.setDate(date.getDate() + 2);
    }
  }

  const timeMatch = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    let hour = Number(timeMatch[1]) % 12;
    if (timeMatch[3].toLowerCase() === 'pm') hour += 12;
    date.setHours(hour, Number(timeMatch[2]) || 0, 0, 0);
  } else {
    date.setHours(17, 0, 0, 0);
  }
  return date;
}
