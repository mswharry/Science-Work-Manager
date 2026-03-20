from app.core.database import create_all_tables


def init_db() -> None:
    create_all_tables()


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully.")

