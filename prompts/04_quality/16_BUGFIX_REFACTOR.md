# 16_BUGFIX_REFACTOR.md

Dựa trên kết quả review code, hãy sửa lỗi và refactor có kiểm soát.

Yêu cầu:
1. Không tự ý đổi use case.
2. Không tự ý đổi endpoint.
3. Không tự ý thay đổi DB schema ngoài spec.
4. Chỉ sửa:
   - lỗi import
   - lỗi schema
   - lỗi quyền
   - lỗi state transition
   - lỗi ORM/query
   - lỗi frontend gọi API sai
5. Nếu cần refactor, ưu tiên:
   - tách helper chung
   - giảm lặp code
   - làm rõ tên hàm
   - giữ nguyên hành vi nghiệp vụ
6. Mỗi patch phải ghi rõ:
   - file bị sửa
   - lỗi cũ
   - cách sửa
   - vì sao sửa như vậy
7. Output theo từng file đầy đủ, không chỉ diff ngắn.