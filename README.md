# PeopleHub — HR Portal

A complete HR portal built with React 18, Vite, TypeScript, CSS Modules, and a Node/Express API. It includes four HR pages and an Azure OpenAI-powered assistant that remains usable with a mock reply when Azure credentials are not configured.

## Project structure

```text
.
├── frontend/                 React 18 + Vite application
├── backend/                  Express development/production API
├── netlify/functions/        Netlify serverless chat endpoint
├── .env.example              Azure OpenAI variable template
├── .gitignore
├── netlify.toml              Netlify build, functions, and redirect config
├── package.json              Root development scripts
└── README.md
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Optional: an Azure OpenAI resource and chat model deployment

## Run locally

1. Install every workspace dependency from the repository root:

   ```bash
   npm run install:all
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

   On PowerShell use:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Add real Azure values to `.env` if available. Keep this file private. If the values are missing or left as placeholders, the API returns a safe demo reply.

4. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

5. Open <http://localhost:5173>. The Express API runs on <http://localhost:3001>, and Vite proxies `/api/chat` to it.

## Production build

```bash
npm run build
npm start
```

`npm start` serves the Express API. Netlify uses the separate serverless function described below.

## Azure OpenAI configuration

Create an Azure OpenAI resource, deploy a chat-capable model, and set:

```dotenv
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-private-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

`AZURE_OPENAI_DEPLOYMENT` must be the deployment name configured in Azure, not merely the underlying model family name. Both API implementations follow the official `@azure/openai` 2.x integration: the Azure companion types come from `@azure/openai`, and its documented `AzureOpenAI` client comes from the companion `openai` package. Credentials are read only on the server and are never included in the frontend bundle.

## Push to GitHub

1. Create an empty repository on GitHub without generated files.
2. From this project directory run:

   ```bash
   git init
   git add .
   git commit -m "Build PeopleHub HR Portal"
   git branch -M main
   git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
   git push -u origin main
   ```

If this directory already has a configured repository, commit the changes and run `git push` instead.

## Deploy to Netlify

1. Sign in to Netlify and choose **Add new project → Import an existing project**.
2. Select GitHub, authorize access, and choose this repository.
3. Netlify reads `netlify.toml` automatically. Confirm these values:
   - Build command: `npm run build:frontend`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`
4. Open **Site settings → Environment variables** and add:
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT`
5. Trigger a deploy. The `/api/chat` route is redirected to the Netlify Function, so the Azure key remains server-side.

Never prefix the Azure variables with `VITE_`; doing so would expose them to browser code. Never commit the real `.env` file.

## Demo fallback

When any required Azure variable is absent or still contains a placeholder, both the Express route and Netlify Function return a canned HR-focused reply. This keeps the chat popup functional for demos without exposing or requiring credentials.
