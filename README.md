# EvalTools Home

Production-ready frontend shell for the EvalTools project. It links to three local AI tools:

- EvalAI
- ComcoachAI
- ConvAI

## Run Locally

1. Install dependencies:

```powershell
npm install
```

2. Copy the environment template:

```powershell
Copy-Item .env.example .env
```

3. Edit `.env` with the ports or domains where your tools run.

4. Start the home page:

```powershell
npm run dev
```

## Connect Cards To Your Local Tool Projects

Each card opens the frontend URL configured in `.env`:

```env
VITE_EVALAI_URL=http://localhost:3001
VITE_COMCOACHAI_URL=http://localhost:3002
VITE_CONVAI_URL=http://localhost:3003
```

That means each project folder should run its own frontend server on that port. Example:

```powershell
cd D:\Path\To\EvalAI
npm run dev -- --port 3001
```

Do the same for ComcoachAI and ConvAI using separate ports.

## Connect Through APIs

The home page can store each tool's API base URL from `.env`:

```env
VITE_EVALAI_API_URL=http://localhost:8001
VITE_COMCOACHAI_API_URL=http://localhost:8002
VITE_CONVAI_API_URL=http://localhost:8003
```

Use these URLs when you need the home page to call a tool API directly, for example health checks, usage stats, or dashboard summaries. The card navigation itself should link to the tool frontend, not to the project folder path.

Recommended local architecture:

```text
EvalTools Home  -> http://localhost:5173
EvalAI UI       -> http://localhost:3001
EvalAI API      -> http://localhost:8001
ComcoachAI UI   -> http://localhost:3002
ComcoachAI API  -> http://localhost:8002
ConvAI UI       -> http://localhost:3003
ConvAI API      -> http://localhost:8003
```

For production, replace those localhost values with deployed domains. If all apps are deployed under one domain, put a reverse proxy in front of them:

```text
/              -> EvalTools Home
/evalai        -> EvalAI frontend
/api/evalai    -> EvalAI backend
/comcoachai    -> ComcoachAI frontend
/api/comcoachai-> ComcoachAI backend
/convai        -> ConvAI frontend
/api/convai    -> ConvAI backend
```

## Build

```powershell
npm run build
```

The production output is generated in `dist/`.
