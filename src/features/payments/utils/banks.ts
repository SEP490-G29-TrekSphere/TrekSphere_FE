export interface BankOption {
  bin: string;
  name: string;
}

/**
 * BIN is kept as the machine value because payOS payouts require `toBin`.
 * People only see and select the corresponding bank name in the UI.
 */
export const VIETNAM_BANKS: BankOption[] = [
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970405', name: 'Agribank' },
  { bin: '970422', name: 'MB Bank' },
  { bin: '970407', name: 'Techcombank' },
  { bin: '970416', name: 'ACB' },
  { bin: '970432', name: 'VPBank' },
  { bin: '970423', name: 'TPBank' },
  { bin: '970403', name: 'Sacombank' },
  { bin: '970437', name: 'HDBank' },
  { bin: '970441', name: 'VIB' },
  { bin: '970443', name: 'SHB' },
  { bin: '970448', name: 'OCB' },
  { bin: '970426', name: 'MSB' },
  { bin: '970440', name: 'SeABank' },
  { bin: '970431', name: 'Eximbank' },
  { bin: '970428', name: 'Nam A Bank' },
  { bin: '970412', name: 'PVcomBank' },
  { bin: '970409', name: 'Bac A Bank' },
  { bin: '970433', name: 'VietBank' },
  { bin: '970419', name: 'NCB' },
  { bin: '970452', name: 'KienlongBank' },
  { bin: '970438', name: 'BaoViet Bank' },
  { bin: '970400', name: 'Saigonbank' },
  { bin: '970425', name: 'ABBank' },
  { bin: '970427', name: 'VietABank' },
  { bin: '970430', name: 'PGBank' },
  { bin: '970424', name: 'Shinhan Bank' },
  { bin: '970457', name: 'Woori Bank' },
  { bin: '970439', name: 'Public Bank Vietnam' },
  { bin: '970458', name: 'UOB Vietnam' },
];

export function bankNameFromBin(bin?: string | null): string | undefined {
  if (!bin) return undefined;
  return VIETNAM_BANKS.find((bank) => bank.bin === bin)?.name;
}

export function bankDisplayName(bin?: string | null, bankName?: string | null): string {
  return (
    bankName?.trim() ||
    bankNameFromBin(bin) ||
    (bin ? `Ngân hàng (mã ${bin})` : 'Chưa có ngân hàng')
  );
}
