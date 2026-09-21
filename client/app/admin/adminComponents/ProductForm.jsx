"use client";

import { useEffect, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { categories as categoriesData } from "@/public/data/site.json";

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ProductForm = ({
    setShowProductForm,
    editingProduct,
    setEditingProduct,
    productForm,
    setProductForm,
    loadProducts,
}) => {
    const [uploadLoading, setUploadLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (Array.isArray(categoriesData)) {
            setCategories(categoriesData);
        }
    }, []);

    const showError = (message) => {
        if (message) {
            toast.error(message);
        }
    };

    const showSuccess = (message) => {
        toast(message);
    };

    const closeProductForm = () => {
        if (loading || uploadLoading) {
            return;
        }

        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm(emptyProduct);
    };

    const handleProductChange = (event) => {
        const { name, value, type, checked } = event.target;

        setProductForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const generateSlug = () => {
        const slug = productForm.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        setProductForm((current) => ({
            ...current,
            slug
        }));
    };

    const uploadImages = async (event) => {
        const files = Array.from(event.target.files || []);

        if (!files.length) {
            return;
        }

        try {
            setUploadLoading(true);
            showError("");

            const uploadedImages = [];

            for (const file of files) {
                if (!file.type.startsWith("image/")) {
                    throw new Error(
                        `${file.name} is not a valid image file.`
                    );
                }

                if (file.size > MAX_IMAGE_SIZE) {
                    throw new Error(
                        `${file.name} is larger than 5MB.`
                    );
                }

                const formData = new FormData();
                formData.append("image", file);

                const data = await apiFetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!data?.url) {
                    throw new Error(
                        "Image upload failed. Please try again."
                    );
                }

                uploadedImages.push(data.url);
            }

            setProductForm((current) => ({
                ...current,
                images: [...current.images, ...uploadedImages]
            }));

            showSuccess("Product images uploaded successfully.");
        } catch (error) {
            console.error("Failed to upload images:", error);
            showError(
                error.message || "Failed to upload product images."
            );
        } finally {
            setUploadLoading(false);
            event.target.value = "";
        }
    };

    const removeImage = (index) => {
        setProductForm((current) => ({
            ...current,
            images: current.images.filter(
                (_, imageIndex) => imageIndex !== index
            )
        }));
    };

    const validateProduct = () => {
        const name = productForm.name.trim();
        const slug = productForm.slug.trim();
        const price = Number(productForm.price);
        const compareAtPrice = productForm.compareAtPrice
            ? Number(productForm.compareAtPrice)
            : 0;
        const stock = Number(productForm.stock || 0);
        const rating = Number(productForm.rating || 0);
        const reviews = Number(productForm.reviews || 0);

        if (!name) {
            return "Product name is required.";
        }

        if (!slug) {
            return "Product slug is required.";
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return "Product slug can only contain lowercase letters, numbers and hyphens.";
        }

        if (!productForm.category) {
            return "Product category is required.";
        }

        if (!Number.isFinite(price) || price < 0) {
            return "Product price cannot be negative.";
        }

        if (
            productForm.compareAtPrice &&
            (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)
        ) {
            return "Compare at price cannot be negative.";
        }

        if (
            productForm.compareAtPrice &&
            compareAtPrice < price
        ) {
            return "Compare at price should be greater than or equal to the selling price.";
        }

        if (!Number.isInteger(stock) || stock < 0) {
            return "Stock must be a valid non-negative number.";
        }

        if (
            !Number.isFinite(rating) ||
            rating < 0 ||
            rating > 5
        ) {
            return "Rating must be between 0 and 5.";
        }

        if (!Number.isInteger(reviews) || reviews < 0) {
            return "Reviews count must be a valid non-negative number.";
        }

        return null;
    };

    const saveProduct = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            showError("");

            const validationError = validateProduct();

            if (validationError) {
                throw new Error(validationError);
            }

            const payload = {
                name: productForm.name.trim(),
                slug: productForm.slug.trim(),
                description: productForm.description.trim(),
                price: Number(productForm.price),
                compareAtPrice: productForm.compareAtPrice
                    ? Number(productForm.compareAtPrice)
                    : undefined,
                category: productForm.category,
                images: productForm.images,
                stock: Number(productForm.stock || 0),
                rating: Number(productForm.rating || 0),
                reviews: Number(productForm.reviews || 0),
                isFeatured: Boolean(productForm.isFeatured),
                isNewArrival: Boolean(productForm.isNewArrival),
                active: Boolean(productForm.active)
            };

            if (editingProduct) {
                await apiFetch(
                    `/api/products/${editingProduct._id}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    }
                );

                showSuccess("Product updated successfully.");
            } else {
                await apiFetch("/api/products", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });

                showSuccess("Product added successfully.");
            }

            await loadProducts();

            setShowProductForm(false);
            setEditingProduct(null);
            setProductForm(emptyProduct);
        } catch (error) {
            console.error("Failed to save product:", error);
            showError(
                error.message || "Failed to save product."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 h-screen overflow-y-auto scrollbar-none bg-black/50 md:p-5">
            <form onSubmit={saveProduct}  className="mx-auto min-h-full w-full max-w-3xl md:rounded-2xl bg-white p-5 shadow-2xl md:p-7" >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold">
                            {editingProduct
                                ? "Edit Product"
                                : "Add Product"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage product details and images.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeProductForm}
                        disabled={loading || uploadLoading}
                        className="rounded-full border p-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-bold">
                            Product Name
                        </label>

                        <input
                            name="name"
                            value={productForm.name}
                            onChange={handleProductChange}
                            onBlur={() => {
                                if (!productForm.slug) {
                                    generateSlug();
                                }
                            }}
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            placeholder="Premium Gift Hamper"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold">
                            Slug
                        </label>

                        <div className="flex gap-2">
                            <input
                                name="slug"
                                value={productForm.slug}
                                onChange={handleProductChange}
                                className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                                placeholder="premium-gift-hamper"
                                required
                            />

                            <button
                                type="button"
                                onClick={generateSlug}
                                className="rounded-md border px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold">
                            Category
                        </label>

                        <select
                            name="category"
                            value={productForm.category}
                            onChange={handleProductChange}
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            required
                        >
                            <option value="">
                                Select category
                            </option>

                            {categories?.map((category) => (
                                <option
                                    key={category.slug || category.name}
                                    value={category.slug}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold">
                            Price
                        </label>

                        <input
                            name="price"
                            value={productForm.price}
                            onChange={handleProductChange}
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            placeholder="1299"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold">
                            Compare At Price
                        </label>

                        <input
                            name="compareAtPrice"
                            value={productForm.compareAtPrice}
                            onChange={handleProductChange}
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            placeholder="1799"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold">
                            Stock
                        </label>

                        <input
                            name="stock"
                            value={productForm.stock}
                            onChange={handleProductChange}
                            type="number"
                            min="0"
                            step="1"
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            placeholder="25"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold">
                            Rating
                        </label>

                        <input
                            name="rating"
                            value={productForm.rating}
                            onChange={handleProductChange}
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            placeholder="4.8"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold">
                            Reviews Count
                        </label>

                        <input
                            name="reviews"
                            value={productForm.reviews}
                            onChange={handleProductChange}
                            type="number"
                            min="0"
                            step="1"
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            placeholder="120"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-bold">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={productForm.description}
                            onChange={handleProductChange}
                            rows={5}
                            className="w-full rounded-md border px-4 py-3 outline-none focus:border-[#c92532]"
                            placeholder="Write product description..."
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-bold">
                            Product Images
                        </label>

                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 px-4 py-8 text-sm font-bold text-slate-500 hover:border-[#c92532] hover:text-[#c92532]">
                            {uploadLoading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Upload Product Images
                                </>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={uploadImages}
                                disabled={uploadLoading || loading}
                                className="hidden"
                            />
                        </label>

                        <p className="mt-2 text-xs text-slate-400">
                            Maximum 5MB per image.
                        </p>

                        {productForm.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
                                {productForm.images.map(
                                    (image, index) => (
                                        <div
                                            key={`${image}-${index}`}
                                            className="relative aspect-square overflow-hidden rounded-lg border"
                                        >
                                            <img
                                                src={image}
                                                alt={`Product ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                disabled={
                                                    loading ||
                                                    uploadLoading
                                                }
                                                className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500 shadow disabled:opacity-50"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 md:col-span-2">
                        <label className="flex items-center gap-3 rounded-lg border p-3">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={productForm.isFeatured}
                                onChange={handleProductChange}
                            />

                            <span className="text-sm font-bold">
                                Best Seller
                            </span>
                        </label>

                        <label className="flex items-center gap-3 rounded-lg border p-3">
                            <input
                                type="checkbox"
                                name="isNewArrival"
                                checked={productForm.isNewArrival}
                                onChange={handleProductChange}
                            />

                            <span className="text-sm font-bold">
                                New Arrival
                            </span>
                        </label>

                        <label className="flex items-center gap-3 rounded-lg border p-3">
                            <input
                                type="checkbox"
                                name="active"
                                checked={productForm.active}
                                onChange={handleProductChange}
                            />

                            <span className="text-sm font-bold">
                                Active
                            </span>
                        </label>
                    </div>
                </div>

                <div className="mt-7 mb-20 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={closeProductForm}
                        disabled={loading || uploadLoading}
                        className="rounded-md border px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading || uploadLoading}
                        className="flex items-center gap-2 rounded-md bg-[#c92532] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {loading && (
                            <Loader2
                                size={17}
                                className="animate-spin"
                            />
                        )}

                        {editingProduct
                            ? "Update Product"
                            : "Add Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;