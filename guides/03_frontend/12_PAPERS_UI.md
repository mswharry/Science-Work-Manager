# 12_PAPERS_UI.md

Dựa trên API contract của dự án, hãy tạo giao diện quản lý bài báo gồm:

- PaperList
- PaperDetail
- PaperForm
- PapersPage

Yêu cầu:
1. Hỗ trợ:
   - xem danh sách bài báo
   - xem chi tiết bài báo
   - tạo bài báo mới
   - sửa bài báo của mình khi hợp lệ
   - xóa bài báo của mình khi hợp lệ
   - thêm đồng tác giả cơ bản nếu có thể
2. Route đề xuất:
   - /papers
   - /papers/new
   - /papers/:id
   - /papers/:id/edit
3. Kết nối với paperService.js
4. Hiển thị các trường:
   - title
   - category
   - journal_name
   - publication_year
   - volume
   - issue
   - pages
   - doi
   - status
5. UI tối giản, dễ demo.
6. Output theo từng file.