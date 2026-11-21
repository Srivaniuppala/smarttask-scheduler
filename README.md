# SmartTask AI

**An intelligent task scheduling and productivity planning platform for graduate students.** SmartTask AI helps students organize coursework and research, estimate task completion likelihood, and turn deadlines into focused work blocks.

## Project flow

1. Add a task with its deadline, priority, and estimated effort. Optional natural-language extraction can suggest these fields.
2. Smart priority scoring ranks work using deadline pressure, selected priority, time waiting, and estimated effort.
3. A completion forecast estimates the chance of completing a task on time. It starts with a transparent baseline and trains a small logistic regression model after enough completed and overdue outcomes are collected in the browser.
4. The scheduler places the highest-ranked tasks into the selected work window, adding short breaks between blocks.
5. Optional browser and in-app reminders notify you 30 minutes before a deadline while the app is open.
6. Analytics summarize task completion and current completion forecasts.

The forecast is an estimate, not a guarantee. It is not labeled as a trained model until at least 12 outcomes, including successful and missed-deadline tasks, are available. Outcome history is stored locally in the current browser profile.

## Features

- Create, edit, search, prioritize, and track coursework and research tasks.
- Full CRUD operations for tasks and research goals, including editing and deleting goals and updating milestones.
- Store task, goal, and schedule records in SQLite with account ID ownership enforced by the Flask API.
- Generate a daily time-blocked plan from pending tasks, a selected date, start time, and available hours.
- Review deadlines in a calendar, track research goals, and use a focus timer.
- See priority scores and completion forecasts beside scheduled work.
- Enable local deadline reminders and browser notifications.
- Use local browser storage, or connect the optional Flask API for account-backed tasks.
- Optionally enable AI chat, task extraction, and schedule explanations with an OpenAI API key.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (the project currently uses port 3000). Create a production build with:

```bash
npm run build
```

## Scheduling and forecast details

Priority scores are deterministic and explainable: they combine the task's selected priority, time remaining before its deadline, how long it has waited, and estimated effort. The scheduler uses those scores and deadline dates to order tasks, then places them sequentially in the selected work window. It does not read external calendars or infer personal energy levels.

The completion forecast initially uses a documented baseline based on priority, deadline slack, task size, and whether the deadline has passed. As task outcomes are recorded, a browser-local logistic regression model is trained when there are at least 12 examples and at least three outcomes in each class. This is a small portfolio model, not a claim of production-grade or independently validated prediction accuracy.

Deadline reminders require the app to remain open. Browser notifications are optional and need the user's permission; in-app reminders are also shown.

## Optional Flask backend

```bash
python -m pip install -r backend/requirements.txt
python backend/app.py
```

The API defaults to `http://localhost:5000/api`. The Flask API stores users, tasks, goals, and schedules in `backend/focusai_auth.sqlite3`, keyed by account ID. The app can run without it using account-scoped browser storage. Check Settings to test the API connection. Set `CORS_ORIGINS` to your deployed frontend origin when hosting the API. `backend/schema.sql` is a legacy MySQL reference and is not used by the current Flask API.

## Optional AI features

AI chat, natural-language task extraction, and schedule explanations require an OpenAI API key configured on the backend. See [API_SETUP.md](API_SETUP.md). Core priority scoring, forecasting, scheduling, and reminders work without an API key. Never commit `backend/.env` or expose an API key in frontend code.

## Project layout

```text
src/
  components/   Shared interface and layout components
  context/      Task, authentication, and notification state
  data/         Example tasks and initial display data
  pages/        Dashboard, tasks, scheduler, calendar, goals, and settings
  services/     API clients, scheduling, and completion forecasting
backend/        Optional Flask API and database schema
```

## Notes for contributors

- Task and model history in local mode is specific to a browser profile and device.
- Demo data is included for first launch.
- `dist_preview/index.html` is a legacy standalone prototype; use the Vite app for the current experience.
