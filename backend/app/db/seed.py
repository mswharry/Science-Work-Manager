from datetime import date, datetime, timezone

from sqlalchemy import select

from app.core.config import get_settings
from app.core.constants import CategoryType, EntityType, ProjectStatus, UserRole
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.category import Category
from app.models.classification import PaperClassificationGroup, PaperClassificationOption
from app.models.level import Level
from app.models.project import Project
from app.models.project_history import RegistrationHistory
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

def seed_demo_lecturers() -> None:
    lecturers = [
        {"email": "gv.anhtm@ptit.edu.vn", "full_name": "Tran Minh Anh", "staff_id": "GV001", "department": "An toan thong tin"},
        {"email": "gv.hoangnt@ptit.edu.vn", "full_name": "Nguyen Thu Hoang", "staff_id": "GV002", "department": "Mang va he thong"},
        {"email": "gv.lientt@ptit.edu.vn", "full_name": "Le Thi Lien", "staff_id": "GV003", "department": "Ky thuat phan mem"},
        {"email": "gv.minhpd@ptit.edu.vn", "full_name": "Pham Duc Minh", "staff_id": "GV004", "department": "Khoa hoc du lieu"},
        {"email": "gv.quanvh@ptit.edu.vn", "full_name": "Vo Hoang Quan", "staff_id": "GV005", "department": "An toan mang"},
        {"email": "gv.thaont@ptit.edu.vn", "full_name": "Nguyen Thi Thao", "staff_id": "GV006", "department": "Tri tue nhan tao"},
        {"email": "gv.ducnk@ptit.edu.vn", "full_name": "Nguyen Khanh Duc", "staff_id": "GV007", "department": "He thong thong tin"},
        {"email": "gv.huonglt@ptit.edu.vn", "full_name": "Le Thu Huong", "staff_id": "GV008", "department": "Cong nghe phan mem"},
    ]

    with SessionLocal() as db:
        for lecturer in lecturers:
            exists = db.scalar(select(User).where(User.email == lecturer["email"]))
            if exists:
                continue

            db.add(
                User(
                    email=lecturer["email"],
                    hashed_password=get_password_hash("Lecturer@123456"),
                    full_name=lecturer["full_name"],
                    role=UserRole.LECTURER,
                    is_active=True,
                    is_approved=True,
                    staff_id=lecturer["staff_id"],
                    department=lecturer["department"],
                )
            )

        db.commit()


