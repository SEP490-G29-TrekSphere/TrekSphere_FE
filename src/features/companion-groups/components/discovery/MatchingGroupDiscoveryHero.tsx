export function MatchingGroupDiscoveryHero() {
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
        <p className="max-w-2xl text-base text-white/90 sm:text-lg">
          Kết nối với những người cùng đam mê để chinh phục những cung đường huyền thoại.
        </p>
      </div>
    </section>
  );
}
