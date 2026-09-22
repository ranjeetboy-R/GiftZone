'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

// const FREE_SHIPPING = 999;
// const SHIPPING_FEE = 0;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart } = useCart();
  // const [coupon, setCoupon] = useState('');
  // const [couponMessage, setCouponMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  // const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(Number(item.quantity) || 0, 0);

      return sum + price * quantity;
    }, 0);
  }, [items]);

  // const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - Math.min(discount, subtotal));
  const cartCount = items.reduce(
    (sum, item) => sum + Math.max(Number(item.quantity) || 0, 0),
    0
  );

  const hasOutOfStockItem = items.some(
    item => Number(item.stock) === 0
  );

  // const applyCoupon = async () => {
  //   const code = coupon.trim().toUpperCase();

  //   if (!code) {
  //     setDiscount(0);
  //     setCouponMessage('Please enter a coupon code.');
  //     return;
  //   }

  //   try {
  //     setCouponLoading(true);
  //     setCouponMessage('');

  //     const response = await fetch('/data/coupons.json');

  //     if (!response.ok) {
  //       throw new Error('Failed to load coupons.');
  //     }

  //     const coupons = await response.json();

  //     const found = coupons.find(
  //       item => item.code?.toUpperCase() === code && item.active
  //     );

  //     if (!found) {
  //       setDiscount(0);
  //       setCouponMessage('Invalid or inactive coupon.');
  //       return;
  //     }

  //     const minimumOrder = Number(found.minOrder) || 0;

  //     if (subtotal < minimumOrder) {
  //       setDiscount(0);
  //       setCouponMessage(
  //         `Minimum order value is ₹${minimumOrder.toLocaleString('en-IN')}.`
  //       );
  //       return;
  //     }

  //     let value = 0;

  //     if (found.type === 'percent') {
  //       const percentageDiscount = subtotal * Number(found.value || 0) / 100;
  //       const maxDiscount = Number(found.maxDiscount) || subtotal;

  //       value = Math.min(
  //         percentageDiscount,
  //         maxDiscount
  //       );
  //     } else {
  //       value = Number(found.value) || 0;
  //     }

  //     value = Math.min(
  //       Math.max(Math.round(value), 0),
  //       subtotal + shipping
  //     );

  //     setDiscount(value);

  //     setCouponMessage(
  //       `${found.code} applied. You saved ₹${value.toLocaleString('en-IN')}.`
  //     );
  //   } catch (error) {
  //     console.error('Failed to apply coupon:', error);
  //     setDiscount(0);
  //     setCouponMessage('Unable to apply coupon. Please try again.');
  //   } finally {
  //     setCouponLoading(false);
  //   }
  // };

  return (
    <>
      <Header cartCount={cartCount} />

      <main className="section-pad">
        <div className="container-width">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c92532]">
              Your Selection
            </p>

            <h1 className="mt-2 text-4xl font-extrabold">
              Shopping Cart
            </h1>
          </div>

          {!items.length ? (
            <div className="py-24 text-center">
              <div className="text-7xl">🛒</div>

              <h2 className="mt-5 text-2xl font-bold">
                Your cart is empty
              </h2>

              <p className="mt-2 text-slate-500">
                Discover something special for someone special.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex rounded-md bg-[#c92532] px-6 py-3 text-sm font-bold text-white"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
              <section className="grid gap-4">
                {items.map(item => {
                  const itemId = item.id || item._id || item.slug;
                  const image = item.images?.[0] || item.image;
                  const price = Number(item.price) || 0;
                  const quantity = Math.max(Number(item.quantity) || 1, 1);
                  const stock = Number(item.stock);
                  const hasStockLimit = Number.isFinite(stock);
                  const isOutOfStock = hasStockLimit && stock <= 0;
                  const isMaxQuantity = hasStockLimit && quantity >= stock;

                  return (
                    <div
                      key={itemId}
                      className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <img
                        src={image}
                        alt={item.name || 'Product'}
                        className="h-28 w-28 rounded-lg bg-[#fff7f3] object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/product/${item.slug || item.id || item._id}`}
                            >
                              <h3 className="font-bold hover:text-[#c92532]">
                                {item.name}
                              </h3>
                            </Link>

                            <p className="mt-1 text-sm text-slate-500">
                              ₹{price.toLocaleString('en-IN')} each
                            </p>

                            {isOutOfStock && (
                              <p className="mt-1 text-xs font-semibold text-red-600">
                                Out of stock
                              </p>
                            )}

                            {!isOutOfStock && hasStockLimit && stock <= 5 && (
                              <p className="mt-1 text-xs font-semibold text-orange-600">
                                Only {stock} left
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(itemId)}
                            aria-label={`Remove ${item.name || 'product'} from cart`}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div className="flex items-center rounded-md border">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemId, Math.max(1, quantity - 1))}
                              disabled={quantity <= 1 || isOutOfStock}
                              aria-label="Decrease quantity"
                              className="p-2 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="w-10 text-center text-sm font-bold">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(itemId, quantity + 1)}
                              disabled={isOutOfStock || isMaxQuantity}
                              aria-label="Increase quantity"
                              className="p-2 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <strong>
                            ₹{(price * quantity).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/shop"
                  className="text-sm font-bold text-[#c92532]"
                >
                  ← Continue Shopping
                </Link>
              </section>

              <aside className="h-fit rounded-xl border border-slate-200 p-6 lg:sticky lg:top-28">
                <h2 className="text-xl font-extrabold">
                  Order Summary
                </h2>

                <div className="mt-5 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free </span>
                </div>

                {/* <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Tag size={16} />
                    Coupon Code
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      value={coupon}
                      onChange={event => {
                        setCoupon(event.target.value);
                        setCouponMessage('');
                      }}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          applyCoupon();
                        }
                      }}
                      placeholder="WELCOME10"
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-md border px-3 py-2.5 text-sm"
                    />

                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                      className="rounded-md bg-slate-900 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>

                  {couponMessage && (
                    <p className="mt-2 text-xs font-semibold text-[#c92532]">
                      {couponMessage}
                    </p>
                  )}
                </div> */}

                {discount > 0 && (
                  <div className="mt-3 flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>
                      -₹{discount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="my-5 border-t" />

                <div className="flex justify-between text-lg font-extrabold">
                  <span>Total</span>
                  <span>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Taxes are included in listed prices.
                </p>

                {hasOutOfStockItem && (
                  <p className="mt-3 rounded-md bg-red-50 p-3 text-xs font-semibold text-red-600">
                    Please remove out-of-stock products before proceeding to checkout.
                  </p>
                )}

                <Link
                  href={hasOutOfStockItem ? '#' : `/checkout?cart=${cartCount}`}
                  onClick={event => {
                    if (hasOutOfStockItem) {
                      event.preventDefault();
                    }
                  }}
                  aria-disabled={hasOutOfStockItem}
                  className={`mt-6 flex items-center justify-center gap-2 rounded-md py-3.5 text-sm font-bold text-white ${hasOutOfStockItem
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-[#c92532]'
                    }`}
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
