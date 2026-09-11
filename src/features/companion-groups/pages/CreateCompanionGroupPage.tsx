import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { CreateMatchingGroupForm } from '../components/create/CreateMatchingGroupForm';

export default function CreateCompanionGroupPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      <div className="relative grid w-full max-w-5xl grid-cols-1 items-stretch gap-8 overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl lg:grid-cols-12">
        <section className="flex min-h-[280px] flex-col justify-end bg-primary p-8 text-primary-foreground lg:col-span-5 lg:min-h-[560px]">
          <h1 className="font-extrabold text-3xl leading-tight tracking-tight">
            Kết nối đam mê,
            <br />
            Chia sẻ hành trình.
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-sm leading-relaxed">
            Tạo nhóm để tìm kiếm những người bạn đồng hành chung chí hướng cho chuyến đi sắp tới của
            bạn.
          </p>
        </section>
        <section className="flex min-w-0 flex-col lg:col-span-7">
          <header className="border-border border-b px-6 py-5">
            <h2 className="font-black text-2xl text-foreground tracking-tight sm:text-3xl">
              Tạo Nhóm Đồng Hành
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Điền thông tin bên dưới để bắt đầu tìm kiếm đồng đội.
            </p>
          </header>
          <CreateMatchingGroupForm onCancel={() => navigate(PATHS.GROUPS)} />
        </section>
      </div>
    </div>
  );
}
