# TrekSphere Frontend

Dự án Frontend cho nền tảng TrekSphere, được xây dựng bằng React 19, TypeScript và Vite, hướng tới trải nghiệm người dùng mượt mà và giao diện hiện đại.

## Công nghệ sử dụng

- **Core**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4.
- **State Management**: Zustand (Global State) + React Query (Server State).
- **Form & Validation**: React Hook Form + Zod.
- **UI Architecture**: Tuân thủ chuẩn FSD (Feature-Sliced Design) và sử dụng bộ UI Kit với tiền tố `App` (AppButton, AppCard...).

## Cài đặt & Chạy dự án

1. Clone project và cài đặt thư viện:

   ```bash
   pnpm install
   # hoặc
   npm install
   ```

2. Chạy môi trường Development:
   ```bash
   npm run dev
   ```
   Dự án sẽ khởi chạy tại `http://localhost:5173`.

## Quy định & Tiêu chuẩn

Vui lòng đọc kỹ tài liệu [GUIDELINES.md](./GUIDELINES.md) để nắm rõ:

- Cấu trúc thư mục FSD.
- Cách đặt tên Component (Arrow function, tiền tố `App`).
- Chuẩn commit code (Conventional Commits).

## Liên kết API

- API Base URL hiện được cấu hình tại biến môi trường `VITE_API_URL` (mặc định: `http://localhost:3000/api`).
- Tầng giao tiếp API sử dụng `Axios` với interceptors được cấu hình sẵn tại `src/config/apiClient.ts`.
