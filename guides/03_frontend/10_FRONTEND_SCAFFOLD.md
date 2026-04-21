# 10_FRONTEND_SCAFFOLD.md

Dựa hoàn toàn trên spec của dự án, hãy tạo frontend React với Vite.

Yêu cầu:
1. Dùng:
   - React
   - Vite
   - react-router-dom
   - axios
2. Tạo cấu trúc:

frontend/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── app/
    │   └── router.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── ProjectsPage.jsx
    │   ├── PapersPage.jsx
    │   ├── AdminPage.jsx
    │   └── ProfilePage.jsx
    ├── components/
    │   └── common/
    │       ├── ProtectedRoute.jsx
    │       ├── Layout.jsx
    │       └── Navbar.jsx
    ├── services/
    │   ├── api.js
    │   ├── authService.js
    │   ├── projectService.js
    │   ├── paperService.js
    │   ├── userService.js
    │   ├── notificationService.js
    │   └── statisticsService.js
    ├── contexts/
    │   └── AuthContext.jsx
    └── utils/
        └── constants.js

3. Viết đầy đủ code cho:
   - axios instance
   - AuthContext
   - ProtectedRoute
   - router
   - LoginPage
   - RegisterPage
   - HomePage
   - ProfilePage
4. UI tối giản, ưu tiên chạy được.
5. Token lưu localStorage.
6. Axios interceptor tự gắn Authorization Bearer token.
7. Không làm UI quá phức tạp.
8. Output theo từng file.