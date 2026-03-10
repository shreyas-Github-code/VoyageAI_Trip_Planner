# VoyageAI Trip Planner

[Live Demo](https://voyage-ai-trip-planner-puce.vercel.app/)

VoyageAI Trip Planner is a full-stack travel planning app that generates destination highlights, ranked place suggestions, and a day-by-day itinerary using an LLM-backed FastAPI service and a React frontend..

## What the project does

The app guides a user through a 3-step travel planning flow :

1. Enter `from_location`, `to_location`, and optional interests.
2. Generate:
   - travel highlights and recommendations
   - 20 place options grouped into `high`, `mid`, and `low` priority
3. Select places and generate a multi-day itinerary with:
   - places per day
   - transport notes
   - timing suggestions
   - planning notes

The latest generated itinerary is saved only in browser local storage and can be viewed again on the History page, printed, or downloaded as a text file.

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router (`HashRouter`)
- Framer Motion
- Tailwind packages are installed, but the current UI is primarily driven by injected custom CSS from `src/services/styles.ts`
- Axios is installed and typed API helpers exist in `src/services/api.ts`, although the main planner component currently uses `fetch` directly

### Backend

- Python 3
- FastAPI
- Pydantic v2
- Uvicorn
- `python-dotenv`
- Groq SDK
- LLM model: `llama-3.3-70b-versatile`

### Deployment targets

- Frontend: Vercel
- Backend: Render

## Core functionality

### Planner flow

The main planner lives in [FE/frontend-app/src/components/Tg.tsx](FE/frontend-app/src/components/Tg.tsx).

- Step 1: Collect trip input
- Step 2: Call `/tour` and `/tour/options` in parallel
- Step 3: Let the user select places and choose trip duration
- Step 4: Call `/tour/itinerary` and render the final itinerary

### History flow

The history page lives in [FE/frontend-app/src/components/HistoryPage.tsx](FE/frontend-app/src/components/HistoryPage.tsx).

- Reads the last itinerary from local storage
- Shows the latest saved trip only
- Supports print
- Supports `.txt` download
- Supports clear/reset

### Backend generation flow

The service logic lives in [backend/app/services/tour_service.py](backend/app/services/tour_service.py).

- Validates and normalizes locations
- Rejects identical origin and destination
- Builds prompt text for each use case
- Sends requests to Groq
- Parses JSON responses for options and itineraries
- Returns structured API responses with timestamps

## Architecture

```text
React UI
  -> POST /tour
  -> POST /tour/options
  -> POST /tour/itinerary
FastAPI routes
  -> Pydantic request validation
  -> Tour service
  -> Groq LLM
Frontend localStorage
  -> saves latest itinerary only
```

## Project structure

```text
VoyageAI_Trip_Planner/
|-- README.md
|-- DEPLOY_RENDER_VERCEL.md
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- start_backend.ps1
|   |-- .env.example
|   `-- app/
|       |-- main.py
|       |-- core/config.py
|       |-- api/routes/tours.py
|       |-- schemas/tour.py
|       `-- services/tour_service.py
`-- FE/
    `-- frontend-app/
        |-- package.json
        |-- vite.config.ts
        `-- src/
            |-- App.tsx
            |-- main.tsx
            |-- components/
            |   |-- Tg.tsx
            |   `-- HistoryPage.tsx
            |-- helpers/helpers.ts
            `-- services/
                |-- api.ts
                |-- history.ts
                |-- styles.ts
                `-- utils.ts
```

## Frontend details

### Routing

Defined in [FE/frontend-app/src/App.tsx](FE/frontend-app/src/App.tsx):

- `/` -> planner page
- `/history` -> saved itinerary page

`HashRouter` is used, which is useful for static hosting scenarios such as Vercel without extra server-side route handling.

### UI behavior

The planner component includes:

- animated step navigation
- city suggestions
- interest suggestions and chips
- multi-step planner state
- responsive layout
- reduced-motion support through Framer Motion

### Styling approach

The main visual design is defined as a large CSS string in [FE/frontend-app/src/services/styles.ts](FE/frontend-app/src/services/styles.ts) and injected into the document head by the planner component.

This means:

- the project does not currently rely on component-scoped CSS modules
- Tailwind is present in dependencies, but the main screen design is custom CSS-driven
- typography is loaded dynamically from Google Fonts inside the component

### Local persistence

Implemented in [FE/frontend-app/src/services/history.ts](FE/frontend-app/src/services/history.ts).

- storage key: `voyageai:last-itinerary`
- persistence scope: current browser only
- database usage: none
- saved records: only the latest itinerary

## Backend details

### App setup

The FastAPI app is created in [backend/app/main.py](backend/app/main.py).

- app name: `Tour Guide Assistant`
- CORS enabled
- origins loaded from environment variables
- routes mounted from `app.api.routes.tours`

### Configuration

Defined in [backend/app/core/config.py](backend/app/core/config.py).

Environment variables:

- `GROQ_API_KEY`
- `ALLOWED_ORIGINS`
- `ALLOWED_ORIGIN_REGEX` optional

### Schemas

Defined in [backend/app/schemas/tour.py](backend/app/schemas/tour.py).

Main models:

- `TourRequest`
- `TourResponse`
- `TourOptionsResponse`
- `ItineraryRequest`
- `ItineraryResponse`
- `OptionPlace`
- `DayPlan`

### API routes

Defined in [backend/app/api/routes/tours.py](backend/app/api/routes/tours.py).

#### `POST /tour`

Returns general travel recommendations as formatted text.

Request:

```json
{
  "from_location": "Bangalore",
  "to_location": "Mysore",
  "interests": "history, food"
}
```

#### `POST /tour/options`

Returns grouped place suggestions in JSON:

- `high_priority`
- `mid_priority`
- `low_priority`

#### `POST /tour/itinerary`

Builds a day-by-day itinerary from selected places.

Request:

```json
{
  "from_location": "Bangalore",
  "to_location": "Mysore",
  "num_days": 3,
  "selected_places": ["Mysore Palace", "Chamundi Hills"]
}
```

### Error handling

The backend converts:

- validation/business rule failures to `400`
- service/LLM failures to `500`

Examples of rejected input:

- empty locations
- same origin and destination
- itinerary requests with no selected places

## Local development

### Prerequisites

- Node.js
- npm
- Python 3.11 recommended
- a Groq API key

### 1. Backend setup

From [backend](backend):

```powershell
py -3.11 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `GROQ_API_KEY` in `backend/.env`.

Run:

```powershell
uvicorn app.main:app --reload
```

Or use the helper script:

```powershell
.\start_backend.ps1
```

Backend default URL:

```text
http://localhost:8000
```

### 2. Frontend setup

From [FE/frontend-app](FE/frontend-app):

```powershell
npm install
npm run dev
```

Optional environment variable:

```text
VITE_API_URL=http://localhost:8000
```

Frontend default dev URL is usually:

```text
http://localhost:5173
```

## Deployment

The deployment notes in [DEPLOY_RENDER_VERCEL.md](DEPLOY_RENDER_VERCEL.md) match the current project structure.

### Render backend

- root directory: `backend`
- build command: `pip install -r requirements.txt`
- start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Required env vars:

- `GROQ_API_KEY`
- `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

Optional:

- `ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app`

### Vercel frontend

- root directory: `FE/frontend-app`
- framework preset: `Vite`
- build command: `npm run build`
- output directory: `dist`

Required env var:

- `VITE_API_URL=https://your-backend.onrender.com`

### Recommended deploy order

1. Deploy the backend on Render.
2. Copy the Render URL.
3. Set `VITE_API_URL` in Vercel.
4. Deploy the frontend on Vercel.
5. Copy the Vercel production URL.
6. Set `ALLOWED_ORIGINS` in Render and redeploy backend.

## Important implementation notes

- No database is configured.
- No authentication is implemented.
- The app stores only the latest itinerary in browser local storage.
- LLM output quality depends on the model response and prompt formatting.
- Options and itinerary endpoints expect valid JSON from the model; malformed model output is treated as a backend failure.
- The frontend contains some duplicate API concepts: typed Axios helpers exist, while the main planner currently calls the backend using `fetch`.

## Useful files

- [FE/frontend-app/src/components/Tg.tsx](FE/frontend-app/src/components/Tg.tsx) - main planner experience
- [FE/frontend-app/src/components/HistoryPage.tsx](FE/frontend-app/src/components/HistoryPage.tsx) - saved itinerary view
- [FE/frontend-app/src/services/history.ts](FE/frontend-app/src/services/history.ts) - local storage and download helpers
- [backend/app/api/routes/tours.py](backend/app/api/routes/tours.py) - API endpoints
- [backend/app/services/tour_service.py](backend/app/services/tour_service.py) - LLM prompt and response logic
- [backend/app/core/config.py](backend/app/core/config.py) - env-based configuration

## Summary

This project is a lightweight AI trip planner with:

- a React/Vite frontend for trip input, place selection, and itinerary display
- a FastAPI backend that orchestrates prompt-based travel planning with Groq
- local-only itinerary persistence
- a Vercel + Render deployment model
