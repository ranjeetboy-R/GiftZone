"use client";

import { apiFetch } from "@/lib/api";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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

const page = () => {
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState(emptyProduct);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await apiFetch("/api/products?all=true&limit=100");
            setProducts(data.products || []);
        } catch (error) {
            console.error("Failed to load products:", error);
            toast.error(error.message || "Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm(emptyProduct);
        setShowProductForm(true);
    };

    const openEditProduct = (product) => {
        setEditingProduct(product);

        setProductForm({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            price: product.price ?? "",
            compareAtPrice: product.compareAtPrice ?? "",
            category: product.category || "",
            stock: product.stock ?? "",
            rating: product.rating ?? 0,
            reviews: product.reviews ?? 0,
            isFeatured: Boolean(product.isFeatured),
            isNewArrival: Boolean(product.isNewArrival),
            active: product.active !== false,
            images: product.images || [],
            sizes: product.sizes || []
        });

        setShowProductForm(true);
    };

    

    const deleteProduct = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);
            const data = await apiFetch(`/api/products/${product._id}`, {
                method: "DELETE"
            });

            if (data?.success) {
                toast("Product deleted successfully.");
                await loadProducts();
            }

        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error(error.message || "Failed to delete product.");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        const value = query.toLowerCase().trim();

        if (!value) {
            return products;
        }

        return products.filter((product) => {
            return (
                product.name?.toLowerCase().includes(value) ||
                product.slug?.toLowerCase().includes(value) ||
                product.category?.toLowerCase().includes(value)
            );
        });
    }, [products, query]);

    return (
        <section className="rounded-xl bg-white p-5">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-bold">
                        Product Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Add, edit and delete products.
                    </p>
                </div>

                <div className="flex items-center gap-5 ">
                    <div className="flex items-center gap-3 w-full rounded-md border border-slate-300 px-3">
                        <Search size={18} className="text-slate-400" />
                        <input
                            value={query}
                            type="search"
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search products..."
                            className="w-full py-3 text-sm outline-none!"
                        />
                    </div>

                    <button
                        onClick={openAddProduct}
                        className="flex items-center gap-2 whitespace-nowrap rounded-md bg-[#c92532] hover:bg-rose-600 px-4 py-3 text-sm font-bold text-white">
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
                                <th className="p-3">Product</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="border-b border-slate-300">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-10 aspect-video overflow-hidden rounded-md bg-slate-100">
                                                {product.images?.[0] ? (
                                                    <Link
                                                        href={product.images[0]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name || "Product"}
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
                                                    {product.name?.slice(0, 30)}...
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {product.slug?.slice(0, 30)}...
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        {product.category || "-"}
                                    </td>

                                    <td className="p-3 font-bold">
                                        ₹
                                        {Number(product.price || 0).toLocaleString(
                                            "en-IN"
                                        )}
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={
                                                Number(product.stock) === 0
                                                    ? "font-bold text-red-500"
                                                    : Number(product.stock) <= 5
                                                        ? "font-bold text-orange-500"
                                                        : ""
                                            }
                                        >
                                            {product.stock}
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
                                                    openEditProduct(product)
                                                }
                                                className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                                                title="Edit product"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                onClick={() => deleteProduct(product)}
                                                className="rounded-md border border-slate-300 p-2 text-red-500 hover:bg-red-50"
                                                title="Delete product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!filteredProducts.length && (
                        <div className="py-16 text-center text-sm text-slate-500">
                            No products found.
                        </div>
                    )}
                </div>
            )}

            {showProductForm && (
                <ProductForm
                    setShowProductForm={setShowProductForm}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    productForm={productForm}
                    setProductForm={setProductForm}
                    loadProducts={loadProducts}
                />
            )}
        </section>
    );
};

export default page;