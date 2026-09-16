import HomeCompanions from '@/features/home/components/HomeCompanions';
import HomeHero from '@/features/home/components/HomeHero';
import HomeRecommended from '@/features/home/components/HomeRecommended';
import HomeStories from '@/features/home/components/HomeStories';
import HomeTours from '@/features/home/components/HomeTours';
import { useAppStore } from '@/store/useAppStore';

/**
 * Home — landing page dùng chung cho cả Guest lẫn Trekker đã đăng nhập
 * (route `/` không tách riêng theo role). Phần "Gợi ý dành cho bạn" chỉ
 * render khi có `user` — Guest không thấy section này.
 *
 * Header/Footer được render bởi PublicLayout ở routes/AppRoutes.
 */
export default function Home() {
  const user = useAppStore((state) => state.user);

  return (
    <>
      <HomeHero />
      {user && <HomeRecommended />}
      <HomeTours />
      <HomeCompanions />
      <HomeStories />
    </>
  );
}
