export type ProductId =
  | 'korek-ijo-kelor'
  | 'korek-teri'
  | 'korek-kecombrang'
  | 'paket-trio';

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  level: 1 | 2 | 3 | 'combo';
  levelLabel: string;
  spiceDescription: string;
  price: number;
  compareAtPrice?: number;
  netWeight: string;
  heroTopping: string;
  nutritionHighlight: string;
  tagline: string;
  description: string;
  pairings: string[];
  image: string;
  accentHex: string;
}

export interface CartItem {
  productId: ProductId;
  quantity: number;
}

export type PaymentMethod = 'QRIS' | 'COD (Bayar di Tempat)' | 'Transfer Bank';

export type DemoOrderStatus =
  | 'Menunggu Konfirmasi'
  | 'Sedang Dikemas'
  | 'Dalam Pengiriman'
  | 'Pesanan Tiba';

export interface DemoOrderCustomer {
  name: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  note: string;
}

export interface DemoOrderLine {
  productId: ProductId;
  name: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface DemoOrder {
  id: string;
  createdAt: string;
  status: DemoOrderStatus;
  customer: DemoOrderCustomer;
  items: DemoOrderLine[];
  subtotal: number;
  bundleDiscount: number;
  total: number;
}
