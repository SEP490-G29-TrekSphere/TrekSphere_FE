import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { VENDOR_STATUS_FILTER_OPTIONS, type VendorStatus } from '../types';

interface VendorFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: VendorStatus | 'ALL';
  onStatusChange: (value: VendorStatus | 'ALL') => void;
}

export function VendorFilterToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: VendorFilterToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusLabel =
    VENDOR_STATUS_FILTER_OPTIONS.find((option) => option.value === status)?.label ??
    'Tất cả trạng thái';

  return (
    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">

        <div className="relative flex-1 sm:max-w-sm">
          <span
            className="absolute inset-y-0 left-4 flex items-center"
            style={{ color: '#6F7B75' }}
          >
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, email hoặc công ty..."
            aria-label="Tìm theo tên, email hoặc công ty"
            className="h-11 w-full rounded-full pl-11 pr-4 text-sm font-medium outline-none transition-colors"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          />
        </div>

        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => setStatusOpen((prev) => !prev)}
            className="flex h-11 w-full items-center justify-between gap-2 rounded-full px-5 text-sm font-medium transition-colors sm:w-48"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            <span>{statusLabel}</span>
            <ChevronDown className="h-4 w-4" style={{ color: '#6F7B75' }} />
          </button>

          {statusOpen && (
            <div
              className="absolute left-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl py-1 shadow-lg"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E2D1' }}
            >
              {VENDOR_STATUS_FILTER_OPTIONS.map((option) => {
                const isSelected = option.value === status;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onStatusChange(option.value);
                      setStatusOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                    style={{
                      color: isSelected ? '#06261D' : '#6F7B75',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: '#06261D' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
