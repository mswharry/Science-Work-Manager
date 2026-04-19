# DB_SCHEMA.md

Tài liệu này mô tả **schema đang chạy thực tế** theo code hiện tại.

## users
- id
- email (unique)
- hashed_password
- full_name
- role
- is_active
- is_approved
- staff_id (unique, nullable)
- student_id (unique, nullable)
- department
- created_at
- updated_at

## categories
- id
- name
- type
- description
- points
- created_at
- updated_at
- unique(type, name)

## projects
- id
- name
- code (unique, nullable)
- category_id
- leader_id
- budget
- start_date
- end_date
- status
- description
- proposal_file
- final_report_file
- review_note
- reviewed_by
- reviewed_at
- completion_requested (default false)
- completion_requested_at
- completion_requested_by
- created_at
- updated_at

## project_members
- id
- project_id
- user_id
- role_in_project
- created_at
- updated_at
- unique(project_id, user_id)

## papers
- id
- title
- category_id
- created_by (nullable)
- journal_name
- publication_year
- volume
- issue
- pages
- doi (unique, nullable)
- status
- file_url
- supervisor_lecturer_id (nullable)
- supervisor_full_name (nullable)
- supervisor_email (nullable)
- supervisor_staff_id (nullable)
- supervisor_department (nullable)
- review_note
- reviewed_by
- reviewed_at
- created_at
- updated_at

## paper_authors
- id
- paper_id
- user_id
- author_order
- is_corresponding
- created_at
- updated_at
- unique(paper_id, user_id)

## notifications
- id
- title
- content
- target_role
- created_by
- is_active
- created_at
- updated_at

---

## Planned Expansion
Schema mở rộng cho kế hoạch năm học, phân cấp, template, task/progress/report
được mô tả tại:

- `FEATURE_EXPANSION_2026.md`