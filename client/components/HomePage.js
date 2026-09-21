'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  Gift,
  ShieldCheck,
  Headphones,
  MoveRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';

import { hero } from '@/public/data/site.json';
import Testimonials from './Testimonials';

const icons = {
  Heart,
  Gift,
  ShieldCheck,
  Headphones
};

const normalizeProduct = product => ({
  ...product,
  id: product._id || product.id,
  image: product.images?.[0] || product.image
});

const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function HomePage() {
  const { items } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHomepageData() {
      try {
        setLoading(true);

        const [productData, categoryData] = await Promise.all([
          apiFetch('/api/products?limit=50'),
          apiFetch('/api/products/categories')
        ]);

        if (cancelled) {
          return;
        }

        setProducts(
          (productData.products || []).map(normalizeProduct)
        );

        setCategories(categoryData.categories || []);
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Failed to load homepage data:',
            error
          );

          setProducts([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHomepageData();

    return () => {
      cancelled = true;
    };
  }, []);

  const cartCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const best = useMemo(() => {
    return shuffle(
      products.filter(product => product.isFeatured === true)
    ).slice(0, 8);
  }, [products]);

  const newest = useMemo(() => {
    return shuffle(
      products.filter(product => product.isNewArrival === true)
    ).slice(0, 8);
  }, [products]);

  const businessProducts = products.slice(8, 12);

  return (
    <>
      <Header cartCount={cartCount} />

      <main>
        <section className="bg-[#fff7f3] md:p-0 p-3">
          <div className="md:min-h-142.5 md:mt-0 mt-50 container-width gap-5 relative">
            <div className="flex flex-col md:absolute top-1/2 -translate-y-1/2 left-0 z-10 justify-center">
              <span className="bg-rose-100 px-5 py-2 rounded-full w-fit text-xs font-semibold">
                {hero.eyebrow}
              </span>

              <h1 className="mt-10 text-5xl md:text-7xl font-semibold font-super">
                <p>Make Every Moment</p>
                <p className="text-rose-500">
                  More Special
                </p>
              </h1>

              <p className="max-w-lg w-full mt-5 text-slate-700">
                {hero.description}
              </p>

              <div className="flex mt-5 items-center gap-5">
                <Link
                  href="/shop"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all w-fit text-sm font-semibold"
                >
                  {hero.primaryCta}
                  <MoveRight size={18} />
                </Link>

                <Link
                  href="/categories"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 hover:bg-zinc-100 transition-all w-fit text-sm font-semibold"
                >
                  {hero.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="max-w-180 w-full aspect-video md:absolute top-1/2 -translate-y-1/2 right-0">
              <Image
                src="/images/hero.png"
                fill
                alt="Hero banner"
                className="select-none"
                priority
              />
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-width">
            <SectionHeading
              eyebrow="Shop by Category"
              title="Find Products for Every Need"
              description="Browse popular categories and discover what you need."
            />

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {loading ? (
                Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="mx-auto h-28 rounded-lg bg-slate-100 animate-pulse" />
                      <div className="mt-4 h-4 rounded bg-slate-100 animate-pulse" />
                      <div className="mt-2 h-3 w-20 mx-auto rounded bg-slate-100 animate-pulse" />
                    </div>
                  )
                )
              ) : (
                categories.map(item => (
                  <Link
                    key={item.slug}
                    href={`/shop?category=${encodeURIComponent(item.slug)}`}
                    aria-label={`Explore ${item.name}`}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c92532]/20 hover:shadow-xl md:p-7"
                  >
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#c92532]/5 transition-transform duration-500 group-hover:scale-150" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c92532]/10 text-[#c92532] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#c92532] group-hover:text-white">
                          <Sparkles size={25} strokeWidth={1.8} />
                        </div>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-300 group-hover:border-[#c92532] group-hover:bg-[#c92532] group-hover:text-white">
                          <ArrowUpRight
                            size={18}
                            className="transition-transform duration-300 group-hover:rotate-45"
                          />
                        </span>
                      </div>

                      <div className="mt-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c92532]">
                          {item.cartCount > 0
                            ? `${item.cartCount}+ Products`
                            : 'Explore Products'}
                        </p>

                        <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
                          {item.name}
                        </h2>

                        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors duration-300 group-hover:text-[#c92532]">
                          Explore Collection
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 section-pad">
          <div className="container-width">
            <SectionHeading
              eyebrow="Customer Favorites"
              title="Best Sellers"
              description="Products our customers keep coming back for."
              action="View All"
              href="/shop?best=true"
            />

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white border border-slate-200 overflow-hidden"
                    >
                      <div className="aspect-square bg-slate-100 animate-pulse" />
                      <div className="p-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        <div className="mt-3 h-4 w-20 bg-slate-100 rounded animate-pulse" />
                      </div>
                    </div>
                  )
                )
                : best.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-[#fff7f3]">
          <div className="container-width">
            <SectionHeading
              eyebrow="Just Added"
              title="New Arrivals"
              description="Fresh products added to our store."
              action="Explore New"
              href="/shop?new=true"
            />

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white border border-slate-200 overflow-hidden"
                    >
                      <div className="aspect-square bg-slate-100 animate-pulse" />
                      <div className="p-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        <div className="mt-3 h-4 w-20 bg-slate-100 rounded animate-pulse" />
                      </div>
                    </div>
                  )
                )
                : newest.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="container-width">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c92532]">
                Why Gift Zone
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                A Better Way to Shop
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
                Everything we do is focused on making your online shopping
                experience simple, reliable and convenient.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Quality Products',
                  text: 'Carefully selected products with reliable quality.',
                  icon: 'Gift'
                },
                {
                  title: 'Secure Shopping',
                  text: 'A safe and reliable shopping experience for every order.',
                  icon: 'ShieldCheck'
                },
                {
                  title: 'Customer First',
                  text: 'We focus on making every customer experience better.',
                  icon: 'Heart'
                },
                {
                  title: 'Dedicated Support',
                  text: 'Get help whenever you need assistance with your order.',
                  icon: 'Headphones'
                }
              ].map((item, index) => {
                const Icon = icons[item.icon] || Gift;

                return (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                  >
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-50 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff0ed] text-[#c92532] transition duration-300 group-hover:scale-105 group-hover:bg-[#c92532] group-hover:text-white">
                          <Icon
                            size={21}
                            strokeWidth={2}
                          />
                        </div>

                        <span className="text-xs font-bold tracking-widest text-slate-200 transition duration-300 group-hover:text-red-100">
                          0{index + 1}
                        </span>
                      </div>

                      <h3 className="mt-6 text-lg font-extrabold tracking-tight text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.text}
                      </p>

                      <div className="mt-6 h-px w-10 bg-[#c92532] transition-all duration-300 group-hover:w-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-pad bg-slate-50">
          <div className="container-width">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c92532]">
                Loved by Customers
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                What Our Customers Say
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
                See what shoppers have to say about their experience with
                Gift Zone.
              </p>
            </div>

            <Testimonials />
          </div>
        </section>

        <section className="section-pad">
          <div className="container-width">
            <div className="relative overflow-hidden rounded-3xl bg-[#0d1a2a] text-white">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c92532]/20 blur-3xl" />
              <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

              <div className="relative grid lg:grid-cols-2">
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
                  <div>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4b8bd]">
                      Business & Bulk Orders
                    </span>

                    <h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-[42px]">
                      Product solutions for every business need.
                    </h2>

                    <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
                      Order in bulk, explore workplace essentials, and get
                      dedicated support from our team for larger requirements.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm font-bold">
                        Bulk Orders
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Flexible quantities
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm font-bold">
                        Business Support
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Dedicated assistance
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/contact?subject=bulk"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0d1a2a] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f8f8f8] hover:shadow-lg"
                  >
                    Talk to our team

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>

                <div className="relative p-5 md:p-8 lg:p-10">
                  <div className="grid grid-cols-2 gap-4">
                    {businessProducts.map(
                      (product, index) => (
                        <div
                          key={product.id}
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                        >
                          <img
                            src={product.image}
                            alt={
                              product.name ||
                              'Featured product'
                            }
                            loading={
                              index < 2
                                ? 'eager'
                                : 'lazy'
                            }
                            className="h-40 w-full object-cover transition duration-500 group-hover:scale-105 md:h-48"
                          />

                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3 pt-10">
                            <p className="truncate text-xs font-semibold text-white">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}