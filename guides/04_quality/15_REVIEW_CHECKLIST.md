# 15_REVIEW_CHECKLIST.md

Hãy review toàn bộ code của dự án theo checklist sau.
Bám tuyệt đối vào spec đã cung cấp.

## Checklist bắt buộc

### A. Kiến trúc
1. Có đúng tách lớp router -> service -> model không?
2. Business logic có bị nhét vào router không?
3. Có circular import không?

### B. Authentication & Authorization
4. Public register có chặn role=admin không?
5. Lecturer chưa approve có bị chặn login không?
6. User bị block có bị chặn login không?
7. JWT sub có đúng là string(user.id) không?
8. Có endpoint nào thiếu kiểm tra quyền không?

### C. Use case & endpoint
9. Có tự ý thêm use case không?
10. Có tự ý đổi tên endpoint không?
11. Các endpoint có khớp API_CONTRACT.md không?

### D. State rules
12. Project status có đúng:
   - pending
   - approved
   - rejected
   - completed
13. Paper status có đúng:
   - pending
   - approved
   - rejected
14. rejected -> pending khi sửa có được xử lý đúng không?
15. completed project có bị cho sửa/xóa trái rule không?

### E. Database
16. categories có unique(type, name) không?
17. project_members có unique(project_id, user_id) không?
18. paper_authors có unique(paper_id, user_id) không?
19. created_at / updated_at có hợp lý không?
20. relationship có đủ back_populates hoặc tương đương không?

### F. Schema
21. Response schema có lộ hashed_password không?
22. Schema request/response có khớp model và contract không?
23. ProjectReviewRequest và PaperReviewRequest có action/note không?

### G. Frontend
24. Token có được gắn tự động qua axios interceptor không?
25. ProtectedRoute có hoạt động đúng không?
26. UI có đang gọi đúng endpoint không?
27. Role-based rendering có hợp lý không?

### H. Chất lượng code
28. Có import thiếu không?
29. Có TODO/placeholder không?
30. Có đoạn code nào quá rối, nên refactor không?

## Format trả lời
Trả lời theo đúng format:
1. Lỗi nghiêm trọng
2. Lỗi trung bình
3. Lỗi nhỏ
4. Patch đề xuất
5. File cần refactor trước