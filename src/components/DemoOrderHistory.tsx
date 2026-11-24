import { CheckCircle2, Package, RotateCcw, Trash2, Truck } from 'lucide-react';
import { formatRupiah } from '../data/products';
import { DemoOrder, DemoOrderStatus } from '../types/order';
import { ResilientImage } from './ResilientImage';

interface DemoOrderHistoryProps {
  orders: DemoOrder[];
  onReorder: (order: DemoOrder) => void;
  onClearHistory: () => void;
}

const STATUS_SEQUENCE: DemoOrderStatus[] = [
  'Menunggu Konfirmasi',
  'Sedang Dikemas',
  'Dalam Pengiriman',
  'Pesanan Tiba',
];

export function DemoOrderHistory({
  orders,
  onReorder,
  onClearHistory,
}: DemoOrderHistoryProps) {
  return (
    <section id="pesanan-saya" className="py-16 sm:py-20 border-t border-[#E5E2DC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#B91C1C]">Status Pengiriman</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
              Pesanan Saya
            </h2>
            <p className="text-sm text-[#57534E] mt-2 max-w-2xl">
              Pantau perkembangan status pengemasan hingga pengiriman paket Cabe Cilik Anda di sini.
            </p>
          </div>

          {orders.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D6D3CD] hover:border-[#B91C1C] text-xs font-medium text-[#57534E] hover:text-[#B91C1C] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Riwayat
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 p-8 sm:p-10 rounded-xl bg-[#F3F1EC] border border-[#E5E2DC] text-center">
            <Package className="w-8 h-8 text-[#57534E] mx-auto mb-3" strokeWidth={1.75} />
            <h3 className="font-display text-lg font-semibold text-[#1C1917]">
              Belum ada pesanan aktif
            </h3>
            <p className="text-sm text-[#57534E] mt-1 max-w-md mx-auto">
              Tambahkan sambal pilihan Anda ke keranjang dan selesaikan pemesanan untuk melihat rincian struk serta pelacakan pengiriman di sini.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => {
              const currentStepIdx = STATUS_SEQUENCE.indexOf(order.status);
              const isCompleted = order.status === 'Pesanan Tiba';

              return (
                <article
                  key={order.id}
                  className="p-6 rounded-xl bg-white border border-[#E5E2DC] flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E5E2DC]">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#57534E]">
                          <span className="font-semibold text-[#1C1917] tabular-nums">
                            {order.id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{order.createdAt}</span>
                        </div>
                        <h3 className="text-base font-semibold text-[#1C1917] mt-1">
                          {order.customer.name}
                        </h3>
                        <p className="text-xs text-[#57534E] mt-0.5">
                          {order.customer.phone} · {order.customer.address}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#1C1917] tabular-nums">
                          {formatRupiah(order.total)}
                        </span>
                        <p className="text-xs text-[#57534E] mt-0.5">
                          {order.customer.paymentMethod}
                        </p>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-medium text-[#1C1917] mb-2">
                        <span className="inline-flex items-center gap-1.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                          ) : (
                            <Truck className="w-4 h-4 text-[#B91C1C]" />
                          )}
                          <span>{order.status}</span>
                        </span>
                        <span className="text-[#57534E] tabular-nums">
                          Tahap {currentStepIdx + 1}/{STATUS_SEQUENCE.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {STATUS_SEQUENCE.map((statusLabel, idx) => (
                          <div
                            key={statusLabel}
                            title={statusLabel}
                            className={`h-1.5 rounded-full transition-colors ${
                              idx <= currentStepIdx
                                ? isCompleted
                                  ? 'bg-[#15803D]'
                                  : 'bg-[#B91C1C]'
                                : 'bg-[#E5E2DC]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-[#F3F1EC] shrink-0">
                            <ResilientImage
                              src={item.image}
                              alt={item.name}
                              fallbackTitle={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1C1917] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#57534E] tabular-nums">
                              {item.quantity} × {formatRupiah(item.unitPrice)}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-[#1C1917] tabular-nums">
                            {formatRupiah(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}

                      {order.bundleDiscount > 0 && (
                        <div className="flex justify-between text-xs font-medium text-[#15803D] pt-1">
                          <span>Potongan Paket 3 Varian</span>
                          <span className="tabular-nums">
                            -{formatRupiah(order.bundleDiscount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5E2DC] flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onReorder(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D6D3CD] hover:bg-[#F3F1EC] text-xs font-medium text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Pesan Lagi
                    </button>

                    {isCompleted ? (
                      <span className="text-xs font-semibold text-[#15803D]">
                        Pesanan Selesai
                      </span>
                    ) : (
                      <span className="text-xs text-[#57534E]">
                        Status diperbarui otomatis
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
