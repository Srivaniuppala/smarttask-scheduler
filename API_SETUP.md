# Optional AI features

SmartTask AI's priority scoring, completion forecasting, scheduler, and reminders work locally and do not need an AI service. An OpenAI API key is only needed for optional assistant replies, schedule explanations, and natural-language task extraction.

## Configure the backend

1. Create an API key in the [OpenAI API dashboard](https://platform.openai.com/api-keys).
2. Copy the example environment file and edit the copy:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   notepad backend\.env
   ```

3. Set the key in `backend/.env`:

   ```dotenv
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-5.4-mini
   ```

4. Install backend dependencies and start Flask:

   ```powershell
   py -m pip install -r backend\requirements.txt
   py backend\app.py
   ```

The key stays on the backend and is never sent to the browser. Assistant prompts, task descriptions, and schedule details used for AI explanations are sent to OpenAI. If the key is absent, the app uses its local task extraction and assistant fallback where available.

## Publishing safely

- Commit `backend/.env.example`, never `backend/.env`.
- Keep API keys out of frontend code, screenshots, commits, and public issue reports.
- For a hosted deployment, store the key as a secret environment variable on the server.
- If a key is exposed, revoke it and create a replacement.

For current SDK instructions, see the [OpenAI developer quickstart](https://developers.openai.com/api/docs/quickstart).
