"use client";

import { apiFetch, apiFetchStream } from "@/lib/api";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2
} from "lucide-react";
import Link from "next/link";
import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import ProductForm from "../adminComponents/ProductForm";
import toast from "react-hot-toast";

const emptyProduct = {
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "",
    stock: "",
    rating: 0,
    reviews: 0,
    isFeatured: false,
    isNewArrival: false,
    active: true,
    images: []
};

const PAGE_SIZE = 20;

const normalizeText = text =>
    text?.toLowerCase().trim().replace(/\s+/g, " ") || "";

const page = () => {
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState(emptyProduct);

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const loadProducts = async (
        currentPage = page,
        searchQuery = query
    ) => {
        try {
            setLoading(true);
            setProducts([]);

            const params = new URLSearchParams();

            params.set('all', 'true');
            params.set(
                'page',
                String(currentPage)
            );
            params.set(
                'limit',
                String(PAGE_SIZE)
            );

            if (searchQuery.trim()) {
                params.set(
                    'search',
                    searchQuery.trim()
                );
            }

            const data = await apiFetch(
                `/api/products?${params.toString()}`
            );

            const loadedProducts =
                Array.isArray(data?.products)
                    ? data.products
                    : [];

            const pagination =
                data?.pagination || {};

            setProducts(loadedProducts);

            setTotalProducts(
                Number(pagination.total) || 0
            );

            setPages(
                Math.max(
                    Number(pagination.pages) || 1,
                    1
                )
            );
        } catch (error) {
            console.error(
                "Failed to load products:",
                error
            );

            toast.error(
                error.message ||
                "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts(1);
    }, []);

    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm(emptyProduct);
        setShowProductForm(true);
    };

    const openEditProduct = product => {
        setEditingProduct(product);

        setProductForm({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            price: product.price ?? "",
            compareAtPrice:
                product.compareAtPrice ?? "",
            category: product.category || "",
            stock: product.stock ?? "",
            rating: product.rating ?? 0,
            reviews: product.reviews ?? 0,
            isFeatured: Boolean(
                product.isFeatured
            ),
            isNewArrival: Boolean(
                product.isNewArrival
            ),
            active:
                product.active !== false,
            images: product.images || [],
            sizes: product.sizes || []
        });

        setShowProductForm(true);
    };

    const deleteProduct = async product => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);

            const data = await apiFetch(
                `/api/products/${product._id}`,
                {
                    method: "DELETE"
                }
            );

            if (data?.success) {
                toast(
                    "Product deleted successfully."
                );

                await loadProducts(page);
            }
        } catch (error) {
            console.error(
                "Failed to delete product:",
                error
            );

            toast.error(
                error.message ||
                "Failed to delete product."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
  const timer = setTimeout(() => {
    setPage(1);
    loadProducts(1, query);
  }, 300);

  return () => {
    clearTimeout(timer);
  };
}, [query]);

    /*
     * Pagination
     */
    const changePage = nextPage => {
  if (
    nextPage < 1 ||
    nextPage > pages ||
    nextPage === page
  ) {
    return;
  }

  setPage(nextPage);
  loadProducts(
    nextPage,
    query
  );
};

    /*
     * Pagination items
     */
    const paginationItems = useMemo(() => {
        const items = [];

        if (pages <= 7) {
            for (
                let index = 1;
                index <= pages;
                index++
            ) {
                items.push(index);
            }

            return items;
        }

        items.push(1);

        if (page > 4) {
            items.push("left-ellipsis");
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
            let index = start;
            index <= end;
            index++
        ) {
            items.push(index);
        }

        if (page < pages - 3) {
            items.push("right-ellipsis");
        }

        items.push(pages);

        return items;
    }, [page, pages]);

    return (
        <section className="rounded-xl bg-white p-5">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-bold">
                        Product Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Total Products - {PAGE_SIZE} / {totalProducts}
                    </p>
                </div>

                <div className="flex items-center gap-5 ">
                    <div className="flex items-center gap-3 w-full rounded-md border border-slate-300 px-3">
                        <Search
                            size={18}
                            className="text-slate-400"
                        />

                        <input
                            value={query}
                            type="search"
                            onChange={event =>
                                setQuery(
                                    event.target.value
                                )
                            }
                            placeholder="Search products..."
                            className="w-full py-3 text-sm outline-none!"
                        />
                    </div>

                    <button
                        onClick={openAddProduct}
                        className="flex items-center gap-2 whitespace-nowrap rounded-md bg-[#c92532] hover:bg-rose-600 px-4 py-3 text-sm font-bold text-white"
                    >
                        <Plus size={17} />
                        Add Product
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2
                        size={30}
                        className="animate-spin text-[#c92532]"
                    />
                </div>
            )}

            {!loading && (
                <div className="mt-3 overflow-x-auto md:scrollbar-auto scrollbar-none">
                    <table className="w-full min-w-225 text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                                <th className="p-3">
                                    Product
                                </th>

                                <th className="p-3">
                                    Category
                                </th>

                                <th className="p-3">
                                    Price
                                </th>

                                <th className="p-3">
                                    Stock
                                </th>

                                <th className="p-3">
                                    Status
                                </th>

                                <th className="p-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map(
                                product => (
                                    <tr
                                        key={
                                            product._id
                                        }
                                        className="border-b border-slate-300"
                                    >
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-10 aspect-video overflow-hidden rounded-md bg-slate-100">
                                                    {product
                                                        .images?.[0] ? (
                                                        <Link
                                                            href={
                                                                product
                                                                    .images[0]
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <img
                                                                src={
                                                                    product
                                                                        .images[0]
                                                                }
                                                                alt={
                                                                    product.name ||
                                                                    "Product"
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </Link>
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            🎁
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-bold">
                                                        {product.name?.slice(
                                                            0,
                                                            30
                                                        )}
                                                        ...
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {product.slug?.slice(
                                                            0,
                                                            30
                                                        )}
                                                        ...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-3">
                                            {product.category ||
                                                "-"}
                                        </td>

                                        <td className="p-3 font-bold">
                                            ₹
                                            {Number(
                                                product.price ||
                                                0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <span
                                                className={
                                                    Number(
                                                        product.stock
                                                    ) ===
                                                        0
                                                        ? "font-bold text-red-500"
                                                        : Number(
                                                            product.stock
                                                        ) <=
                                                            5
                                                            ? "font-bold text-orange-500"
                                                            : ""
                                                }
                                            >
                                                {
                                                    product.stock
                                                }
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            {product.active ? (
                                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEditProduct(
                                                            product
                                                        )
                                                    }
                                                    className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                                                    title="Edit product"
                                                >
                                                    <Pencil
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteProduct(
                                                            product
                                                        )
                                                    }
                                                    className="rounded-md border border-slate-300 p-2 text-red-500 hover:bg-red-50"
                                                    title="Delete product"
                                                >
                                                    <Trash2
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>

                    {!products.length && (
                        <div className="py-16 text-center text-sm text-slate-500">
                            No products found.
                        </div>
                    )}

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="mt-16 flex w-full justify-center px-2">
                            <div className="flex max-w-full items-center justify-center gap-1 overflow-x-auto py-1 scrollbar-hide sm:gap-2">

                                {/* Previous */}
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() =>
                                        changePage(
                                            page - 1
                                        )
                                    }
                                    className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
                                >
                                    <span className="sm:hidden">
                                        <ChevronLeft
                                            size={20}
                                        />
                                    </span>

                                    <span className="hidden sm:inline">
                                        Previous
                                    </span>
                                </button>

                                {/* Page numbers */}
                                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                    {paginationItems.map(
                                        (
                                            item,
                                            index
                                        ) =>
                                            typeof item ===
                                                "string" ? (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="flex h-9 min-w-7 shrink-0 items-center justify-center px-1 text-sm font-semibold text-slate-400 sm:min-w-9"
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <button
                                                    key={
                                                        item
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        changePage(
                                                            item
                                                        )
                                                    }
                                                    aria-current={
                                                        item ===
                                                            page
                                                            ? "page"
                                                            : undefined
                                                    }
                                                    className={`h-9 min-w-9 shrink-0 rounded-lg px-2 text-sm font-bold transition ${item ===
                                                        page
                                                        ? "bg-[#c92532] text-white shadow-sm"
                                                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {
                                                        item
                                                    }
                                                </button>
                                            )
                                    )}
                                </div>

                                {/* Next */}
                                <button
                                    type="button"
                                    disabled={
                                        page ===
                                        pages
                                    }
                                    onClick={() =>
                                        changePage(
                                            page + 1
                                        )
                                    }
                                    className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
                                >
                                    <span className="sm:hidden">
                                        <ChevronRight
                                            size={20}
                                        />
                                    </span>

                                    <span className="hidden sm:inline">
                                        Next
                                    </span>
                                </button>

                            </div>
                        </div>
                    )}
                </div>
            )}

            {showProductForm && (
                <ProductForm
                    setShowProductForm={
                        setShowProductForm
                    }
                    editingProduct={
                        editingProduct
                    }
                    setEditingProduct={
                        setEditingProduct
                    }
                    productForm={productForm}
                    setProductForm={
                        setProductForm
                    }
                    loadProducts={
                        loadProducts
                    }
                />
            )}
        </section>
    );
};

export default page;