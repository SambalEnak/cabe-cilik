import { useEffect, useMemo, useState } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { formatRupiah } from '../data/products';

interface QrisPaymentCardProps {
  amount: number;
  customerName: string;
}

const QR_SIZE = 25;

function isFinderModule(row: number, col: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= QR_SIZE - 7;
  const inBottomLeft = row >= QR_SIZE - 7 && col < 7;

  if (!inTopLeft && !inTopRight && !inBottomLeft) return false;

  const localR = row >= QR_SIZE - 7 ? row - (QR_SIZE - 7) : row;
  const localC = col >= QR_SIZE - 7 ? col - (QR_SIZE - 7) : col;

  if (localR === 0 || localR === 6 || localC === 0 || localC === 6) return true;
  if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) return true;
  return false;
}

function isFinderSeparator(row: number, col: number): boolean {
  if (row === 7 && col <= 7) return true;
  if (col === 7 && row <= 7) return true;
  if (row === 7 && col >= QR_SIZE - 8) return true;
  if (col === QR_SIZE - 8 && row <= 7) return true;
  if (row === QR_SIZE - 8 && col <= 7) return true;
  if (col === 7 && row >= QR_SIZE - 8) return true;
  return false;
}

function isAlignmentModule(row: number, col: number): boolean {
  if (row < 16 || row > 20 || col < 16 || col > 20) return false;
  const dr = row - 18;
  const dc = col - 18;
  return Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
}

function generateQrMatrix(seedValue: number): boolean[][] {
  const matrix: boolean[][] = [];
  let state = (seedValue ^ 0x5f3759df) >>> 0;

  for (let r = 0; r < QR_SIZE; r++) {
    const rowArr: boolean[] = [];
    for (let c = 0; c < QR_SIZE; c++) {
      if (isFinderModule(r, c)) {
        rowArr.push(true);
        continue;
      }
      if (isFinderSeparator(r, c)) {
        rowArr.push(false);
        continue;
      }
      if (r >= 16 && r <= 20 && c >= 16 && c <= 20) {
        rowArr.push(isAlignmentModule(r, c));
        continue;
      }
      if (r === 6 || c === 6) {
        rowArr.push((r + c) % 2 === 0);
        continue;
      }
      // Leave clean center notch for subtle QRIS badge
      if (r >= 10 && r <= 14 && c >= 10 && c <= 14) {
        rowArr.push(false);
        continue;
      }
      // Deterministic pseudo-random module fill
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      rowArr.push(((state >>> 16) & 1) === 1);
    }
    matrix.push(rowArr);
  }
  return matrix;
}

export function QrisPaymentCard({ amount, customerName }: QrisPaymentCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60 - 1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const matrix = useMemo(() => generateQrMatrix(amount + customerName.length * 37), [amount, customerName]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white border border-[#E5E2DC] overflow-hidden shadow-xs">
        {/* QRIS Top Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E2DC] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold tracking-tight text-[#1C1917]">
              QRIS
            </span>
            <span className="text-[11px] text-[#57534E]">
              QR Code Standar Pembayaran Nasional
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B91C1C] tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            {mins}:{secs}
          </span>
        </div>

        {/* Merchant & QR Matrix */}
        <div className="p-5 flex flex-col items-center text-center">
          <p className="text-sm font-bold text-[#1C1917]">Cabe Cilik Official</p>
          <p className="text-[11px] text-[#57534E] mt-0.5 tabular-nums">
            NMID: ID1026482910482 · A01
          </p>

          <div className="relative mt-4 p-3.5 bg-white border border-[#E5E2DC] rounded-xl">
            <svg
              viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
              className="w-48 h-48 sm:w-52 sm:h-52 block"
              role="img"
              aria-label={`Kode QRIS pembayaran sebesar ${formatRupiah(amount)}`}
            >
              <rect width={QR_SIZE} height={QR_SIZE} fill="#FFFFFF" />
              {matrix.map((rowArr, r) =>
                rowArr.map((isDark, c) =>
                  isDark ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width={1}
                      height={1}
                      fill="#1C1917"
                    />
                  ) : null
                )
              )}
            </svg>

            {/* Center QRIS Mark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-2 py-1 rounded bg-white border border-[#E5E2DC] shadow-xs">
                <span className="font-display text-[10px] font-bold tracking-tight text-[#B91C1C]">
                  QRIS
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full pt-4 border-t border-[#E5E2DC] flex items-center justify-between text-sm">
            <span className="text-[#57534E]">Total Pembayaran</span>
            <span className="text-lg font-bold text-[#1C1917] tabular-nums">
              {formatRupiah(amount)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#F3F1EC] border border-[#E5E2DC] text-xs text-[#44403C] space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          <span>Cara Bayar dengan QRIS</span>
        </div>
        <p className="leading-relaxed">
          Buka aplikasi GoPay, OVO, DANA, ShopeePay, atau Mobile Banking Anda, pilih pindai QRIS, lalu pastikan nominal{' '}
          <strong className="font-semibold text-[#1C1917] tabular-nums">
            {formatRupiah(amount)}
          </strong>{' '}
          sesuai sebelum konfirmasi.
        </p>
      </div>
    </div>
  );
}
