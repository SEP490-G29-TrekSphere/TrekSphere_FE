import HomeCompanions from '@/features/home/components/HomeCompanions';
import HomeHero from '@/features/home/components/HomeHero';
import HomeRecommended from '@/features/home/components/HomeRecommended';
import HomeStories from '@/features/home/components/HomeStories';
import HomeTours from '@/features/home/components/HomeTours';
import { useAppStore } from '@/store/useAppStore';

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
