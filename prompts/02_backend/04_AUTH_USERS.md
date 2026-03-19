# 04_AUTH_USERS.md

Dựa trên toàn bộ spec, hãy viết đầy đủ:

- app/services/auth_service.py
- app/services/user_service.py
- app/api/v1/endpoints/auth.py
- app/api/v1/endpoints/users.py

Phải hỗ trợ các endpoint:
- POST /auth/register
- POST /auth/login
- GET /users/me
- GET /admin/users
- PUT /admin/users/{user_id}/approve
- PUT /admin/users/{user_id}/toggle-block

Rule bắt buộc:
1. Public register chỉ cho role = student hoặc lecturer.
2. Không cho self-register admin.
3. student có thể được approved ngay.
4. lecturer mới đăng ký phải is_approved = false.
5. lecturer chưa duyệt không được login đầy đủ.
6. user bị khóa is_active = false thì không được login.
7. approve user chỉ cho role student hoặc lecturer.
8. Không dùng endpoint approve để tạo admin.
9. Danh sách users hỗ trợ filter:
   - role
   - is_active
   - is_approved
10. Dùng bcrypt hash password.
11. Tạo JWT với sub = string(user.id).
12. Code phải rõ ràng, phù hợp cho sinh viên đọc.

Output theo từng file.