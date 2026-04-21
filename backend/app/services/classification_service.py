from __future__ import annotations

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from app.models.classification import PaperClassificationGroup, PaperClassificationOption


DEFAULT_TAXONOMY = [
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


def _ensure_default_taxonomy(db: Session) -> None:
    exists = db.scalar(select(PaperClassificationGroup.id).limit(1))
    if exists:
        return

    for group_order, group_item in enumerate(DEFAULT_TAXONOMY, start=1):
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


def list_active_paper_classification_groups(db: Session) -> list[PaperClassificationGroup]:
    _ensure_default_taxonomy(db)

    stmt: Select[tuple[PaperClassificationGroup]] = (
        select(PaperClassificationGroup)
        .where(PaperClassificationGroup.is_active == True)
        .options(selectinload(PaperClassificationGroup.options))
        .order_by(PaperClassificationGroup.display_order.asc(), PaperClassificationGroup.id.asc())
    )

    groups = list(db.scalars(stmt).unique())
    for group in groups:
        group.options = [option for option in group.options if option.is_active]
        group.options.sort(key=lambda item: (item.display_order, item.id))
    return groups
