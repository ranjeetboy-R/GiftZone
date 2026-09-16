'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LoadingGrid from '@/components/LoadingGrid';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';

export default function ShopPage() {
  const { items } = useCart();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [wishlistOnly, setWishlistOnly] = useState(false);

  const pageSize = 8;

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || '';
    const currentSort =
      searchParams.get('sort') ||
      (searchParams.get('best') === 'true' ? 'rating' : 'newest');
    const currentPage = Math.max(
      Number(searchParams.get('page')) || 1,
      1
    );

    setSearch(currentSearch);
    setCategory(currentCategory);
    setSort(currentSort);
    setPage(currentPage);
  }, [searchParams]);

  useEffect(() => {
    fetch('/data/categories.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load categories');
        }

        return response.json();
      })
      .then(data => {
        setCategories(data || []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    params.set('page', String(page));
    params.set('limit', String(pageSize));

    if (search.trim()) {
      params.set('search', search.trim());
    }

    if (category) {
      params.set('category', category);
    }

    if (searchParams.get('new') === 'true') {
      params.set('new', 'true');
    }

    if (searchParams.get('best') === 'true') {
      params.set('best', 'true');
    }

    if (sort && sort !== 'newest') {
      params.set('sort', sort);
    }

    setLoading(true);
    setError('');

    apiFetch(`/api/products?${params.toString()}`)
      .then(data => {
        const products = data.products || [];
        const pagination = data.pagination || {};

        setCatalog(products);
        setTotalProducts(pagination.total || 0);
        setPages(Math.max(pagination.pages || 1, 1));
      })
      .catch(() => {
        setCatalog([]);
        setTotalProducts(0);
        setPages(1);
        setError('Unable to load catalog.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, search, category, sort, searchParams]);

  const updateUrl = (changes) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(changes).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete('page');

    router.push(
      `/shop${params.toString() ? `?${params.toString()}` : ''}`
    );
  };

  const changePage = nextPage => {
    if (nextPage < 1 || nextPage > pages || nextPage === page) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (nextPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }

    router.push(
      `/shop${params.toString() ? `?${params.toString()}` : ''}`
    );
  };

  const getWishlistIds = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('gift-zone-wishlist') || '[]'
      );

      return new Set(
        saved.map(item => item.id || item._id || item.slug)
      );
    } catch {
      return new Set();
    }
  };

  const visibleProducts = wishlistOnly
    ? catalog.filter(product =>
      getWishlistIds().has(
        product.id || product._id || product.slug
      )
    )
    : catalog;

  const cartCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <Header cartCount={cartCount} />

      <main className="section-pad">
        <div className="container-width">
          <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-28">
              <h2 className="font-bold">
                Filters
              </h2>

              <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Search
              </label>

              <input
                value={search}
                onChange={event =>
                  updateUrl({
                    search: event.target.value
                  })
                }
                placeholder="Search products"
                className="mt-2 w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-[#c92532]"
              />

              <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Category
              </label>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateUrl({
                    category: ""
                  })}
                  className={`text-left border border-slate-200 hover:border-slate-300 transition-all hover:bg-slate-50 w-fit px-3 py-1 rounded-lg text-sm ${!category
                    ? 'font-bold text-[#c92532]'
                    : ''
                    }`}
                >
                  All Categories
                </button>

                {categories.map(item => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => updateUrl({
                      category: item.slug
                    })
                    }
                    className={`text-left border border-slate-200 hover:border-slate-300 transition-all hover:bg-slate-50 w-fit px-3 py-1 rounded-lg text-sm ${category === item.slug
                      ? 'font-bold bg-slate-50 text-rose-600 border-slate-300'
                      : ''
                      }`}
                  >
                    {item.name}{' '}
                    <span className="text-slate-400">
                      ({item.count})
                    </span>
                  </button>
                ))}
              </div>

              <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={wishlistOnly}
                  onChange={event =>
                    setWishlistOnly(
                      event.target.checked
                    )
                  }
                />

                Wishlist only
              </label>
            </aside>

            <section>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-800">
                    {totalProducts}
                  </strong>{' '}
                  products found
                </p>

                <select
                  value={sort}
                  onChange={event =>
                    updateUrl({
                      sort:
                        event.target.value ===
                          'newest'
                          ? ''
                          : event.target.value
                    })
                  }
                  className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold outline-none"
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="rating">
                    Top Rated
                  </option>

                  <option value="name">
                    Name: A to Z
                  </option>
                </select>
              </div>

              {error ? (
                <div className="mt-6">
                  <ErrorState message={error} />
                </div>
              ) : loading ? (
                <div className="mt-6">
                  <LoadingGrid count={pageSize} />
                </div>
              ) : visibleProducts.length ? (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map(product => (
                      <ProductCard
                        key={
                          product.id ||
                          product._id ||
                          product.slug
                        }
                        product={product}
                      />
                    ))}
                  </div>

                  {pages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={page === 1}
                        onClick={() =>
                          changePage(page - 1)
                        }
                        className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: pages },
                        (_, index) => index + 1
                      ).map(number => (
                        <button
                          key={number}
                          type="button"
                          onClick={() =>
                            changePage(number)
                          }
                          className={`h-9 w-9 rounded-md text-sm font-bold ${number === page
                            ? 'bg-[#c92532] text-white'
                            : 'border'
                            }`}
                        >
                          {number}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={page === pages}
                        onClick={() =>
                          changePage(page + 1)
                        }
                        className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="No products found"
                  message="Try another search or category."
                  action="View All Products"
                  href="/shop"
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