def seed_sample_project_dossiers() -> None:
    with SessionLocal() as db:
        period = db.scalar(select(RegistrationPeriod).where(RegistrationPeriod.title == "Dot dang ky de tai mau 2026"))
        if not period:
            period = RegistrationPeriod(
                title="Dot dang ky de tai mau 2026",
                registration_start=date(2026, 5, 1),
                registration_end=date(2026, 6, 15),
                description="Dot dang ky mau phuc vu demo du lieu de tai.",
                requirements="Giang vien lap ho so voi ten de tai, danh muc, muc cap va tep de cuong.",
                is_open=True,
            )
            db.add(period)
            db.commit()
            period = db.scalar(select(RegistrationPeriod).where(RegistrationPeriod.title == "Dot dang ky de tai mau 2026"))

        project_categories = {
            "research": db.scalar(
                select(Category).where(Category.type == CategoryType.PROJECT_TYPE, Category.name == "Research Topic")
            ),
            "product": db.scalar(
                select(Category).where(Category.type == CategoryType.PROJECT_TYPE, Category.name == "Security Product")
            ),
        }
        levels = {
            "khoa": db.scalar(select(Level).where(Level.code == "cap_khoa")),
            "truong": db.scalar(select(Level).where(Level.code == "cap_truong")),
            "bo": db.scalar(select(Level).where(Level.code == "cap_bo")),
            "nha_nuoc": db.scalar(select(Level).where(Level.code == "cap_nha_nuoc")),
        }
        lecturers = list(
            db.scalars(
                select(User)
                .where(User.role == UserRole.LECTURER, User.is_active.is_(True), User.is_approved.is_(True))
                .order_by(User.id.asc())
            )
        )

        samples = [
            {
                "name": "He thong phat hien phishing da ngon ngu",
                "code": "DT-2026-001",
                "category": "research",
                "level": "khoa",
                "leader_index": 0,
                "budget": 120000000,
                "start_date": date(2026, 5, 10),
                "end_date": date(2026, 11, 30),
                "description": "Xay dung mo hinh nhan dien email va website phishing su dung NLP va machine learning.",
            },
            {
                "name": "Nen tang canh bao ro ri du lieu noi bo",
                "code": "DT-2026-002",
                "category": "product",
                "level": "truong",
                "leader_index": 1,
                "budget": 150000000,
                "start_date": date(2026, 5, 15),
                "end_date": date(2027, 1, 15),
                "description": "Xay dung dashboard phat hien ro ri du lieu va goi y canh bao theo muc do uu tien.",
            },
            {
                "name": "Kiem thu tu dong API cho dich vu web hoc tap",
                "code": "DT-2026-003",
                "category": "research",
                "level": "bo",
                "leader_index": 2,
                "budget": 180000000,
                "start_date": date(2026, 5, 20),
                "end_date": date(2027, 2, 28),
                "description": "Bo cong cu sinh test case va stress test cho cac API noi bo cua he thong.",
            },
            {
                "name": "Mo hinh phat hien bat thuong dang nhap",
                "code": "DT-2026-004",
                "category": "research",
                "level": "khoa",
                "leader_index": 3,
                "budget": 110000000,
                "start_date": date(2026, 5, 18),
                "end_date": date(2026, 12, 20),
                "description": "Phan tich hanh vi dang nhap de phat hien truy cap bat thuong tren tai khoan hoc vu.",
            },
            {
                "name": "Cong cu danh gia an toan cau hinh may chu",
                "code": "DT-2026-005",
                "category": "product",
                "level": "truong",
                "leader_index": 4,
                "budget": 200000000,
                "start_date": date(2026, 6, 1),
                "end_date": date(2027, 3, 31),
                "description": "Xay dung tien ich kiem tra cau hinh server, port mo va chinh sach mat khau.",
            },
            {
                "name": "Phat hien gian lan trong bai nop sinh vien",
                "code": "DT-2026-006",
                "category": "research",
                "level": "bo",
                "leader_index": 5,
                "budget": 175000000,
                "start_date": date(2026, 5, 22),
                "end_date": date(2027, 1, 30),
                "description": "So sanh van ban va mau cau truc de phat hien bai nop co dau hieu sao chep.",
            },
            {
                "name": "He thong quan ly minh chung nghien cuu so",
                "code": "DT-2026-007",
                "category": "product",
                "level": "nha_nuoc",
                "leader_index": 6,
                "budget": 250000000,
                "start_date": date(2026, 6, 5),
                "end_date": date(2027, 5, 31),
                "description": "Phat trien kho luu tru va truy vet minh chung nghien cuu cho cap khoa.",
            },
            {
                "name": "Ung dung theo doi tien do de tai theo tuan",
                "code": "DT-2026-008",
                "category": "research",
                "level": "khoa",
                "leader_index": 7,
                "budget": 98000000,
                "start_date": date(2026, 5, 25),
                "end_date": date(2026, 12, 15),
                "description": "Bang dieu khien theo doi tien do, de xuat canh bao va nhac viec cho nhom nghien cuu.",
            },
        ]

        for sample in samples:
            if db.scalar(select(Project).where(Project.code == sample["code"])) or db.scalar(
                select(Project).where(Project.name == sample["name"])
            ):
                continue

            leader = lecturers[sample["leader_index"] % len(lecturers)] if lecturers else None
            category = project_categories[sample["category"]]
            level = levels[sample["level"]]
            if not leader or not category or not level:
                continue

            project = Project(
                name=sample["name"],
                code=sample["code"],
                category_id=category.id,
                level_id=level.id,
                leader_id=leader.id,
                registration_period_id=period.id,
                budget=sample["budget"],
                start_date=sample["start_date"],
                end_date=sample["end_date"],
                status=ProjectStatus.PENDING,
                description=sample["description"],
                proposal_file=f"/uploads/projects/proposals/{sample['code'].lower()}.txt",
                final_report_file=None,
                submitted_at=datetime(2026, 5, 10, 9, 0, tzinfo=timezone.utc),
            )
            db.add(project)
            db.flush()
            db.add(
                RegistrationHistory(
                    project_id=project.id,
                    action="create",
                    previous_status=None,
                    new_status=ProjectStatus.PENDING.value,
                    detail="Ho so mau duoc tao de phuc vu demo du lieu.",
                    performed_by=leader.id,
                )
            )

        db.commit()


def run_seed() -> None:
    seed_admin()
    seed_categories()
    seed_levels()
    seed_paper_classifications()
    seed_registration_periods()
    seed_demo_lecturers()
    seed_sample_project_dossiers()


if __name__ == "__main__":
    run_seed()
    print("Seed data inserted successfully.")

