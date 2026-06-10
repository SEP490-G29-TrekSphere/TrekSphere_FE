# TrekSphere Frontend Guidelines

Tài liệu này quy định các nguyên tắc, tiêu chuẩn lập trình và cấu trúc kiến trúc của dự án TrekSphere Frontend nhằm đảm bảo code dễ bảo trì, dễ mở rộng và đồng nhất giữa các lập trình viên trong team.

## 1. Kiến trúc thư mục (FSD - Feature-Sliced Design)

Dự án áp dụng một biến thể của FSD để phân chia cấu trúc rõ ràng:

- **`src/app/`**: (Nếu có) Chứa các cấu hình khởi tạo của toàn ứng dụng (Provider, Store gốc).
- **`src/features/`**: Chứa các tính năng chính của ứng dụng (VD: `auth`, `dashboard`). Mỗi tính năng hoạt động độc lập và chứa UI, logic cục bộ.
- **`src/shared/ui/`**: Chứa các UI Components dùng chung toàn dự án (Buttons, Inputs, Cards...).
- **`src/services/`**: Tầng giao tiếp với Backend. Tuyệt đối **không** gọi Axios trực tiếp trong Component. Phải gọi thông qua các file Service (VD: `authService.ts`).
- **`src/validations/`**: Chứa các Schema dùng để validate form (Zod).
- **`src/utils/`**: Các hàm tiện ích dùng chung (VD: `storage.ts`, format ngày tháng).
- **`src/store/`**: Quản lý State toàn cục bằng Zustand (`useAppStore.ts`, `useToastStore.ts`).

## 2. Tiêu chuẩn viết Code (Coding Rules)

### Component & Hàm (Arrow Functions)

Tất cả các React Components và Hàm tiện ích đều phải sử dụng cú pháp **Arrow Function** để đảm bảo tính đồng nhất.

```tsx
// ✅ ĐÚNG
export const Dashboard: React.FC = () => { ... }

// ❌ SAI
export default function Dashboard() { ... }
```

### Đặt tên Component UI (Tiền tố `App`)

Để tránh xung đột với các thẻ HTML mặc định và phân biệt rõ Component nội bộ:

- Mọi UI Component chia sẻ trong `src/shared/ui/` phải bắt đầu bằng chữ **`App`**.
- Ví dụ: `<AppButton>`, `<AppTable>`, `<AppCard>`.

### Quản lý Form & Validation

- **Luôn luôn** sử dụng `react-hook-form` kết hợp với `zod` để quản lý và validate form.
- Schema của form phải được khai báo bằng Zod và tách riêng ra thư mục `validations/` (hoặc trong thư mục `schemas` của từng feature).
- Sử dụng `<AppFormInput>` làm Component chuẩn hóa cho các thẻ Input trong Form.

## 3. Tiêu chuẩn Commit (Commit Rules)

Dự án áp dụng chuẩn **Conventional Commits**.

**Cấu trúc:**

```
<type>(<scope>): <subject>
```

**Các `type` cho phép:**

- `feat`: Thêm tính năng mới (Feature)
- `fix`: Sửa lỗi (Bug fix)
- `refactor`: Tái cấu trúc code (Không đổi logic chức năng, chỉ làm code tốt hơn)
- `style`: Định dạng code (Format, khoảng trắng, xóa comment...)
- `docs`: Cập nhật tài liệu (README, CHANGELOG...)
- `chore`: Các thay đổi cấu hình, build tool, dependencies
- `test`: Thêm hoặc sửa Unit test / E2E test

**Ví dụ Commit:**

- `feat(auth): thêm màn hình đăng nhập và tích hợp API login`
- `refactor(ui): đồng bộ tiền tố App cho toàn bộ thư viện UI`
- `fix(dashboard): sửa lỗi không hiển thị danh sách hóa đơn`
- `docs: cập nhật hướng dẫn cài đặt trong README`

## 4. Quản lý trạng thái và API (State & API)

- **Local State**: Dùng `useState` cho các state nhỏ gọn trong component.
- **Global State**: Dùng `Zustand` (`src/store/`) cho dữ liệu cần chia sẻ giữa nhiều component (Auth, Toast, Loading).
- **Server State**: Sử dụng `@tanstack/react-query` để lấy và cache dữ liệu từ API, kết hợp với các service trong `src/services/`.
