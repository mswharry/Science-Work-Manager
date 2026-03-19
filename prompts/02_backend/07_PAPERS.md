# 07_PAPERS.md

Dựa trên spec, hãy viết đầy đủ:

- app/services/paper_service.py
- app/api/v1/endpoints/papers.py

Phải hỗ trợ các endpoint:
- POST /papers
- GET /papers
- GET /papers/{paper_id}
- PUT /papers/{paper_id}
- DELETE /papers/{paper_id}
- PUT /admin/papers/{paper_id}/approve
- POST /papers/{paper_id}/authors

Rule bắt buộc:
1. Khi tạo paper:
   - status mặc định = pending
   - người tạo tự động là author đầu tiên
   - author_order = 1
2. GET /papers:
   - admin xem tất cả
   - user thường xem paper approved và paper của mình
   - hỗ trợ filter: year, category_id, status, mine
3. Chỉ người khai báo hoặc tác giả nội bộ được sửa/xóa.
4. Chỉ sửa/xóa khi status là pending hoặc rejected.
5. Nếu paper rejected được sửa, phải chuyển lại về pending.
6. Endpoint /admin/papers/{paper_id}/approve vẫn giữ nguyên đường dẫn, nhưng request body phải hỗ trợ:
   - action = approve hoặc reject
   - note
7. Chỉ admin mới được duyệt/từ chối paper.
8. POST /papers/{paper_id}/authors:
   - người khai báo paper hoặc admin được thêm đồng tác giả
   - không cho thêm trùng user
   - hỗ trợ author_order và is_corresponding
9. Dùng service layer cho toàn bộ nghiệp vụ.
10. Code rõ ràng, phù hợp cho sinh viên đọc.

Output theo từng file.