# 01_BACKEND_SKELETON.md

Dựa hoàn toàn trên:
- PROJECT_BRIEF.md
- USECASE_SPEC.md
- API_CONTRACT.md
- DB_SCHEMA.md
- STATE_RULES.md
- CODE_CONVENTIONS.md

Hãy tạo skeleton backend FastAPI với cấu trúc:

backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── constants.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py
│   │           ├── users.py
│   │           ├── categories.py
│   │           ├── projects.py
│   │           ├── papers.py
│   │           ├── notifications.py
│   │           └── statistics.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── project.py
│   │   ├── paper.py
│   │   ├── notification.py
│   │   └── association.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── project.py
│   │   ├── paper.py
│   │   ├── notification.py
│   │   └── common.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── category_service.py
│   │   ├── project_service.py
│   │   ├── paper_service.py
│   │   ├── notification_service.py
│   │   └── statistics_service.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── init_db.py
│   │   └── seed.py
│   └── utils/
│       ├── __init__.py
│       ├── validators.py
│       └── file_upload.py
├── requirements.txt
├── .env.example
└── README.md

Yêu cầu:
1. Viết đầy đủ code cho:
   - main.py
   - core/config.py
   - core/database.py
   - core/security.py
   - api/deps.py
   - api/v1/api.py
   - requirements.txt
   - .env.example
2. Các file khác có thể tạo skeleton import-ready nếu chưa triển khai.
3. Dùng:
   - FastAPI
   - SQLAlchemy
   - Pydantic
   - python-jose
   - passlib[bcrypt]
4. Database mặc định là SQLite.
5. SQLite phải có check_same_thread=False.
6. JWT subject là user.id dạng string.
7. Output theo từng file, ghi rõ đường dẫn file.
8. Không để TODO, không để giả mã.