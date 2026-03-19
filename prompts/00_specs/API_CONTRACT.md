# API_CONTRACT.md

## Base URL
`/api/v1`

---

## 1. Auth

### POST /auth/register
Request:
```json
{
  "email": "user@example.com",
  "password": "123456",
  "full_name": "Nguyen Van A",
  "role": "student",
  "student_id": "AT220001",
  "staff_id": null,
  "department": "ATTT K16"
}
```
Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Nguyen Van A",
  "role": "student",
  "is_active": true,
  "is_approved": true
}
```
### POST /auth/login

Request:
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
Response:
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```
### GET /users/me

Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Nguyen Van A",
  "role": "student",
  "is_active": true,
  "is_approved": true
}
```
## 2. Users Admin
### GET /admin/users

Query params:
- role
- is_active
- is_approved

### PUT /admin/users/{user_id}/approve

Request:
```json
{
  "is_approved": true,
  "role": "lecturer"
}
PUT /admin/users/{user_id}/toggle-block
```
Response:
```json
{
  "message": "User status updated"
}
```
## 3. Projects
### POST /projects

Request:
```json
{
  "name": "Nghiên cứu ứng dụng AI trong ATTT",
  "category_id": 1,
  "budget": 20,
  "start_date": "2026-03-01",
  "end_date": "2026-12-30",
  "description": "Mô tả đề tài"
}
```
### GET /projects

Query params:
- status
- year
- keyword
- mine=true/false

### GET /projects/{project_id}
### PUT /projects/{project_id}

Request: partial update

### DELETE /projects/{project_id}
### PUT /admin/projects/{project_id}/review

Request:
```json
{
  "action": "approve",
  "note": "Đề tài hợp lệ"
}
```
### PUT /admin/projects/{project_id}/complete

Response:
```json
{
  "message": "Project completed successfully"
}
```
## 4. Papers
### POST /papers

Request:
```json
{
  "title": "A Study on Network Security",
  "category_id": 2,
  "journal_name": "Journal of Cyber Security",
  "publication_year": 2026,
  "volume": "12",
  "issue": "3",
  "pages": "100-110",
  "doi": "10.xxxx/abcd"
}
```
### GET /papers

Query params:

- year

- category_id

- status

- mine=true/false

### GET /papers/{paper_id}
### PUT /papers/{paper_id}
### DELETE /papers/{paper_id}
### PUT /admin/papers/{paper_id}/approve

Request:
```json
{
  "action": "reject",
  "note": "Thiếu minh chứng bài báo"
}
```
### POST /papers/{paper_id}/authors

Request:
```json
{
  "user_id": 5,
  "author_order": 2,
  "is_corresponding": false
}
```
## 5. Categories
Project Types

- GET /admin/categories/project-types

- POST /admin/categories/project-types

- PUT /admin/categories/project-types/{id}

- DELETE /admin/categories/project-types/{id}

Paper Types

- GET /admin/categories/paper-types

- POST /admin/categories/paper-types

- PUT /admin/categories/paper-types/{id}

- DELETE /admin/categories/paper-types/{id}

## 6. Notifications
### POST /admin/notifications

Request:
```json
{
  "title": "Thông báo mới",
  "content": "Nội dung thông báo",
  "target_role": "lecturer"
}
```
### GET /notifications
## 7. Statistics
##GET /admin/statistics/dashboard

Response gồm:

- tổng users

- tổng projects

- tổng papers

- projects theo status

- papers theo status

- số lượng theo năm

### GET /statistics/top-lecturers

Response:
```json

{
  "lecturer_id": 2,
  "full_name": "Tran Van B",
  "paper_count": 5
}
```
