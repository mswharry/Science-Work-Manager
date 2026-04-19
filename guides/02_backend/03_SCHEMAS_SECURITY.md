# 03_SCHEMAS_SECURITY.md

Dựa trên models và spec của dự án, hãy viết các Pydantic schemas cho:

- auth.py
- user.py
- category.py
- project.py
- paper.py
- notification.py
- common.py nếu cần

Yêu cầu:
1. Tách rõ các nhóm schema:
   - Create
   - Update
   - Out
   - ReviewRequest
   - ApproveUserRequest nếu cần
   - AddAuthorRequest
2. Dùng phong cách Pydantic v2.
3. response schema không được lộ hashed_password.
4. ProjectReviewRequest và PaperReviewRequest phải có:
   - action
   - note
5. Các schema Out phải có `model_config = {"from_attributes": True}` hoặc tương đương.
6. Bảo đảm schema khớp với:
   - API_CONTRACT.md
   - DB_SCHEMA.md
7. Đồng thời viết hoặc cập nhật:
   - app/core/security.py
   - app/core/constants.py
   nếu cần để khớp với schema và state.

Output theo từng file.