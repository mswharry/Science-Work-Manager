# Science-Work-Manager
BTL Web hệ thống quản lý hoạt động nghiên cứu khoa học của khoa An toàn thông tin PTIT

## Backend (Thành viên 1)
```bash
cd backend
py -3.13 -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
python -m app.db.init_db
python -m app.db.seed
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

