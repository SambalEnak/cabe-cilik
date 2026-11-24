import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  ALL_PRODUCTS_MAP,
  PRODUCTS,
  calculateCartTotals,
  formatRupiah,
} from '../data/products';
import {
  CartItem,
  DemoOrder,
  DemoOrderCustomer,
  PaymentMethod,
  ProductId,
} from '../types/order';
import { QrisPaymentCard } from './QrisPaymentCard';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: ProductId, quantity: number) => void;
  onRemoveItem: (productId: ProductId) => void;
  onAddMissingVariant: (productId: ProductId) => void;
  onPlaceDemoOrder: (customer: DemoOrderCustomer) => DemoOrder;
  onNavigateToTracker: () => void;
}

const PAYMENT_OPTIONS: { method: PaymentMethod; subtitle: string }[] = [
  {
    method: 'QRIS',
    subtitle: 'GoPay, OVO, DANA, ShopeePay, atau Mobile Banking',
  },
  {
    method: 'Transfer Bank',
    subtitle: 'BCA · Mandiri · BRI',
  },
  {
    method: 'COD (Bayar di Tempat)',
    subtitle: 'Bayar tunai langsung saat paket tiba',
  },
];

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onAddMissingVariant,
  onPlaceDemoOrder,
  onNavigateToTracker,
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'qris' | 'confirmed'>('cart');
  const [confirmedOrder, setConfirmedOrder] = useState<DemoOrder | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [note, setNote] = useState('');

  const totals = calculateCartTotals(items);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && items.length > 0 && step === 'confirmed') {
      setStep('cart');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const singleIds: ProductId[] = ['korek-ijo-kelor', 'korek-teri', 'korek-kecombrang'];
  const inCartSingleIds = singleIds.filter((id) =>
    items.some((item) => item.productId === id && item.quantity > 0)
  );
  const missingSingleProducts =
    inCartSingleIds.length > 0 && inCartSingleIds.length < 3
      ? PRODUCTS.filter((p) => !inCartSingleIds.includes(p.id))
      : [];

  const finalizeOrder = () => {
    const order = onPlaceDemoOrder({
      name: name.trim() || 'Pelanggan Cabe Cilik',
      phone: phone.trim() || '0812-3456-7890',
      address: address.trim() || 'Alamat Pengiriman',
      paymentMethod,
      note: note.trim() || '-',
    });
    setConfirmedOrder(order);
    setStep('confirmed');
    setName('');
    setPhone('');
    setAddress('');
    setNote('');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'QRIS') {
      setStep('qris');
      return;
    }
    finalizeOrder();
  };

  const handleCloseAndTrack = () => {
    setStep('cart');
    onClose();
    onNavigateToTracker();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja Cabe Cilik"
    >
      <div
        className="w-full max-w-md h-full bg-[#FAF9F6] border-l border-[#E5E2DC] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DC] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            {(step === 'checkout' || step === 'qris') && (
              <button
                type="button"
                onClick={() => setStep(step === 'qris' ? 'checkout' : 'cart')}
                aria-label="Kembali"
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F1EC] text-[#1C1917] transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-display text-lg font-bold text-[#1C1917] truncate">
              {step === 'cart' && `Keranjang (${totals.totalJars} Jar)`}
              {step === 'checkout' && 'Pengiriman & Pembayaran'}
              {step === 'qris' && 'Pembayaran QRIS'}
              {step === 'confirmed' && 'Pesanan Diterima'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              if (step === 'confirmed') setStep('cart');
              onClose();
            }}
            aria-label="Tutup keranjang"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F1EC] text-[#1C1917] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-[#F3F1EC] flex items-center justify-center text-[#57534E] mb-4">
                    <ShoppingBag className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <p className="font-display text-lg font-semibold text-[#1C1917]">
                    Keranjang masih kosong
                  </p>
                  <p className="text-sm text-[#57534E] mt-1.5 max-w-xs">
                    Pilih varian favoritmu atau ambil Paket 3 Varian seharga Rp79.000 untuk hemat Rp5.000.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 px-5 py-2.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Lihat Varian Sambal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const product = ALL_PRODUCTS_MAP[item.productId];
                    if (!product) return null;
                    return (
                      <div
                        key={item.productId}
                        className="flex gap-4 p-3.5 bg-white border border-[#E5E2DC] rounded-xl"
                      >
                        <div className="w-20 h-24 rounded-lg overflow-hidden bg-[#F3F1EC] shrink-0">
                          <ResilientImage
                            src={product.image}
                            alt={product.name}
                            fallbackTitle={product.shortName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-[#1C1917] truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-[#57534E] mt-0.5">
                                {product.levelLabel} · {product.netWeight}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.productId)}
                              aria-label={`Hapus ${product.name}`}
                              className="p-1.5 text-[#78716C] hover:text-[#B91C1C] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-3">
                            <div className="inline-flex items-center border border-[#D6D3CD] rounded-md bg-[#FAF9F6]">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.productId, item.quantity - 1)
                                }
                                aria-label={`Kurangi ${product.name}`}
                                className="w-8 h-8 flex items-center justify-center text-[#1C1917] hover:bg-[#F3F1EC] transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-semibold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.productId, item.quantity + 1)
                                }
                                aria-label={`Tambah ${product.name}`}
                                className="w-8 h-8 flex items-center justify-center text-[#1C1917] hover:bg-[#F3F1EC] transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold text-[#1C1917] tabular-nums">
                              {formatRupiah(product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Smart Bundle Upsell */}
                  {missingSingleProducts.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#F3F1EC] border border-[#E5E2DC]">
                      <p className="text-xs font-semibold text-[#1C1917]">
                        Lengkapi 3 varian jadi Rp79.000 (hemat Rp5.000)
                      </p>
                      <p className="text-xs text-[#57534E] mt-1">
                        Tambahkan varian yang belum ada untuk potongan paket otomatis:
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {missingSingleProducts.map((missing) => (
                          <button
                            key={missing.id}
                            type="button"
                            onClick={() => onAddMissingVariant(missing.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D6D3CD] hover:border-[#B91C1C] text-xs font-medium text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#B91C1C]" />
                            {missing.shortName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="buyer-name"
                  className="block text-xs font-semibold text-[#1C1917] mb-1.5"
                >
                  Nama Penerima
                </label>
                <input
                  id="buyer-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap penerima"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D6D3CD] focus:outline-none focus:border-[#B91C1C] text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label
                  htmlFor="buyer-phone"
                  className="block text-xs font-semibold text-[#1C1917] mb-1.5"
                >
                  No. WhatsApp / Telepon
                </label>
                <input
                  id="buyer-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D6D3CD] focus:outline-none focus:border-[#B91C1C] text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label
                  htmlFor="buyer-address"
                  className="block text-xs font-semibold text-[#1C1917] mb-1.5"
                >
                  Alamat Pengiriman
                </label>
                <textarea
                  id="buyer-address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, kecamatan, kota"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D6D3CD] focus:outline-none focus:border-[#B91C1C] text-sm text-[#1C1917] resize-none"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Metode Pembayaran
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.method}
                      type="button"
                      onClick={() => setPaymentMethod(opt.method)}
                      className={`px-3.5 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        paymentMethod === opt.method
                          ? 'bg-white border-[#B91C1C] text-[#1C1917]'
                          : 'bg-[#F3F1EC] border-[#E5E2DC] text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-[#1C1917]">
                        {opt.method}
                      </span>
                      <span className="block text-xs text-[#57534E] mt-0.5">
                        {opt.subtitle}
                      </span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'Transfer Bank' && (
                  <div className="mt-2.5 p-3.5 rounded-lg bg-[#F3F1EC] border border-[#E5E2DC] text-xs text-[#44403C] space-y-1">
                    <p className="font-semibold text-[#1C1917]">
                      Rekening Tujuan Transfer
                    </p>
                    <p className="tabular-nums">BCA · 7180 4920 11 a.n. Cabe Cilik Official</p>
                    <p className="tabular-nums">Mandiri · 1320 0089 4512 0 a.n. Cabe Cilik Official</p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="buyer-note"
                  className="block text-xs font-semibold text-[#1C1917] mb-1.5"
                >
                  Catatan Pesanan (Opsional)
                </label>
                <input
                  id="buyer-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Misal: kirim sore, titip di pos satpam..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D6D3CD] focus:outline-none focus:border-[#B91C1C] text-sm text-[#1C1917]"
                />
              </div>
            </form>
          )}

          {step === 'qris' && (
            <QrisPaymentCard amount={totals.total} customerName={name} />
          )}

          {step === 'confirmed' && confirmedOrder && (
            <div className="py-4 space-y-5">
              <div className="p-5 rounded-xl bg-white border border-[#E5E2DC] text-center">
                <CheckCircle2 className="w-11 h-11 text-[#15803D] mx-auto" strokeWidth={1.75} />
                <p className="text-xs font-medium text-[#15803D] mt-3">
                  Pesanan Berhasil Dibuat
                </p>
                <h3 className="font-display text-2xl font-bold text-[#1C1917] mt-1 tabular-nums">
                  {confirmedOrder.id}
                </h3>
                <p className="text-sm text-[#57534E] mt-1">
                  Terima kasih, {confirmedOrder.customer.name}. Pesanan Anda sedang diproses dan siap dikirim.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5E2DC] space-y-3 text-sm">
                <div className="flex justify-between text-[#57534E]">
                  <span>Status Pesanan</span>
                  <span className="font-semibold text-[#1C1917]">{confirmedOrder.status}</span>
                </div>
                <div className="flex justify-between text-[#57534E]">
                  <span>Metode Pembayaran</span>
                  <span className="font-medium text-[#1C1917]">
                    {confirmedOrder.customer.paymentMethod}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E5E2DC] space-y-1.5">
                  {confirmedOrder.items.map((line) => (
                    <div key={line.productId} className="flex justify-between text-xs text-[#44403C]">
                      <span>
                        {line.name} × {line.quantity}
                      </span>
                      <span className="tabular-nums font-medium">
                        {formatRupiah(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  ))}
                  {confirmedOrder.bundleDiscount > 0 && (
                    <div className="flex justify-between text-xs text-[#15803D] font-medium">
                      <span>Potongan Paket 3 Varian</span>
                      <span className="tabular-nums">
                        -{formatRupiah(confirmedOrder.bundleDiscount)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-[#E5E2DC] flex justify-between font-bold text-[#1C1917]">
                  <span>Total Pembayaran</span>
                  <span className="tabular-nums">{formatRupiah(confirmedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {step === 'cart' && items.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E5E2DC] bg-white space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#57534E]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatRupiah(totals.subtotal)}</span>
              </div>
              {totals.bundleDiscount > 0 && (
                <div className="flex justify-between text-[#15803D] font-medium">
                  <span>Hemat Paket 3 Varian ({totals.autoTrioSets} set)</span>
                  <span className="tabular-nums">-{formatRupiah(totals.bundleDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#1C1917] pt-1.5 border-t border-[#E5E2DC]">
                <span>Total Bayar</span>
                <span className="tabular-nums">{formatRupiah(totals.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="w-full h-11 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Lanjut
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="px-6 py-4 border-t border-[#E5E2DC] bg-white space-y-3">
            <div className="flex justify-between text-sm font-bold text-[#1C1917]">
              <span>Total Pembayaran</span>
              <span className="tabular-nums">{formatRupiah(totals.total)}</span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              className="w-full h-11 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Lanjut
            </button>
          </div>
        )}

        {step === 'qris' && (
          <div className="px-6 py-4 border-t border-[#E5E2DC] bg-white flex flex-col gap-2">
            <button
              type="button"
              onClick={finalizeOrder}
              className="w-full h-11 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Saya Sudah Bayar
            </button>
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="w-full h-10 rounded-lg border border-[#D6D3CD] hover:bg-[#F3F1EC] text-[#1C1917] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Ubah Metode Pembayaran
            </button>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="px-6 py-4 border-t border-[#E5E2DC] bg-white flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCloseAndTrack}
              className="w-full h-11 rounded-lg bg-[#1C1917] hover:bg-[#292524] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Lacak Pesanan Saya
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('cart');
                onClose();
              }}
              className="w-full h-10 rounded-lg border border-[#D6D3CD] hover:bg-[#F3F1EC] text-[#1C1917] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Lanjut Belanja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
