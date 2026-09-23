import { ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';

export function MatchingGroupDiscoveryHero() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);

  return (
    <section className="relative h-[350px] w-full sm:h-[450px]">
      <img
        src="/image2.jpg"
        alt="Tìm Bạn Đồng Hành"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="mb-4 font-bold text-3xl text-white sm:text-5xl lg:text-6xl">
          Tìm Bạn Đồng Hành
        </h1>
        <p className="mb-6 max-w-2xl text-base text-white/90 sm:text-lg">
          Kết nối với những người cùng đam mê để chinh phục những cung đường huyền thoại.
        </p>
        <button
          type="button"
          onClick={() => navigate(user ? PATHS.TREKKER_MY_GROUPS : PATHS.LOGIN)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-sm text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
        >
          <Users className="h-4 w-4" />
          <span>Quản lý nhóm của tôi</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
