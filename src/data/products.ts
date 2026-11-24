import { CartItem, Product, ProductId } from '../types/order';

export const HERO_BANNER_IMAGE = '/assets/aistudio/file_00000000f4cc8211b2bdd4c21e5ba1bc_add4674b.png';
export const TRIO_LINEUP_IMAGE = '/assets/aistudio/IMG-20261124-WA0006_7a020fa5.jpg';

export const SINGLE_JAR_PRICE = 28000;
export const TRIO_BUNDLE_PRICE = 79000;
export const TRIO_SAVINGS = SINGLE_JAR_PRICE * 3 - TRIO_BUNDLE_PRICE; // Rp5.000

export const PRODUCTS: Product[] = [
  {
    id: 'korek-ijo-kelor',
    name: 'Korek Ijo Kelor',
    shortName: 'Ijo Kelor',
    level: 1,
    levelLabel: 'Level 1 · Cilik',
    spiceDescription: 'Gak terlalu pedas, segar & gurih',
    price: SINGLE_JAR_PRICE,
    netWeight: '100 g',
    heroTopping: 'Taburan Kelor Crispy',
    nutritionHighlight: 'Sumber Zat Besi Alami',
    tagline: 'Pedas ramah di lidah dengan renyahnya daun kelor kaya zat besi.',
    description:
      'Dibuat dari cabai hijau pilihan yang diulek kasar tanpa tambahan MSG dan dengan minyak lebih sedikit. Dilengkapi taburan daun kelor crispy yang renyah dan kaya zat besi—cocok untuk penikmat pedas ringan.',
    pairings: ['Nasi hangat & ayam bakar', 'Ikan goreng & lalapan', 'Tahu tempe bacem'],
    image: '/assets/aistudio/IMG-20261116-WA0020_1__2bdff72c.jpg',
    accentHex: '#15803D',
  },
  {
    id: 'korek-teri',
    name: 'Korek Teri',
    shortName: 'Korek Teri',
    level: 2,
    levelLabel: 'Level 2 · Nendang',
    spiceDescription: 'Pedas pas & bikin nagih',
    price: SINGLE_JAR_PRICE,
    netWeight: '100 g',
    heroTopping: 'Taburan Teri Crispy',
    nutritionHighlight: 'Kaya Protein dari Ikan Teri',
    tagline: 'Pedas menggigit berpadu gurihnya ikan teri crispy sumber protein.',
    description:
      'Perpaduan cabai rawit merah dan bawang goreng harum dengan kadar minyak rendah tanpa MSG. Ditambah ikan teri crispy melimpah yang gurih alami sekaligus menjadi sumber protein harian.',
    pairings: ['Nasi uduk & ayam goreng krispi', 'Telur dadar barendo', 'Mie goreng & nasi bakar'],
    image: '/assets/aistudio/IMG-20261116-WA0022_1__bca1a555.jpg',
    accentHex: '#B91C1C',
  },
  {
    id: 'korek-kecombrang',
    name: 'Korek Kecombrang',
    shortName: 'Kecombrang',
    level: 3,
    levelLabel: 'Level 3 · Meledak',
    spiceDescription: 'Pedes banget tapi nagih & aromatik',
    price: SINGLE_JAR_PRICE,
    netWeight: '100 g',
    heroTopping: 'Taburan Ikan Tongkol',
    nutritionHighlight: 'Tambahan Protein Ikan Tongkol',
    tagline: 'Ledakan pedas Level 3 dengan aroma segar kecombrang & suwiran tongkol.',
    description:
      'Untuk pecinta pedas sejati! Racikan cabai rawit merah ekstra pedas, irisan bunga kecombrang yang wangi semerbak, serta suwiran ikan tongkol gurih sebagai sumber protein—tetap tanpa MSG dan lebih rendah minyak.',
    pairings: ['Nasi liwet & ikan asin', 'Bebek goreng sambal', 'Tumis kangkung & nasi putih'],
    image: '/assets/aistudio/IMG-20261116-WA0021_1__1d8b4b98.jpg',
    accentHex: '#9D174D',
  },
];

export const TRIO_PRODUCT: Product = {
  id: 'paket-trio',
  name: 'Paket 3 Varian Lengkap',
  shortName: 'Paket Trio',
  level: 'combo',
  levelLabel: 'Level 1, 2 & 3 · Hemat Rp5.000',
  spiceDescription: 'Semua 3 varian dalam satu paket lengkap',
  price: TRIO_BUNDLE_PRICE,
  compareAtPrice: SINGLE_JAR_PRICE * 3,
  netWeight: '3 × 100 g',
  heroTopping: 'Kelor Crispy + Teri Crispy + Ikan Tongkol',
  nutritionHighlight: 'Zat Besi & Protein Lengkap',
  tagline: 'Bawa pulang Korek Ijo Kelor, Korek Teri, dan Korek Kecombrang sekaligus.',
  description:
    'Paket paling pas untuk stok di rumah atau dibagi bareng keluarga. Dapatkan ketiga level kepedasan Cabe Cilik dalam satu paket seharga Rp79.000 (hemat Rp5.000 dibanding beli satuan).',
  pairings: ['Stok lauk harian keluarga', 'Hampers kuliner sehat tanpa MSG', 'Coba semua level pedas'],
  image: TRIO_LINEUP_IMAGE,
  accentHex: '#B91C1C',
};

export const ALL_PRODUCTS_MAP: Record<ProductId, Product> = {
  'korek-ijo-kelor': PRODUCTS[0],
  'korek-teri': PRODUCTS[1],
  'korek-kecombrang': PRODUCTS[2],
  'paket-trio': TRIO_PRODUCT,
};

export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

export interface CartTotals {
  subtotal: number;
  autoTrioSets: number;
  bundleDiscount: number;
  total: number;
  totalJars: number;
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  let subtotal = 0;
  let totalJars = 0;

  const singleCounts: Record<'korek-ijo-kelor' | 'korek-teri' | 'korek-kecombrang', number> = {
    'korek-ijo-kelor': 0,
    'korek-teri': 0,
    'korek-kecombrang': 0,
  };

  for (const item of items) {
    const product = ALL_PRODUCTS_MAP[item.productId];
    if (!product || item.quantity <= 0) continue;
    subtotal += product.price * item.quantity;

    if (item.productId === 'paket-trio') {
      totalJars += item.quantity * 3;
    } else {
      totalJars += item.quantity;
      singleCounts[item.productId] += item.quantity;
    }
  }

  // If user adds all 3 individual variants, automatically apply the Rp79.000 trio bundle price (Rp5.000 off per set)
  const autoTrioSets = Math.min(
    singleCounts['korek-ijo-kelor'],
    singleCounts['korek-teri'],
    singleCounts['korek-kecombrang']
  );
  const bundleDiscount = autoTrioSets * TRIO_SAVINGS;
  const total = Math.max(0, subtotal - bundleDiscount);

  return {
    subtotal,
    autoTrioSets,
    bundleDiscount,
    total,
    totalJars,
  };
}
