Backend: Render
- Root Directory: `backend`
- Runtime: `Python`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env Vars:
  - `GROQ_API_KEY=...`
  - `ALLOWED_ORIGINS=https://your-app.vercel.app`
  - Optional preview support: `ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app`

Frontend: Vercel
- Root Directory: `FE/frontend-app`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env Vars:
  - `VITE_API_URL=https://your-backend.onrender.com`

Deploy order
1. Deploy backend on Render.
2. Copy the Render backend URL.
3. Set `VITE_API_URL` in Vercel.
4. Deploy frontend on Vercel.
5. Copy the Vercel production URL.
6. Set `ALLOWED_ORIGINS` in Render to that Vercel URL and redeploy backend.
