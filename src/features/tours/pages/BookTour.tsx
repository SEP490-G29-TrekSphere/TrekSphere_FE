import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileImage,
  Info,
  QrCode,
  ShieldCheck,
  Upload,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as z from 'zod';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import { tourService } from '@/features/tours/services/tourService';
import { AppButton, AppCard, AppFormInput } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

// Form validation schema
const bookingFormSchema = z.object({
  scheduleId: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
  participants: z.number().min(1, 'Số lượng người tham gia tối thiểu là 1'),
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ (yêu cầu 10 chữ số)'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['card', 'bank', 'wallet']),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookTour() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedScheduleId = searchParams.get('scheduleId') || '';

  const { data: tour, isLoading, error } = useTourDetail(id);

  // Flow State: 'form' | 'payment' | 'success'
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [bookingId, setBookingId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<
    Array<{
      code: string;
      description: string;
      discountAmount: number;
      minSpend: number;
      isExceeded: boolean;
      isExpired: boolean;
    }>
  >([]);

  // Fetch available vouchers
  useEffect(() => {
    async function fetchVouchers() {
      try {
        const list = await tourService.getAvailableVouchers();
        setAvailableVouchers(list);
      } catch {
        // ignore
      }
    }
    fetchVouchers();
  }, []);

  // Payment proof state
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [simulateFail, setSimulateFail] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      scheduleId: preSelectedScheduleId,
      participants: 1,
      fullName: '',
      phone: '',
      email: '',
      notes: '',
      paymentMethod: 'bank',
    },
  });

  const selectedScheduleId = watch('scheduleId');
  const participantsCount = watch('participants');
  const paymentMethod = watch('paymentMethod');

  // Find selected schedule details
  const selectedSchedule = tour?.schedules.find((s) => s.scheduleId === selectedScheduleId);

  // Get base price
  const basePrice = selectedSchedule?.price ?? tour?.basePrice ?? 0;
  const subtotal = basePrice * participantsCount;
  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  // Handle countdown timer
  useEffect(() => {
    if (step !== 'payment') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Hết thời gian giữ chỗ! Vui lòng đặt lại.');
          setStep('form');
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Handle voucher application
  const handleApplyVoucher = async (codeOverride?: string) => {
    const code = codeOverride || voucherCode;
    if (!code.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherError(null);
    try {
      const response = await tourService.validateVoucher(code, subtotal);
      if (response.isValid) {
        setAppliedVoucher({
          code: code,
          discountAmount: response.discountAmount,
        });
        toast.success('Áp dụng mã giảm giá thành công!');
      } else {
        setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        setAppliedVoucher(null);
      }
    } catch (err) {
      // E1, E2, E3 Exception Handling
      const message =
        err instanceof Error ? err.message : 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
      setVoucherError(message);
      setAppliedVoucher(null);
      toast.error(message);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Submit initial form to proceed to payment redirect
  const onFormSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await tourService.createBooking({
        tourId: tour?.tourId || '',
        scheduleId: data.scheduleId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
        participants: data.participants,
        paymentMethod: data.paymentMethod,
        voucherCode: appliedVoucher?.code,
      });

      setBookingId(response.bookingId);
      // Redirect directly to manual payment page
      toast.success('Đặt chỗ thành công! Đang chuyển đến trang thanh toán.');
      navigate(`/my-tours/${response.bookingId}/pay`);
    } catch {
      toast.error('Đã xảy ra lỗi khi tạo đặt chỗ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle proof image change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      setPaymentProofUrl(URL.createObjectURL(file));
    }
  };

  // Confirm payment & upload photo proof
  const handleConfirmPayment = () => {
    if (!paymentProof) {
      toast.error('Vui lòng tải lên ảnh chụp minh chứng thanh toán.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (simulateFail) {
        // E2 Exception: Payment Failure simulation
        toast.error('Thanh toán thất bại. Vui lòng thử lại.');
      } else {
        toast.success('Thanh toán thành công! Đang chờ đối tác duyệt.');
        setStep('success');
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B3025] border-t-transparent" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Không tìm thấy thông tin tour</h2>
        <p className="text-muted-foreground mt-2">
          {error?.message || 'Có lỗi xảy ra khi tải dữ liệu.'}
        </p>
        <Link to="/tours" className="mt-4 inline-block text-primary hover:underline">
          Quay lại danh sách tour
        </Link>
      </div>
    );
  }

  const openSchedules = tour.schedules.filter((s) => s.status === 'OPEN');
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {step === 'form' && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#0B3025]">Thanh toán đơn hàng</h1>
            <p className="text-zinc-500 mt-2 font-medium text-sm">
              Vui lòng kiểm tra kỹ thông tin trước khi hoàn tất đặt chỗ.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
          >
            {/* Left side: Input Details */}
            <div className="space-y-6">
              {/* Schedule selection */}
              <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#F4F4F2] pb-4 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h3 className="font-extrabold text-zinc-800 text-base">Chọn ngày khởi hành</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {openSchedules.map((s) => {
                      const remaining = Math.max(0, s.availableSlots - s.bookedSlots);
                      const isSelected = selectedScheduleId === s.scheduleId;
                      return (
                        <button
                          key={s.scheduleId}
                          type="button"
                          onClick={() => {
                            setValue('scheduleId', s.scheduleId, { shouldValidate: true });
                          }}
                          className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                            isSelected
                              ? 'border-[#0B3025] bg-[#E8F1EE]/30 ring-2 ring-[#0B3025]'
                              : 'border-[#E5E4DE] bg-[#FAF9F5] hover:border-zinc-400'
                          }`}
                        >
                          <span className="font-bold text-sm text-[#0B3025]">
                            {new Date(s.departureDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-[11px] text-zinc-500 mt-1 font-semibold">
                            Còn {remaining} chỗ
                          </span>
                          <span className="text-sm font-extrabold mt-2 text-zinc-800">
                            {formatPrice(s.price)}đ
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.scheduleId && (
                    <p className="text-xs text-destructive">{errors.scheduleId.message}</p>
                  )}

                  {/* Participants Selector */}
                  <div className="mt-4 border-t border-[#F4F4F2] pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-zinc-400" />
                      <span className="font-bold text-sm text-zinc-700">
                        Số lượng người tham gia
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const current = watch('participants');
                          if (current > 1) setValue('participants', current - 1);
                        }}
                        className="h-8 w-8 rounded-full border border-[#E5E4DE] bg-white flex items-center justify-center font-bold hover:bg-zinc-50"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-zinc-800 text-sm">
                        {participantsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = watch('participants');
                          const limit = selectedSchedule?.availableSlots ?? 10;
                          if (current < limit) setValue('participants', current + 1);
                        }}
                        className="h-8 w-8 rounded-full border border-[#E5E4DE] bg-white flex items-center justify-center font-bold hover:bg-zinc-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </AppCard>

              {/* Participant info */}
              <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#F4F4F2] pb-4 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
                    <User className="h-4 w-4" />
                  </div>
                  <h3 className="font-extrabold text-zinc-800 text-base">
                    Thông tin người tham gia
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AppFormInput
                      control={control}
                      name="fullName"
                      label="Họ và tên"
                      placeholder="Nhập họ và tên khách hàng"
                      className="bg-[#FAF9F5] rounded-2xl border-[#E5E4DE] focus:ring-1 focus:ring-[#0B3025]"
                    />
                    <AppFormInput
                      control={control}
                      name="phone"
                      label="Số điện thoại"
                      placeholder="0xxx xxx xxx"
                      className="bg-[#FAF9F5] rounded-2xl border-[#E5E4DE] focus:ring-1 focus:ring-[#0B3025]"
                    />
                  </div>
                  <AppFormInput
                    control={control}
                    name="email"
                    label="Email"
                    placeholder="example@email.com"
                    className="bg-[#FAF9F5] rounded-2xl border-[#E5E4DE] focus:ring-1 focus:ring-[#0B3025]"
                  />

                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-zinc-700 font-bold text-xs">
                      Ghi chú đặc biệt
                    </label>
                    <textarea
                      id="notes"
                      className="w-full min-h-[100px] p-4 bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl text-zinc-800 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-[#0B3025]"
                      placeholder="Yêu cầu về ăn uống, y tế hoặc lưu ý khác..."
                      onChange={(e) => setValue('notes', e.target.value)}
                      value={watch('notes') || ''}
                    />
                  </div>
                </div>
              </AppCard>

              {/* Payment Methods */}
              <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#F4F4F2] pb-4 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <h3 className="font-extrabold text-zinc-800 text-base">Phương thức thanh toán</h3>
                </div>

                <div className="space-y-3">
                  {/* Credit card */}
                  <label
                    className={`flex items-center justify-between p-4 bg-[#FAF9F5] rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#0B3025] ring-1 ring-[#0B3025]'
                        : 'border-[#E5E4DE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setValue('paymentMethod', 'card')}
                        className="accent-[#0B3025] h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-sm text-zinc-800 block">
                          Thẻ tín dụng / Ghi nợ
                        </span>
                        <span className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                          Visa, Mastercard, JCB, American Express
                        </span>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-zinc-400" />
                  </label>

                  {/* Bank transfer */}
                  <label
                    className={`flex items-center justify-between p-4 bg-[#FAF9F5] rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-[#0B3025] ring-1 ring-[#0B3025]'
                        : 'border-[#E5E4DE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setValue('paymentMethod', 'bank')}
                        className="accent-[#0B3025] h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-sm text-zinc-800 block">
                          Chuyển khoản ngân hàng
                        </span>
                        <span className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                          Xác nhận nhanh chóng qua QR Code VietQR
                        </span>
                      </div>
                    </div>
                    <QrCode className="h-5 w-5 text-zinc-400" />
                  </label>

                  {/* Mobile wallet */}
                  <label
                    className={`flex items-center justify-between p-4 bg-[#FAF9F5] rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-[#0B3025] ring-1 ring-[#0B3025]'
                        : 'border-[#E5E4DE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'wallet'}
                        onChange={() => setValue('paymentMethod', 'wallet')}
                        className="accent-[#0B3025] h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-sm text-zinc-800 block">
                          Ví điện tử MoMo / ZaloPay
                        </span>
                        <span className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                          Thanh toán tiện lợi, bảo mật cao
                        </span>
                      </div>
                    </div>
                    <Wallet className="h-5 w-5 text-zinc-400" />
                  </label>
                </div>
              </AppCard>
            </div>

            {/* Right side: Summary */}
            <div className="space-y-6">
              <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm sticky top-24">
                <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2] mb-4">
                  Tóm tắt đơn hàng
                </h3>

                {/* Mini Tour Card */}
                <div className="flex gap-3 mb-4">
                  <img
                    src={
                      tour.coverImageUrl ||
                      (tour.images && tour.images.length > 0
                        ? tour.images[0].imageUrl
                        : FALLBACK_IMAGE)
                    }
                    alt={tour.tourName}
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_IMAGE) {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }
                    }}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-800 leading-snug">
                      {tour.tourName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-zinc-400 mt-1 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {selectedSchedule
                          ? new Date(selectedSchedule.departureDate).toLocaleDateString('vi-VN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Chưa chọn ngày'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voucher input */}
                <div className="mb-6 pt-4 border-t border-[#F4F4F2]">
                  <label className="text-zinc-600 font-bold text-xs mb-2 block">
                    Mã ưu đãi (Voucher)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl px-4 py-2.5 outline-none w-full text-zinc-800 font-bold text-sm placeholder-zinc-300 focus:ring-1 focus:ring-[#0B3025]"
                      placeholder="Nhập mã..."
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={isValidatingVoucher}
                      onClick={() => handleApplyVoucher()}
                      className="bg-[#E8F1EE] hover:bg-[#d8e7e2] text-[#0B3025] font-bold px-4 py-2.5 rounded-2xl text-xs transition-colors shrink-0"
                    >
                      {isValidatingVoucher ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                  {voucherError && (
                    <p className="text-xs text-red-500 mt-2 font-medium">{voucherError}</p>
                  )}
                  {appliedVoucher && (
                    <p className="text-xs text-emerald-600 mt-2 font-bold">
                      Đã áp dụng mã: {appliedVoucher.code} (-
                      {formatPrice(appliedVoucher.discountAmount)}đ)
                    </p>
                  )}

                  {/* List of available vouchers */}
                  {availableVouchers.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#F4F4F2]">
                      <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider block mb-2 uppercase">
                        Mã giảm giá khả dụng
                      </span>
                      <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                        {availableVouchers.map((v) => (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => {
                              setVoucherCode(v.code);
                              handleApplyVoucher(v.code);
                            }}
                            className="flex flex-col text-left p-2.5 rounded-xl border border-[#E5E4DE] bg-[#FAF9F5] hover:border-[#0B3025] hover:bg-[#E8F1EE]/10 transition-all text-xs cursor-pointer"
                          >
                            <span className="font-bold text-zinc-800">{v.code}</span>
                            <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                              {v.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cost display */}
                <div className="space-y-3 pt-4 border-t border-[#F4F4F2] mb-6">
                  <div className="flex justify-between items-center text-zinc-500 font-semibold text-sm">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500 font-semibold text-sm">
                    <span>Giảm giá</span>
                    <span className="text-red-500">-{formatPrice(discount)}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-800 font-extrabold text-base pt-2 border-t border-dashed border-[#E5E4DE]">
                    <span>Tổng cộng</span>
                    <span className="text-lg text-[#0B3025]">{formatPrice(total)}đ</span>
                  </div>
                </div>

                {/* Pay button */}
                <AppButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0B3025] hover:bg-[#072019] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors border-none"
                >
                  {isSubmitting ? 'Đang tạo giao dịch...' : 'Thanh toán ngay'}
                </AppButton>

                <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </AppCard>

              {/* Refund Info Alert */}
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl text-xs font-semibold flex gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Chính sách hoàn tiền: Hoàn 100% nếu hủy trước khởi hành 7 ngày.</span>
              </div>
            </div>
          </form>
        </>
      )}

      {step === 'payment' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-extrabold text-[#0B3025]">Thanh toán đơn hàng</h1>
          </div>

          <div className="p-4 bg-amber-50 text-amber-800 border border-amber-100 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Vui lòng hoàn tất thanh toán để giữ chỗ cho tour của bạn:</span>
            </div>
            <span className="text-sm font-extrabold tracking-wider">{formatTime(timeLeft)}</span>
          </div>

          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2] mb-6">
              Thông tin chuyển khoản ngân hàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Bank Transfer QR Mockup */}
              <div className="flex flex-col items-center justify-center p-4 bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl">
                <div className="w-48 h-48 bg-white border border-[#E5E4DE] rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                  <QrCode className="h-32 w-32 text-zinc-800" />
                  <span className="text-[10px] font-extrabold text-zinc-400 mt-2 tracking-wider">
                    VietQR / Techcombank
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-semibold mt-3 text-center">
                  Quét mã QR để tự động điền thông tin chuyển khoản nhanh chóng.
                </p>
              </div>

              {/* Bank Details Text */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                  <span className="text-zinc-500 text-xs font-semibold">Tên ngân hàng</span>
                  <span className="text-zinc-800 text-sm font-bold">Techcombank</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                  <span className="text-zinc-500 text-xs font-semibold">Số tài khoản</span>
                  <span className="text-zinc-800 text-sm font-extrabold">19038283929182</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                  <span className="text-zinc-500 text-xs font-semibold">Tên chủ tài khoản</span>
                  <span className="text-zinc-800 text-sm font-bold uppercase">TrekSphere JSC</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                  <span className="text-zinc-500 text-xs font-semibold">Số tiền cần chuyển</span>
                  <span className="text-red-600 text-sm font-extrabold">{formatPrice(total)}đ</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#F4F4F2]">
                  <span className="text-zinc-500 text-xs font-semibold">Nội dung chuyển khoản</span>
                  <span className="text-emerald-700 text-sm font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    TS-{bookingId}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Payment Fail option */}
            <div className="mt-6 pt-4 border-t border-[#F4F4F2] flex items-center justify-between">
              <span className="text-zinc-500 text-xs font-semibold">
                Mô phỏng lỗi giao dịch (E2)
              </span>
              <input
                type="checkbox"
                checked={simulateFail}
                onChange={(e) => setSimulateFail(e.target.checked)}
                className="accent-[#0B3025] h-4 w-4 cursor-pointer"
              />
            </div>
          </AppCard>

          {/* Proof of Payment Upload */}
          <AppCard className="border-[#E5E4DE] rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="font-extrabold text-base text-zinc-800 tracking-tight pb-4 border-b border-[#F4F4F2] mb-4">
              Tải lên minh chứng thanh toán
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#E5E4DE] rounded-2xl cursor-pointer bg-[#FAF9F5] hover:bg-zinc-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <p className="mb-2 text-sm text-zinc-500 font-semibold">
                      <span className="text-[#0B3025]">Nhấp để tải lên</span> hoặc kéo thả file
                    </p>
                    <p className="text-xs text-zinc-400 font-semibold">
                      PNG, JPG hoặc JPEG (Tối đa 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {paymentProof && (
                <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-[#E5E4DE] rounded-xl">
                  <FileImage className="h-6 w-6 text-zinc-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-zinc-800 truncate">{paymentProof.name}</p>
                    <p className="text-[10px] text-zinc-500 font-semibold">
                      {(paymentProof.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  {paymentProofUrl && (
                    <img
                      src={paymentProofUrl}
                      alt="Xem trước"
                      className="w-12 h-12 rounded-lg object-cover border border-[#E5E4DE]"
                    />
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('form')}
                  className="flex-1 text-zinc-500 font-bold hover:text-zinc-800"
                >
                  Hủy giao dịch
                </AppButton>
                <AppButton
                  type="button"
                  disabled={isSubmitting || !paymentProof}
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-[#0B3025] hover:bg-[#072019] text-white font-bold py-3.5 rounded-2xl border-none shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác nhận đã thanh toán'}
                </AppButton>
              </div>
            </div>
          </AppCard>
        </div>
      )}

      {step === 'success' && (
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#0B3025]">Đặt tour thành công!</h1>
            <p className="text-zinc-500 font-semibold text-sm">
              Yêu cầu đặt chỗ của bạn đã được ghi nhận với mã giao dịch:
            </p>
            <p className="text-lg font-extrabold text-zinc-800 font-mono bg-zinc-100 inline-block px-3 py-1 rounded-lg">
              {bookingId}
            </p>
            <p className="text-zinc-500 font-medium text-xs mt-2 leading-relaxed">
              Minh chứng thanh toán của bạn đang được đối tác kiểm tra và phê duyệt. Chúng tôi sẽ
              thông báo kết quả qua email và ứng dụng cho bạn sớm nhất có thể.
            </p>
          </div>

          <div className="pt-6">
            <Link
              to="/my-tours"
              className="inline-block bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-8 py-3.5 rounded-2xl shadow-sm transition-colors border-none"
            >
              Xem danh sách tour đã đặt
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
