# 00_LOAD_CONTEXT.md

Tôi sẽ cung cấp cho bạn toàn bộ các file đặc tả của dự án sau:

1. PROJECT_BRIEF.md
2. USECASE_SPEC.md
3. API_CONTRACT.md
4. DB_SCHEMA.md
5. STATE_RULES.md
6. CODE_CONVENTIONS.md
7. TEAM_WORKFLOW.md

Hãy xem các file này là nguồn sự thật duy nhất của dự án.

Các nguyên tắc bắt buộc:
1. Không được tự ý thêm hoặc bớt use case.
2. Không được đổi tên endpoint.
3. Không được thay đổi logic trạng thái nếu không có chỉ định mới.
4. Public register không cho role = admin.
5. Lecturer mới đăng ký cần admin duyệt.
6. Project status gồm: pending, approved, rejected, completed.
7. Paper status gồm: pending, approved, rejected.
8. Khi project hoặc paper bị rejected và được sửa, phải chuyển lại về pending.
9. Categories unique theo (type, name).
10. project_members và paper_authors unique theo cặp khóa ngoại.
11. Business logic phải đặt ở service layer.
12. Output code theo từng file, import đầy đủ, không TODO.

Bây giờ hãy:
- đọc và tóm tắt lại phạm vi dự án,
- vai trò người dùng,
- danh sách module,
- các state rules,
- các ràng buộc quan trọng nhất cần giữ khi code.

Chỉ sau khi tóm tắt xong mới bắt đầu generate code ở prompt tiếp theo.