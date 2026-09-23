'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LoadingGrid from '@/components/LoadingGrid';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { useCart } from '@/context/CartContext';
import { apiFetch, apiFetchStream } from '@/lib/api';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

const PAGE_SIZE = 40;

const SORT_OPTIONS = [
  {
    value: 'newest',
    label: 'Newest'
  },
  {
    value: 'price-low',
    label: 'Price: Low to High'
  },
  {
    value: 'price-high',
    label: 'Price: High to Low'
  },
  {
    value: 'rating',
    label: 'Top Rated'
  },
  {
    value: 'name',
    label: 'Name: A to Z'
  }
];

const getProductId = product => {
  return (
    product?.id ||
    product?._id ||
    product?.slug ||
    ''
  );
};

const getWishlistIdsFromStorage = () => {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const saved = JSON.parse(
      localStorage.getItem('gift-zone-wishlist') || '[]'
    );

    if (!Array.isArray(saved)) {
      return new Set();
    }

    return new Set(
      saved
        .map(item => getProductId(item))
        .filter(Boolean)
    );
  } catch {
    return new Set();
  }
};

export default function ShopPage() {
  const { items } = useCart();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('allCategories');
  const [sort, setSort] = useState('newest');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(    () => new Set()  );

  /*
   * Keep URL filters and local state synchronized.
   */
  useEffect(() => {
    const currentSearch =
      searchParams.get('search') || '';

    const currentCategory =
      searchParams.get('category') || '';

    const currentSort =
      searchParams.get('sort') ||
      (
        searchParams.get('best') === 'true'
          ? 'rating'
          : 'newest'
      );

    const currentPage = Math.max(
      Number(searchParams.get('page')) || 1,
      1
    );

    setSearch(currentSearch);
    setCategory(currentCategory);
    setSort(currentSort);
    setPage(currentPage);
  }, [searchParams]);

  /*
   * Load categories once.
   */
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const data = await apiFetch(
          '/api/products/categories'
        );

        if (!cancelled) {
          setCategories(
            Array.isArray(data?.categories)
              ? data.categories
              : []
          );
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load wishlist from localStorage.
   *
   * This runs only on the client.
   * It does NOT access localStorage during render.
   */
  useEffect(() => {
    const syncWishlist = () => {
      setWishlistIds(
        getWishlistIdsFromStorage()
      );
    };

    syncWishlist();

    window.addEventListener(
      'storage',
      syncWishlist
    );

    window.addEventListener(
      'wishlist-updated',
      syncWishlist
    );

    return () => {
      window.removeEventListener(
        'storage',
        syncWishlist
      );

      window.removeEventListener(
        'wishlist-updated',
        syncWishlist
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const controller = new AbortController();

    const loadProducts = async () => {
      const params = new URLSearchParams();

      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));

      const currentSearch =
        searchParams.get('search') || '';

      const currentCategory =
        searchParams.get('category') || '';

      const currentSort =
        searchParams.get('sort') ||
        (
          searchParams.get('best') === 'true'
            ? 'rating'
            : 'newest'
        );

      const isNew =
        searchParams.get('new') === 'true';

      const isBest =
        searchParams.get('best') === 'true';

      if (currentSearch.trim()) {
        params.set(
          'search',
          currentSearch.trim()
        );
      }

      if (currentCategory) {
        params.set(
          'category',
          currentCategory
        );
      }

      if (isNew) {
        params.set('new', 'true');
      }

      if (isBest) {
        params.set('best', 'true');
      }

      if (
        currentSort &&
        currentSort !== 'newest'
      ) {
        params.set(
          'sort',
          currentSort
        );
      }

      setLoading(true);
      setError('');
      setCatalog([]);

      try {
        await apiFetchStream(
          `/api/products?${params.toString()}`,
          {
            signal: controller.signal,

            onMeta: (pagination) => {
              if (cancelled) {
                return;
              }

              setTotalProducts(
                Number(pagination?.total) || 0
              );

              setPages(
                Math.max(
                  Number(pagination?.pages) || 1,
                  1
                )
              );
            },

            onProducts: (products) => {
              if (cancelled) {
                return;
              }

              setCatalog(currentCatalog => {
                const mergedProducts = [
                  ...currentCatalog,
                  ...products
                ];

                return Array.from(
                  new Map(
                    mergedProducts.map(product => [
                      product._id,
                      product
                    ])
                  ).values()
                );
              });
            }
          }
        );
      } catch (requestError) {
        if (
          requestError?.name ===
          'AbortError'
        ) {
          return;
        }

        if (!cancelled) {
          setCatalog([]);
          setTotalProducts(0);
          setPages(1);
          setError(
            'Unable to load catalog.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, searchParams]);

  /*
   * Update URL without losing existing filters.
   */
  const updateUrl = changes => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(changes).forEach(
      ([key, value]) => {
        const normalizedValue =
          typeof value === 'string'
            ? value.trim()
            : value;

        if (
          normalizedValue !== undefined &&
          normalizedValue !== null &&
          normalizedValue !== ''
        ) {
          params.set(
            key,
            String(normalizedValue)
          );
        } else {
          params.delete(key);
        }
      }
    );

    /*
     * Every filter change starts from page 1.
     */
    params.delete('page');

    const query = params.toString();

    router.push(
      query
        ? `/shop?${query}`
        : '/shop'
    );

  };

  /*
   * Search button.
   */
  const handleSearch = () => {
    updateUrl({
      search: search.trim()
    });
  };

  /*
   * Search using Enter.
   */
  const handleSearchKeyDown = event => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    handleSearch();
  };

  /*
   * Clear search.
   */
  const clearSearch = () => {
    setSearch('');

    updateUrl({
      search: ''
    });
  };

  /*
   * Change category.
   */
  const handleCategoryChange = value => {
    updateUrl({
      category: value
    });
  };

  /*
   * Change sort.
   */
  const handleSortChange = value => {
    updateUrl({
      sort:
        value === 'newest'
          ? ''
          : value
    });
  };

  /*
   * Change pagination.
   */
  const changePage = nextPage => {
    if (
      nextPage < 1 ||
      nextPage > pages ||
      nextPage === page
    ) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (nextPage === 1) {
      params.delete('page');
    } else {
      params.set(
        'page',
        String(nextPage)
      );
    }

    const query = params.toString();

    router.push(
      query
        ? `/shop?${query}`
        : '/shop'
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /*
   * Generate a compact pagination list.
   *
   * Instead of rendering 100 buttons when there
   * are many pages, this keeps the UI clean.
   */
  const paginationItems = useMemo(() => {
    if (pages <= 7) {
      return Array.from(
        { length: pages },
        (_, index) => index + 1
      );
    }

    const result = [];

    result.push(1);

    if (page > 3) {
      result.push('left-ellipsis');
    }

    const start = Math.max(
      2,
      page - 1
    );

    const end = Math.min(
      pages - 1,
      page + 1
    );

    for (
      let number = start;
      number <= end;
      number += 1
    ) {
      result.push(number);
    }

    if (page < pages - 2) {
      result.push('right-ellipsis');
    }

    result.push(pages);

    return result;
  }, [page, pages]);

  /*
   * Wishlist filtering.
   *
   * This uses the already synchronized Set.
   * localStorage is NOT read here.
   */
  const visibleProducts = useMemo(() => {
    if (!wishlistOnly) {
      return catalog;
    }

    return catalog.filter(product => {
      const productId =
        getProductId(product);

      return (
        productId &&
        wishlistIds.has(productId)
      );
    });
  }, [
    catalog,
    wishlistOnly,
    wishlistIds
  ]);

  /*
   * Active filter count.
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (category) {
      count += 1;
    }

    if (searchParams.get('new') === 'true') {
      count += 1;
    }

    if (searchParams.get('best') === 'true') {
      count += 1;
    }

    if (sort && sort !== 'newest') {
      count += 1;
    }

    if (wishlistOnly) {
      count += 1;
    }

    return count;
  }, [
    category,
    sort,
    wishlistOnly,
    searchParams
  ]);

  /*
   * Clear all filters.
   */
  const clearAllFilters = () => {
    setWishlistOnly(false);
    setSearch('');

    router.push('/shop');

  };

  const cartCount = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.quantity) || 0),
    0
  );

  return (
    <>
      <Header cartCount={cartCount} />

      <main className="section-pad">
        <div className="container-width">

          {/* Page Heading */}
          <div className="mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c92532]">
                  Shop
                </p>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Explore Our Products
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Discover products across
                  multiple categories,
                  carefully organized for
                  an easier shopping
                  experience.
                </p>
              </div>

              <div className="text-sm text-slate-500">
                <strong className="font-extrabold text-slate-900">
                  {totalProducts}
                </strong>{' '}
                products found
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-5">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={event =>
                  setSearch(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleSearchKeyDown
                }
                placeholder={`Search in ${totalProducts} products...`}
                aria-label="Search products"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-24 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#c92532] focus:ring-4 focus:ring-[#c92532]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                  aria-label="Clear search"
                  className="absolute right-12 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={
                  handleSearch
                }
                aria-label="Search"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-[#c92532] text-white transition hover:bg-[#a91d29] active:scale-95"
              >
                <Search size={17} />
              </button>
            </div>
          </div>

          <div className="gap-6 flex flex-col">

            {/* Filters */}
            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">
                  Filters
                </h2>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-[#c92532] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Category
              </label>

              <div className="mt-2 overflow-x-auto md:scrollbar-thin scrollbar-none pb-2">
                <div className="flex w-max min-w-full gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange('')
                    }
                    className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-all duration-200 ${!category
                      ? 'border-[#c92532] bg-[#fff5f5] font-bold text-[#c92532]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    All Categories
                  </button>

                  {categories.map(item => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() =>
                        handleCategoryChange(item.slug)
                      }
                      className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-all duration-200 ${category === item.slug
                        ? 'border-[#c92532] bg-[#fff5f5] font-bold text-[#c92532]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {item.name}

                      <span
                        className={`ml-1 ${category === item.slug
                          ? 'text-[#c92532]/70'
                          : 'text-slate-400'
                          }`}
                      >
                        ({item.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={wishlistOnly}
                    onChange={event =>
                      setWishlistOnly(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 cursor-pointer accent-[#c92532]"
                  />

                  Wishlist only

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {wishlistIds.size}
                  </span>
                </label>

                <select
                  value={sort}
                  onChange={event =>
                    handleSortChange(
                      event.target.value
                    )
                  }
                  className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none transition focus:border-[#c92532]"
                >
                  {SORT_OPTIONS.map(option => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            {/* Product Area */}
            <section className="relative min-w-0 bg-white">

              {/* Active Search/Filter Info */}
              {(search ||
                category ||
                wishlistOnly) && (
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {search && (
                      <button
                        type="button"
                        onClick={
                          clearSearch
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        Search:
                        <span className="max-w-45 truncate text-slate-900">
                          {search}
                        </span>

                        <X
                          size={13}
                        />
                      </button>
                    )}

                    {category && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCategoryChange(
                            ''
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        Category:
                        <span className="text-slate-900">
                          {categories.find(
                            item =>
                              item.slug ===
                              category
                          )
                            ?.name ||
                            category}
                        </span>

                        <X
                          size={13}
                        />
                      </button>
                    )}

                    {wishlistOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          setWishlistOnly(
                            false
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-[#fff5f5] px-3 py-1.5 text-xs font-semibold text-[#c92532]"
                      >
                        Wishlist only

                        <X
                          size={13}
                        />
                      </button>
                    )}
                  </div>
                )}

              {error ? (
                <div className="mt-6">
                  <ErrorState
                    message={error}
                  />
                </div>
              ) : loading ? (
                <div className="mt-6">
                  <LoadingGrid
                    count={
                      PAGE_SIZE
                    }
                  />
                </div>
              ) : visibleProducts.length ? (
                <>
                  {/* Products */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {visibleProducts.map(
                      product => (
                        <ProductCard
                          key={getProductId(
                            product
                          )}
                          product={
                            product
                          }
                        />
                      )
                    )}
                  </div>

                  {/* Pagination */}
                  {!wishlistOnly && pages > 1 && (
                    <div className="mt-16 flex w-full justify-center px-2">
                      <div className="flex max-w-full items-center justify-center gap-1 overflow-x-auto py-1 scrollbar-hide sm:gap-2">
                        {/* Previous */}
                        <button
                          type="button"
                          disabled={page === 1}
                          onClick={() => changePage(page - 1)}
                          className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
                        >
                          <span className="sm:hidden"><ChevronLeft size={20} /></span>
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        {/* Page numbers */}
                        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                          {paginationItems.map((item, index) =>
                            typeof item === 'string' ? (
                              <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 min-w-7 shrink-0 items-center justify-center px-1 text-sm font-semibold text-slate-400 sm:min-w-9"
                              >
                                …
                              </span>
                            ) : (
                              <button
                                key={item}
                                type="button"
                                onClick={() => changePage(item)}
                                aria-current={
                                  item === page
                                    ? 'page'
                                    : undefined
                                }
                                className={`h-9 min-w-9 shrink-0 rounded-lg px-2 text-sm font-bold transition ${item === page
                                  ? 'bg-[#c92532] text-white shadow-sm'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                              >
                                {item}
                              </button>
                            )
                          )}
                        </div>

                        {/* Next */}
                        <button
                          type="button"
                          disabled={page === pages}
                          onClick={() => changePage(page + 1)}
                          className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
                        >
                          <span className="sm:hidden"><ChevronRight size={20} /></span>
                          <span className="hidden sm:inline">Next</span>
                        </button>
                      </div>
                    </div>
                  )}

                </>
              ) : wishlistOnly ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Your wishlist is empty
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Add products to
                    your wishlist
                    and they will
                    appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setWishlistOnly(
                        false
                      )
                    }
                    className="mt-5 rounded-xl bg-[#c92532] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#a91d29]"
                  >
                    Browse Products
                  </button>
                </div>
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
