import { useEffect, useState } from 'react';
import {
  Check,
  Eye,
  Flame,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { DemoOrderHistory } from './components/DemoOrderHistory';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ResilientImage } from './components/ResilientImage';
import { SpiceMeter } from './components/SpiceMeter';
import {
  ALL_PRODUCTS_MAP,
  HERO_BANNER_IMAGE,
  PRODUCTS,
  TRIO_PRODUCT,
  calculateCartTotals,
  formatRupiah,
} from './data/products';
import {
  CartItem,
  DemoOrder,
  DemoOrderCustomer,
  DemoOrderStatus,
  Product,
  ProductId,
} from './types/order';

type SpiceFilter = 'all' | 1 | 2 | 3;

const STORAGE_ORDERS_KEY = 'cabe_cilik_demo_orders_v1';
const STORAGE_CART_KEY = 'cabe_cilik_demo_cart_v1';

const STATUS_SEQUENCE: DemoOrderStatus[] = [
  'Menunggu Konfirmasi',
  'Sedang Dikemas',
  'Dalam Pengiriman',
  'Pesanan Tiba',
];

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [demoOrders, setDemoOrders] = useState<DemoOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      return saved ? (JSON.parse(saved) as DemoOrder[]) : [];
    } catch {
      return [];
    }
  });

  const [spiceFilter, setSpiceFilter] = useState<SpiceFilter>('all');
  const [selectedSpiceGuideId, setSelectedSpiceGuideId] =
    useState<ProductId>('korek-teri');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(demoOrders));
    } catch {
      // Ignore storage quota errors
    }
  }, [demoOrders]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const cartTotals = calculateCartTotals(cart);

  const handleAddToCart = (productId: ProductId, quantity = 1) => {
    const product = ALL_PRODUCTS_MAP[productId];
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
    if (product) {
      setToastMessage(`${product.name} ditambahkan ke keranjang`);
    }
  };

  const handleUpdateQuantity = (productId: ProductId, nextQty: number) => {
    if (nextQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: nextQty } : item
      )
    );
  };

  const handleRemoveItem = (productId: ProductId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handlePlaceDemoOrder = (customer: DemoOrderCustomer): DemoOrder => {
    const totals = calculateCartTotals(cart);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const formattedDate = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newOrder: DemoOrder = {
      id: `#CC-${randomCode}`,
      createdAt: formattedDate,
      status: 'Menunggu Konfirmasi',
      customer,
      items: cart.map((item) => {
        const product = ALL_PRODUCTS_MAP[item.productId];
        return {
          productId: item.productId,
          name: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          image: product.image,
        };
      }),
      subtotal: totals.subtotal,
      bundleDiscount: totals.bundleDiscount,
      total: totals.total,
    };

    setDemoOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  const hasActiveOrder = demoOrders.some(
    (order) => order.status !== 'Pesanan Tiba'
  );

  useEffect(() => {
    if (!hasActiveOrder) return;
    const interval = window.setInterval(() => {
      setDemoOrders((prev) =>
        prev.map((order) => {
          const idx = STATUS_SEQUENCE.indexOf(order.status);
          if (idx === -1 || idx >= STATUS_SEQUENCE.length - 1) {
            return order;
          }
          return { ...order, status: STATUS_SEQUENCE[idx + 1] };
        })
      );
    }, 4500);
    return () => window.clearInterval(interval);
  }, [hasActiveOrder]);

  const handleReorder = (order: DemoOrder) => {
    setCart((prev) => {
      const updated = [...prev];
      for (const line of order.items) {
        const idx = updated.findIndex((c) => c.productId === line.productId);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + line.quantity,
          };
        } else {
          updated.push({
            productId: line.productId,
            quantity: line.quantity,
          });
        }
      }
      return updated;
    });
    setIsCartOpen(true);
  };

  const handleClearHistory = () => {
    setDemoOrders([]);
  };

  const scrollToTracker = () => {
    const el = document.getElementById('pesanan-saya');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts =
    spiceFilter === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.level === spiceFilter);

  const activeGuideProduct =
    ALL_PRODUCTS_MAP[selectedSpiceGuideId] || PRODUCTS[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1917]">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E5E2DC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0"
          >
            Cabe Cilik
          </a>

          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
          >
            <a
              href="#varian"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Varian
            </a>
            <a
              href="#paket-trio"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Paket Trio
            </a>
            <a
              href="#keunggulan"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Keunggulan
            </a>
            <a
              href="#pesanan-saya"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Pesanan Saya
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Keranjang</span>
              <span className="tabular-nums">({cartTotals.totalJars})</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Section 1: Storefront Hero */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-center">
                <p className="text-xs font-medium text-[#57534E]">
                  Sambal Kemasan Jar · Tanpa Tambahan MSG · Lebih Rendah Minyak
                </p>

                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1C1917] mt-3 leading-[1.1] text-balance">
                  Cilik-cilik Nendang!
                </h1>

                <p className="mt-4 text-base text-[#44403C] leading-relaxed">
                  Sambal korek rumahan yang aromatik, gurih, dan bikin nagih. Hadir dalam 3 level pedas dengan taburan asli kelor krispi, teri krispi, dan ikan tongkol—dimasak tanpa MSG dan minyak lebih sedikit.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#varian"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    Pilih Varian Sambal
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart('paket-trio', 1);
                      setIsCartOpen(true);
                    }}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white border border-[#D6D3CD] hover:border-[#1C1917] text-[#1C1917] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Pesan 3 Varian · Rp79.000
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E5E2DC] grid grid-cols-3 gap-4 text-left">
                  <div>
                    <p className="text-sm font-bold text-[#1C1917] tabular-nums">Rp28.000</p>
                    <p className="text-xs text-[#57534E] mt-0.5">Harga per jar 100 g</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1C1917] tabular-nums">Rp79.000</p>
                    <p className="text-xs text-[#57534E] mt-0.5">Beli ketiganya hemat</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1C1917]">Tanpa MSG</p>
                    <p className="text-xs text-[#57534E] mt-0.5">Minyak lebih sedikit</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="w-full h-full min-h-[260px] sm:min-h-[360px] rounded-xl overflow-hidden border border-[#E5E2DC] bg-[#F3F1EC]">
                  <ResilientImage
                    src={HERO_BANNER_IMAGE}
                    alt="Tiga varian sambal Cabe Cilik: Korek Ijo Kelor, Korek Teri, dan Korek Kecombrang"
                    fallbackTitle="Cabe Cilik — Cilik-cilik Nendang!"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Featured Product Collection & Paket Trio */}
        <section id="varian" className="py-14 sm:py-18 border-t border-[#E5E2DC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-xs font-medium text-[#B91C1C]">Katalog Sambal Cabe Cilik</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                  Pilih Level Pedas Favoritmu
                </h2>
              </div>

              {/* Interactive Spice Level Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filter level pedas"
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F3F1EC] border border-[#E5E2DC] self-start md:self-auto overflow-x-auto max-w-full"
              >
                {[
                  { id: 'all' as SpiceFilter, label: 'Semua Varian' },
                  { id: 1 as SpiceFilter, label: 'Level 1' },
                  { id: 2 as SpiceFilter, label: 'Level 2' },
                  { id: 3 as SpiceFilter, label: 'Level 3' },
                ].map((tab) => (
                  <button
                    key={String(tab.id)}
                    type="button"
                    role="tab"
                    aria-selected={spiceFilter === tab.id}
                    onClick={() => setSpiceFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      spiceFilter === tab.id
                        ? 'bg-white text-[#1C1917] shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Column Product Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group bg-white border border-[#E5E2DC] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setDetailProduct(product)}
                    className="relative aspect-[4/5] w-full bg-[#F3F1EC] overflow-hidden text-left cursor-pointer"
                    aria-label={`Lihat detail ${product.name}`}
                  >
                    <ResilientImage
                      src={product.image}
                      alt={`${product.name} - ${product.levelLabel}`}
                      fallbackTitle={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </button>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#57534E]">
                        <SpiceMeter level={product.level} label={product.levelLabel} />
                        <span className="tabular-nums">{product.netWeight}</span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-[#1C1917] mt-2">
                        {product.name}
                      </h3>

                      <p className="text-xs font-medium text-[#57534E] mt-1">
                        {product.spiceDescription}
                      </p>

                      <p className="text-sm text-[#44403C] mt-3 leading-relaxed">
                        <strong className="font-semibold text-[#1C1917]">
                          {product.heroTopping}
                        </strong>{' '}
                        · {product.nutritionHighlight}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E5E2DC] flex items-center justify-between gap-3">
                      <span className="text-base font-bold text-[#1C1917] tabular-nums">
                        {formatRupiah(product.price)}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setDetailProduct(product)}
                          aria-label={`Detail ${product.name}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#D6D3CD] hover:border-[#1C1917] text-[#1C1917] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product.id, 1)}
                          className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pesan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Paket Trio Lengkap Banner Card */}
            <div
              id="paket-trio"
              className="mt-10 rounded-xl bg-white border border-[#E5E2DC] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
            >
              <div className="lg:col-span-6 bg-[#F3F1EC] min-h-[240px] sm:min-h-[300px]">
                <ResilientImage
                  src={TRIO_PRODUCT.image}
                  alt="Paket 3 Varian Lengkap Cabe Cilik"
                  fallbackTitle="Paket 3 Varian Lengkap"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs font-medium text-[#B91C1C]">
                    Paket Hemat · 3 Jar × 100 g
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1.5">
                    {TRIO_PRODUCT.name}
                  </h3>
                  <p className="text-sm text-[#44403C] mt-3 leading-relaxed">
                    {TRIO_PRODUCT.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span>Korek Ijo Kelor (Level 1 · Zat Besi Kelor Crispy)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#B91C1C] shrink-0" />
                      <span>Korek Teri (Level 2 · Protein Ikan Teri Crispy)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#9D174D] shrink-0" />
                      <span>Korek Kecombrang (Level 3 · Protein Ikan Tongkol)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E2DC] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl font-bold text-[#1C1917] tabular-nums">
                        {formatRupiah(TRIO_PRODUCT.price)}
                      </span>
                      <span className="text-sm text-[#78716C] line-through tabular-nums">
                        {formatRupiah(TRIO_PRODUCT.compareAtPrice || 84000)}
                      </span>
                    </div>
                    <p className="text-xs text-[#15803D] font-medium mt-0.5">
                      Hemat Rp5.000 dibanding beli satuan
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart('paket-trio', 1)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1C1917] hover:bg-[#292524] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Paket Trio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Keunggulan Produk & Pencocok Level Pedas Interaktif */}
        <section id="keunggulan" className="py-16 sm:py-20 border-t border-[#E5E2DC] bg-[#F3F1EC]/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-[#B91C1C]">Kenapa Cabe Cilik Berbeda</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                Pedasnya Nendang, Kandungannya Tetap Terjaga
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white border border-[#E5E2DC]">
                <p className="text-xs font-semibold text-[#57534E]">01 · Gurih Alami</p>
                <h3 className="font-display text-lg font-bold text-[#1C1917] mt-2">
                  Tanpa Tambahan MSG
                </h3>
                <p className="text-sm text-[#44403C] mt-2 leading-relaxed">
                  Cita rasa gurih muncul langsung dari bahan asli—bawang, rempah segar, dan taburan ikan teri, tongkol, serta daun kelor tanpa penyedap buatan.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-[#E5E2DC]">
                <p className="text-xs font-semibold text-[#57534E]">02 · Lebih Ringan</p>
                <h3 className="font-display text-lg font-bold text-[#1C1917] mt-2">
                  Minyak Lebih Sedikit
                </h3>
                <p className="text-sm text-[#44403C] mt-2 leading-relaxed">
                  Diracik dengan minyak yang jauh lebih terkontrol dibanding sambal jar biasa, sehingga tidak bikin enek dan tetap nyaman dinikmati tiap makan.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-[#E5E2DC]">
                <p className="text-xs font-semibold text-[#57534E]">03 · Topping Bernutrisi</p>
                <h3 className="font-display text-lg font-bold text-[#1C1917] mt-2">
                  Sumber Zat Besi &amp; Protein
                </h3>
                <p className="text-sm text-[#44403C] mt-2 leading-relaxed">
                  Setiap varian punya nilai tambah: kelor krispi kaya zat besi, ikan teri krispi sumber protein, dan suwiran tongkol sumber protein.
                </p>
              </div>
            </div>

            {/* Interactive Spice Picker Helper */}
            <div className="mt-8 p-6 sm:p-8 rounded-xl bg-white border border-[#E5E2DC] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B91C1C]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Panduan Pilih Varian</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#1C1917] mt-1.5">
                  Sesuaikan dengan selera pedasmu
                </h3>
                <div className="mt-4 flex flex-col gap-2">
                  {PRODUCTS.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedSpiceGuideId(variant.id)}
                      className={`px-4 py-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        selectedSpiceGuideId === variant.id
                          ? 'bg-[#FAF9F6] border-[#B91C1C] text-[#1C1917]'
                          : 'bg-white border-[#E5E2DC] text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      <span className="text-sm font-semibold">{variant.name}</span>
                      <span className="text-xs whitespace-nowrap">{variant.levelLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col sm:flex-row gap-5 items-center bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E2DC]">
                <div className="w-28 h-32 rounded-lg overflow-hidden bg-[#F3F1EC] shrink-0">
                  <ResilientImage
                    src={activeGuideProduct.image}
                    alt={activeGuideProduct.name}
                    fallbackTitle={activeGuideProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <SpiceMeter
                    level={activeGuideProduct.level}
                    label={activeGuideProduct.levelLabel}
                  />
                  <h4 className="font-display text-lg font-bold text-[#1C1917] mt-1.5">
                    {activeGuideProduct.name}
                  </h4>
                  <p className="text-sm text-[#44403C] mt-1 leading-relaxed">
                    {activeGuideProduct.tagline}
                  </p>
                  <p className="text-xs text-[#57534E] mt-2">
                    Cocok dengan: {activeGuideProduct.pairings.join(', ')}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(activeGuideProduct.id, 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah · {formatRupiah(activeGuideProduct.price)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailProduct(activeGuideProduct)}
                      className="text-xs font-semibold text-[#1C1917] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                    >
                      Lihat Komposisi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Order History & Live Status */}
        <DemoOrderHistory
          orders={demoOrders}
          onReorder={handleReorder}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E5E2DC] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#57534E]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#B91C1C]" />
            <span className="font-semibold text-[#1C1917]">Cabe Cilik</span>
            <span aria-hidden="true">·</span>
            <span>Cilik-cilik Nendang!</span>
          </div>
          <p>
            Tanpa Tambahan MSG · Minyak Lebih Sedikit · Sambal Kemasan Jar
          </p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1C1917] text-white text-xs font-medium shadow-xl"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setIsCartOpen(true);
            }}
            className="text-[#FCA5A5] hover:text-white font-semibold underline underline-offset-2 cursor-pointer whitespace-nowrap"
          >
            Buka Keranjang
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-Over Cart & Demo Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddMissingVariant={(id) => handleAddToCart(id, 1)}
        onPlaceDemoOrder={handlePlaceDemoOrder}
        onNavigateToTracker={scrollToTracker}
      />
    </div>
  );
}
