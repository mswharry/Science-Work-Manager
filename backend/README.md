# Backend - Science Work Manager

## Python version
- Required: `Python 3.13`
- On Windows, use: `py -3.13`

## 1. Setup
```bash
cd backend
py -3.13 -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

## 2. Init database and seed data
```bash
python -m app.db.init_db
python -m app.db.seed
```

## 3. Run API
```bash
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

## 4. Alembic
```bash
alembic revision --autogenerate -m "init schema"
alembic upgrade head
```

