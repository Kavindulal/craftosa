export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
};

const KEY = "craftosa_cart";
export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value as CartItem[] : [];
  } catch { return []; }
}
export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("craftosa-cart-updated"));
}
export function addToCart(item: Omit<CartItem, "quantity">, quantity: number) {
  const cart = readCart();
  const existing = cart.find((row) => row.productId === item.productId);
  if (existing) existing.quantity = Math.min(item.stock, existing.quantity + quantity);
  else cart.push({ ...item, quantity: Math.min(item.stock, quantity) });
  saveCart(cart);
}
