# 09_INIT_DB_SEED.md

Dựa trên spec, hãy viết đầy đủ:

- app/db/init_db.py
- app/db/seed.py

Yêu cầu:
1. init_db.py phải tạo được toàn bộ bảng từ models.
2. seed.py phải:
   - tạo 1 admin mặc định từ biến môi trường
   - tạo sẵn một số category mẫu cho project_type
   - tạo sẵn một số category mẫu cho paper_type
3. Không tạo trùng dữ liệu nếu seed nhiều lần.
4. Có thể chạy trực tiếp bằng Python.
5. Đồng thời cập nhật README.md phần backend setup nếu cần.
6. Output theo từng file.