# EvalAI Auth Gateway

Next.js gateway for EvalAI login and admin user management.

## Local run

```powershell
npm install
npm run dev
```

The app runs on port `3004`. The existing EvalTools launcher proxies `/login`,
`/admin-access`, `/admin-dashboard`, and `/evalai` to this gateway.

## Environment

`trainer_api_key` is validated only on the server by `/api/admin/access`.
Do not rename it to `NEXT_PUBLIC_*`.

```env
trainer_api_key=xxxxxx
EVALAI_STREAMLIT_URL=http://127.0.0.1:3001/evalai
EVALAI_SESSION_SECRET=replace-with-a-long-random-secret
```

Users are stored locally in `data/users.json` with scrypt password hashes.
