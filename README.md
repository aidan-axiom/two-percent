# 2%

Cook what you have: build an inventory of what's in your kitchen, then get
AI-generated recipe suggestions based on what you have on hand.

- **Frontend**: React + Vite + TypeScript
- **Backend**: FastAPI (Python), SQLAlchemy 2.0
- **Database**: PostgreSQL
- **AI**: Google Gemini (`gemini-2.5-flash`) or Claude (`claude-opus-4-8`),
  both with schema-validated structured outputs

## Features

- User accounts (register / login, httpOnly-cookie sessions)
- Per-user ingredient inventory with quantities and units
- AI recipe suggestions: 3–5 recipes that maximize your ingredients, with
  used/missing ingredient lists, steps, and time estimates
- Save recipes you like to your own recipe book
- Provider toggle: the server's `GEMINI_API_KEY` (free tier) powers everyone by
  default; any user can bring their own Gemini or Claude key in Settings
  (stored encrypted, used only for their requests)

## Setup

### 1. Database

With Docker:

```bash
docker compose up -d db
```

Or with Homebrew (what this repo was developed against):

```bash
brew install postgresql@16
brew services start postgresql@16
/opt/homebrew/opt/postgresql@16/bin/psql -d postgres \
  -c "CREATE ROLE chef WITH LOGIN PASSWORD 'chef' CREATEDB;" \
  -c "CREATE DATABASE chef OWNER chef;"
```

Either way the app connects to `postgresql://chef:chef@localhost:5432/chef`.

### 2. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit .env:
                       #   GEMINI_API_KEY=<free key from aistudio.google.com/apikey>
                       #     (the app-wide default provider)
                       #   ANTHROPIC_API_KEY=<optional fallback, console.anthropic.com>
                       #   SECRET_KEY=<any long random string>
uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project layout

```
backend/app/
  main.py            FastAPI app, CORS, table creation on startup
  config.py          settings from backend/.env
  database.py        engine + session dependency
  models.py          User, Ingredient, SavedRecipe
  schemas.py         request/response + Claude output schemas
  auth.py            bcrypt hashing, JWT cookie, get_current_user
  routers/           auth, ingredients, suggestions, recipes
  services/claude.py the Claude structured-output call
frontend/src/
  api.ts             fetch wrapper (cookie auth, long timeout for suggestions)
  AuthContext.tsx    current-user state
  components/        auth form, kitchen, suggestions, saved recipes
```

## Notes

- Suggestions use fast models on both providers (`gemini-2.5-flash`,
  `claude-haiku-4-5`) and usually return in a few seconds; the client timeout
  is generous (4 minutes) as a safety margin.
- Tables are created automatically on backend startup (`create_all`). If the
  schema evolves after you have real data, switch to Alembic migrations.
