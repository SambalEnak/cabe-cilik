import { useEffect, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import { formatRupiah } from '../data/products';
import { Product, ProductId } from '../types/order';
import { ResilientImage } from './ResilientImage';
import { SpiceMeter } from './SpiceMeter';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: ProductId, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const handleConfirmAdd = () => {
    onAddToCart(product.id, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail produk"
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-lg bg-[#FAF9F6]/90 border border-[#E5E2DC] text-[#1C1917] hover:bg-[#F3F1EC] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
          <div className="bg-[#F3F1EC] aspect-[4/5] md:aspect-auto md:min-h-[460px] overflow-hidden">
            <ResilientImage
              src={product.image}
              alt={product.name}
              fallbackTitle={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                <SpiceMeter level={product.level} label={product.levelLabel} />
                <span aria-hidden="true">·</span>
                <span>{product.netWeight}</span>
              </div>

              <h2
                id="pdp-modal-title"
                className="font-display text-2xl sm:text-3xl font-bold text-[#1C1917] mt-2"
              >
                {product.name}
              </h2>

              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="text-xl font-semibold text-[#1C1917] tabular-nums">
                  {formatRupiah(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-[#78716C] line-through tabular-nums">
                    {formatRupiah(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#44403C]">
                {product.description}
              </p>

              <div className="mt-5 pt-5 border-t border-[#E5E2DC] space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-[#1C1917]">
                  <Check className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">{product.heroTopping}</strong> — {product.nutritionHighlight}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-[#1C1917]">
                  <Check className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
                  <span>Tanpa tambahan MSG &amp; proses masak lebih rendah minyak</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E5E2DC]">
                <p className="text-xs font-medium text-[#57534E]">Paling nikmat disantap dengan</p>
                <p className="mt-1 text-sm text-[#1C1917]">
                  {product.pairings.join(' · ')}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E2DC] flex items-center gap-3">
              <div className="inline-flex items-center border border-[#D6D3CD] rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Kurangi jumlah"
                  className="w-10 h-11 flex items-center justify-center text-[#1C1917] hover:bg-[#F3F1EC] rounded-l-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Tambah jumlah"
                  className="w-10 h-11 flex items-center justify-center text-[#1C1917] hover:bg-[#F3F1EC] rounded-r-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 h-11 px-5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap truncate"
              >
                Tambah · {formatRupiah(product.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
