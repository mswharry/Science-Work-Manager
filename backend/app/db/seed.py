from sqlalchemy import select

from app.core.config import get_settings
from app.core.constants import CategoryType, UserRole
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.category import Category
from app.models.user import User


def seed_admin() -> None:
    settings = get_settings()
    with SessionLocal() as db:
        existing_admin = db.scalar(select(User).where(User.email == settings.ADMIN_EMAIL))
        if not existing_admin:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name=settings.ADMIN_FULL_NAME,
                role=UserRole.ADMIN,
                is_active=True,
                is_approved=True,
                department=settings.ADMIN_DEPARTMENT,
            )
            db.add(admin_user)
            db.commit()


def seed_categories() -> None:
    default_project_categories = [
        ("Research Topic", "General research project category", 10),
        ("Security Product", "Applied product-oriented topic", 15),
    ]
    default_paper_categories = [
        ("Journal", "Academic journal publication", 20),
        ("Conference", "Conference proceeding publication", 15),
    ]

    with SessionLocal() as db:
        for name, description, points in default_project_categories:
            exists = db.scalar(
                select(Category).where(
                    Category.type == CategoryType.PROJECT_TYPE,
                    Category.name == name,
                )
            )
            if not exists:
                db.add(
                    Category(
                        name=name,
                        type=CategoryType.PROJECT_TYPE,
                        description=description,
                        points=points,
                    )
                )

        for name, description, points in default_paper_categories:
            exists = db.scalar(
                select(Category).where(
                    Category.type == CategoryType.PAPER_TYPE,
                    Category.name == name,
                )
            )
            if not exists:
                db.add(
                    Category(
                        name=name,
                        type=CategoryType.PAPER_TYPE,
                        description=description,
                        points=points,
                    )
                )
        db.commit()


def run_seed() -> None:
    seed_admin()
    seed_categories()


if __name__ == "__main__":
    run_seed()
    print("Seed data inserted successfully.")

