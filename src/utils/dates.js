const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/;

// Datetime-local fields and the API use timezone-free wall-clock values.
// Parse those as local time instead of allowing Date.parse to assume UTC.
export function parseTaskDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value);
  const match = text.match(LOCAL_DATE_TIME);
  if (match) {
    const [, year, month, day, hour = '0', minute = '0', second = '0', fraction = '0'] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), Number((fraction + '000').slice(0, 3)));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toDateTimeLocalInput(value) {
  if (!value) return '';
  const text = String(value);
  const match = text.match(LOCAL_DATE_TIME);
  if (match) return `${match[1]}-${match[2]}-${match[3]}T${match[4] || '00'}:${match[5] || '00'}`;
  const date = parseTaskDate(text);
  if (!date) return '';
  const pad = part => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatTaskDate(value, options = {}) {
  const date = parseTaskDate(value);
  return date ? date.toLocaleString(undefined, options) : '';
}
