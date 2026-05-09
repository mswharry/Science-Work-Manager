from sqlalchemy import select

from app.core.config import get_settings
from app.core.constants import CategoryType, EntityType, UserRole
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.category import Category
from app.models.classification import PaperClassificationGroup, PaperClassificationOption
from app.models.level import Level
from app.models.registration_period import RegistrationPeriod
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


def seed_levels() -> None:
    project_levels = [
        ("cap_khoa", "Cấp khoa", EntityType.PROJECT, 1, 10),
        ("cap_truong", "Cấp trường", EntityType.PROJECT, 2, 20),
        ("cap_bo", "Cấp bộ", EntityType.PROJECT, 3, 30),
        ("cap_nha_nuoc", "Cấp nhà nước", EntityType.PROJECT, 4, 40),
    ]
    paper_levels = [
        ("hoi_nghi_trong_nuoc", "Hội nghị trong nước", EntityType.PAPER, 1, 10),
        ("hoi_nghi_quoc_te", "Hội nghị quốc tế", EntityType.PAPER, 2, 20),
        ("tap_chi_trong_nuoc", "Tạp chí trong nước", EntityType.PAPER, 3, 30),
        ("tap_chi_quoc_te", "Tạp chí quốc tế", EntityType.PAPER, 4, 40),
    ]

    with SessionLocal() as db:
        for code, name, entity_type, weight, points in project_levels:
            exists = db.scalar(
                select(Level).where(
                    Level.code == code,
                    Level.entity_type == entity_type,
                )
            )
            if not exists:
                db.add(
                    Level(
                        code=code,
                        name=name,
                        entity_type=entity_type,
                        weight=weight,
                        points=points,
                        is_active=True,
                    )
                )

        for code, name, entity_type, weight, points in paper_levels:
            exists = db.scalar(
                select(Level).where(
                    Level.code == code,
                    Level.entity_type == entity_type,
                )
            )
            if not exists:
                db.add(
                    Level(
                        code=code,
                        name=name,
                        entity_type=entity_type,
                        weight=weight,
                        points=points,
                        is_active=True,
                    )
                )
        db.commit()


def seed_paper_classifications() -> None:
    taxonomy = [
        {
            "code": "org_form",
            "name": "Hình thức tổ chức nghiên cứu",
            "description": "Phân biệt theo quy mô và mục đích tổ chức.",
            "options": [
                ("de_tai", "Đề tài"),
                ("du_an", "Dự án"),
                ("chuong_trinh", "Chương trình"),
                ("cong_trinh", "Công trình"),
            ],
        },
        {
            "code": "research_type",
            "name": "Loại hình nghiên cứu",
            "description": "Phân loại theo bản chất và mức độ ứng dụng của nghiên cứu.",
            "options": [
                ("co_ban", "Nghiên cứu cơ bản"),
                ("ung_dung", "Nghiên cứu ứng dụng"),
                ("trien_khai", "Nghiên cứu triển khai"),
                ("tham_do", "Nghiên cứu thăm dò"),
            ],
        },
        {
            "code": "research_goal",
            "name": "Chức năng/mục tiêu nghiên cứu",
            "description": "Phân loại theo mục tiêu nhận thức và đầu ra khoa học.",
            "options": [
                ("mo_ta", "Nghiên cứu mô tả"),
                ("giai_thich", "Nghiên cứu giải thích"),
                ("du_bao", "Nghiên cứu dự báo"),
                ("sang_tao", "Nghiên cứu sáng tạo"),
            ],
        },
        {
            "code": "theory_experiment",
            "name": "Tính chất lý thuyết - thực nghiệm",
            "description": "Phân loại theo mối quan hệ giữa lý thuyết và thực nghiệm.",
            "options": [
                ("ly_thuyet", "Thuần túy lý thuyết"),
                ("thuc_nghiem", "Thuần túy thực nghiệm"),
                ("ket_hop", "Kết hợp lý thuyết và thực nghiệm"),
            ],
        },
        {
            "code": "method",
            "name": "Phương pháp nghiên cứu",
            "description": "Phân loại theo phương pháp thu thập và phân tích dữ liệu.",
            "options": [
                ("dinh_tinh", "Nghiên cứu định tính"),
                ("dinh_luong", "Nghiên cứu định lượng"),
                ("hon_hop", "Nghiên cứu hỗn hợp"),
            ],
        },
        {
            "code": "field",
            "name": "Lĩnh vực nghiên cứu",
            "description": "Phân loại theo chuyên ngành khoa học.",
            "options": [
                ("tu_nhien", "Tự nhiên"),
                ("xa_hoi_nhan_van", "Xã hội - nhân văn"),
                ("giao_duc", "Giáo dục"),
                ("ky_thuat", "Kỹ thuật"),
                ("nong_lam_ngu", "Nông lâm ngư nghiệp"),
                ("y_duoc", "Y dược"),
                ("moi_truong", "Môi trường"),
            ],
        },
        {
            "code": "education_research",
            "name": "Loại hình nghiên cứu giáo dục",
            "description": "Các dạng nghiên cứu đặc thù trong lĩnh vực giáo dục.",
            "options": [
                ("danh_gia", "Nghiên cứu đánh giá"),
                ("hanh_dong", "Nghiên cứu hành động"),
                ("dinh_huong", "Nghiên cứu định hướng"),
            ],
        },
    ]

    with SessionLocal() as db:
        for group_order, group_item in enumerate(taxonomy, start=1):
            group = db.scalar(
                select(PaperClassificationGroup).where(PaperClassificationGroup.code == group_item["code"])
            )

            if not group:
                group = PaperClassificationGroup(
                    code=group_item["code"],
                    name=group_item["name"],
                    description=group_item["description"],
                    display_order=group_order,
                    is_active=True,
                )
                db.add(group)
                db.flush()

            for option_order, (option_code, option_name) in enumerate(group_item["options"], start=1):
                exists = db.scalar(
                    select(PaperClassificationOption).where(
                        PaperClassificationOption.group_id == group.id,
                        PaperClassificationOption.code == option_code,
                    )
                )
                if exists:
                    continue

                db.add(
                    PaperClassificationOption(
                        group_id=group.id,
                        code=option_code,
                        name=option_name,
                        display_order=option_order,
                        is_active=True,
                    )
                )

        db.commit()


def seed_registration_periods() -> None:
    with SessionLocal() as db:
        exists = db.scalar(select(RegistrationPeriod))
        if not exists:
            db.add(
                RegistrationPeriod(
                    title="Đợt đăng ký đề tài học kỳ hiện tại",
                    description="Đợt đăng ký dành cho giảng viên tạo hồ sơ đề tài nghiên cứu khoa học.",
                    requirements="Giảng viên đã đăng nhập, hồ sơ cần có đầy đủ thông tin và file đính kèm.",
                    is_open=True,
                )
            )
            db.commit()


def run_seed() -> None:
    seed_admin()
    seed_categories()
    seed_levels()
    seed_paper_classifications()
    seed_registration_periods()


if __name__ == "__main__":
    run_seed()
    print("Seed data inserted successfully.")

