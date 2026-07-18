import { useState } from 'react';

const BG_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80';

export default function HomeNewsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 440 }}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        aria-hidden="true"
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(15,32,28,0.93) 0%, rgba(31,57,51,0.82) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-28">
        <span className="section-eyebrow text-white/50">Đừng bỏ lỡ</span>
        <h2 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl">
          Nhận ngay thông tin về các tour mới nhất và ưu đãi dành riêng cho bạn.
        </h2>
        <p className="mt-4 text-white/65 text-base max-w-md">
          Hàng tuần cập nhật các tour mới, mẹo trekking, và ưu đãi độc quyền.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg w-full"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            aria-label="Email đăng ký nhận tin"
            className="newsletter-glass-input flex-1 h-13 px-6 rounded-full text-sm outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            className="shrink-0 h-13 px-7 rounded-full text-sm font-bold cursor-pointer
              text-primary bg-white hover:bg-white/90 transition-all hover:scale-[1.03] shadow-lg whitespace-nowrap"
          >
            Đăng ký ngay
          </button>
        </form>

        <p className="mt-4 text-white/40 text-xs">Miễn phí. Hủy đăng ký bất kỳ lúc nào.</p>
      </div>
    </section>
  );
}
