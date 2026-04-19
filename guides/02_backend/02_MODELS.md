# 02_MODELS.md

Dựa hoàn toàn trên spec của dự án, hãy viết toàn bộ SQLAlchemy models cho:

- User
- Category
- Project
- ProjectMember
- Paper
- PaperAuthor
- Notification

Yêu cầu:
1. Tách file theo:
   - app/models/base.py
   - app/models/user.py
   - app/models/category.py
   - app/models/project.py
   - app/models/paper.py
   - app/models/notification.py
   - app/models/association.py
   - app/models/__init__.py
2. Dùng relationship đầy đủ.
3. Có created_at và updated_at hợp lý.
4. Có enum trạng thái rõ ràng.
5. Có các unique constraint sau:
   - categories(type, name)
   - project_members(project_id, user_id)
   - paper_authors(paper_id, user_id)
6. users.email unique
7. users.staff_id và users.student_id unique nếu không null
8. papers.doi unique nếu không null
9. projects.code unique nếu không null
10. Import đầy đủ, code chạy được.
11. Không thêm field trái với spec.
12. Có các trường review_note, reviewed_by, reviewed_at cho project và paper theo contract.

Output theo từng file.