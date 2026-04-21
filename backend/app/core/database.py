from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.models.base import Base

settings = get_settings()

connect_args: dict[str, bool] = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(settings.DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


RUNTIME_MIGRATIONS = {
    "papers": {
        "created_by": "INTEGER",
        "level_id": "INTEGER",
        "supervisor_lecturer_id": "INTEGER",
        "supervisor_full_name": "VARCHAR(255)",
        "supervisor_email": "VARCHAR(255)",
        "supervisor_staff_id": "VARCHAR(50)",
        "supervisor_department": "VARCHAR(255)",
    },
    "projects": {
        "level_id": "INTEGER",
        "completion_requested": "BOOLEAN DEFAULT 0",
        "completion_requested_at": "DATETIME",
        "completion_requested_by": "INTEGER",
    },
}


def ensure_runtime_schema() -> None:
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_tables = set(inspector.get_table_names())

        for table_name, columns in RUNTIME_MIGRATIONS.items():
            if table_name not in existing_tables:
                continue

            existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
            for column_name, column_type in columns.items():
                if column_name in existing_columns:
                    continue
                connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))
                existing_columns.add(column_name)


def create_all_tables() -> None:
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    ensure_runtime_schema()
