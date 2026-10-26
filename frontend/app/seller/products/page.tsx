
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import CraftosaLogo from "../../../components/craftosa-logo";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  imageUrls?: string[];
  materials?: string;
  dimensions?: string;
  weight?: string;
  careInstructions?: string;
  madeToOrder?: boolean;
  status: "active" | "inactive" | "pending" | "rejected";
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  imageUrl: string;
  imageUrls: string[];
  materials: string;
  dimensions: string;
  weight: string;
  careInstructions: string;
  madeToOrder: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "0",
  imageUrl: "",
  imageUrls: [],
  materials: "",
  dimensions: "",
  weight: "",
  careInstructions: "",
  madeToOrder: false,
};

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const loadProducts = useCallback(async () => {
    const token = sessionStorage.getItem("craftosa_access_token");

    if (!token) {
      setError("Please sign in to manage your products.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Could not load products."
        );
      }

      setProducts(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFiles([]);
    setImagePreviews([]);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      imageUrl: product.imageUrl,
      imageUrls: product.imageUrls || [product.imageUrl],
      materials: product.materials || "",
      dimensions: product.dimensions || "",
      weight: product.weight || "",
      careInstructions: product.careInstructions || "",
      madeToOrder: product.madeToOrder || false,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const token = sessionStorage.getItem("craftosa_access_token");

    if (!token) {
      setError("Your login session is missing. Please sign in again.");
      setSaving(false);
      return;
    }

    let uploadedUrls: string[] = [];
    try {
      for (const file of selectedFiles) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        const uploadResponse = await fetch(`${API_URL}/products/upload-image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: uploadForm });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.message || "Could not upload product image.");
        uploadedUrls.push(uploadData.imageUrl as string);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload product images.");
      setSaving(false);
      return;
    }
    const allImageUrls = [...form.imageUrls, ...uploadedUrls].filter((url, index, urls) => Boolean(url) && urls.indexOf(url) === index).slice(0, 8);
    const primaryImageUrl = allImageUrls[0] || form.imageUrl.trim();
    if (!primaryImageUrl) { setError("Please upload at least one product photo or add an image URL."); setSaving(false); return; }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
      imageUrl: primaryImageUrl,
      imageUrls: allImageUrls.length ? allImageUrls : [primaryImageUrl],
      materials: form.materials.trim(),
      dimensions: form.dimensions.trim(),
      weight: form.weight.trim(),
      careInstructions: form.careInstructions.trim(),
      madeToOrder: form.madeToOrder,
    };

    try {
      const response = await fetch(
        editingId
          ? `${API_URL}/products/${editingId}`
          : `${API_URL}/products`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Could not save product."
        );
      }

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product added successfully."
      );
      setForm(emptyForm);
      setSelectedFiles([]);
      setImagePreviews([]);
      setEditingId(null);
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to backend."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    const token = sessionStorage.getItem("craftosa_access_token");

    if (!token) {
      setError("Please sign in again.");
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/products/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete product.");
      }

      setProducts((current) =>
        current.filter((item) => item._id !== product._id)
      );
      setMessage("Product deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to backend."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#35271f]">
      <header className="flex items-center justify-between border-b border-[#eee5db] bg-white px-5 py-5 sm:px-8">
        <div>
          <Link
            href="/seller"
            className="text-sm font-medium text-[#a5684e] hover:underline"
          >
            <ArrowLeft size={16} className="mr-1.5 inline" /> Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">My Products</h1>
          <p className="mt-1 text-sm text-[#918277]">
            Manage your handmade creations.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="rounded-xl bg-[#8b4c35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#713c29]"
        >
          + Add Product
        </button>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        {message && (
          <p
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[#efd3c3] bg-[#fff3eb] p-4 text-sm text-[#8b4c35]"
          >
            {error}
          </p>
        )}

        {showForm && (
          <section className="rounded-2xl border border-[#eee5db] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingId ? "Edit product" : "Add a new product"}
                </h2>
                <p className="mt-1 text-sm text-[#918277]">
                  Share the details of your handmade creation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg px-3 py-2 text-sm text-[#88796e] hover:bg-[#f8f1e9]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Product name
                </label>
                <input
                  id="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Handmade clay vase"
                  className="w-full rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e] focus:ring-2 focus:ring-[#a5684e]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#e8dcd1] bg-white px-4 py-3 outline-none focus:border-[#a5684e]"
                >
                  <option value="">Select category</option>
                  <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Wood Crafts">Wood Crafts</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Art & Paintings">Art & Paintings</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="mb-2 block text-sm font-medium">
                  Price (LKR)
                </label>
                <input
                  id="price"
                  type="number"
                  required
                  min="0"
                  max="100000000"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  placeholder="2500.00"
                  className="w-full rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e]"
                />
              </div>

              <div>
                <label htmlFor="stock" className="mb-2 block text-sm font-medium">
                  Available stock
                </label>
                <input
                  id="stock"
                  type="number"
                  required
                  min="0"
                  max="1000000"
                  step="1"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e]"
                />
              </div>

              <div className="md:col-span-2 rounded-2xl border border-dashed border-[#d9c5b5] bg-[#fdfaf7] p-5">
                <label htmlFor="productPhotos" className="block text-sm font-semibold">Product photos</label>
                <p className="mt-1 text-xs text-[#918277]">Choose up to 8 JPG, PNG, WebP or GIF images. Maximum 5 MB each.</p>
                <input id="productPhotos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => { const files = Array.from(event.target.files || []).slice(0, Math.max(0, 8 - form.imageUrls.length)); setSelectedFiles(files); setImagePreviews(files.map((file) => URL.createObjectURL(file))); }} className="mt-4 block w-full cursor-pointer rounded-xl border border-[#e8dcd1] bg-white p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#f3e5da] file:px-4 file:py-2 file:font-semibold file:text-[#713c29]" />
                {(form.imageUrls.length > 0 || imagePreviews.length > 0) && <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {form.imageUrls.map((url) => <div key={url} className="relative">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={url} alt="Product photo" className="h-24 w-full rounded-xl border border-[#eee5db] object-cover" /><button type="button" aria-label="Remove photo" onClick={() => setForm({ ...form, imageUrls: form.imageUrls.filter((item) => item !== url), imageUrl: form.imageUrl === url ? "" : form.imageUrl })} className="absolute right-1 top-1 rounded-full bg-white p-1.5 text-red-700 shadow" ><X size={14} /></button></div>)}
                  {imagePreviews.map((url) => <div key={url}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={url} alt="New product photo" className="h-24 w-full rounded-xl border border-[#eee5db] object-cover" /></div>)}
                </div>}
                <details className="mt-4"><summary className="cursor-pointer text-xs font-medium text-[#8b4c35]">Or use an existing image URL</summary><input id="imageUrl" type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/product.jpg" className="mt-3 w-full rounded-xl border border-[#e8dcd1] bg-white px-4 py-3 outline-none focus:border-[#a5684e]" /></details>
              </div>
              <div><label htmlFor="materials" className="mb-2 block text-sm font-medium">Materials (optional)</label><input id="materials" maxLength={200} value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} placeholder="e.g. clay, cotton, recycled wood" className="w-full rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e]" /></div>
              <div><label htmlFor="dimensions" className="mb-2 block text-sm font-medium">Dimensions (optional)</label><input id="dimensions" maxLength={100} value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. 20 × 12 × 8 cm" className="w-full rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e]" /></div>
              <div><label htmlFor="weight" className="mb-2 block text-sm font-medium">Weight (optional)</label><input id="weight" maxLength={100} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 350 g" className="w-full rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e]" /></div>
              <div><label htmlFor="careInstructions" className="mb-2 block text-sm font-medium">Care instructions (optional)</label><input id="careInstructions" maxLength={1000} value={form.careInstructions} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} placeholder="e.g. Hand wash gently" className="w-full rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e]" /></div>
              <label className="flex items-center gap-3 rounded-xl border border-[#eee5db] p-4 text-sm md:col-span-2"><input type="checkbox" checked={form.madeToOrder} onChange={(e) => setForm({ ...form, madeToOrder: e.target.checked })} className="h-4 w-4 accent-[#8b4c35]" />This product can be made to order / custom-made</label>
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the materials, design, and how this item is made..."
                  className="w-full resize-y rounded-xl border border-[#e8dcd1] px-4 py-3 outline-none focus:border-[#a5684e]"
                />
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#8b4c35] px-6 py-3 text-sm font-semibold text-white hover:bg-[#713c29] disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-xl border border-[#e8dcd1] px-6 py-3 text-sm font-medium hover:bg-[#f8f1e9]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your collection</h2>
              <p className="mt-1 text-sm text-[#918277]">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            </div>
            <button
              onClick={() => void loadProducts()}
              className="rounded-lg border border-[#e8dcd1] bg-white px-3 py-2 text-sm hover:bg-[#f8f1e9]"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#eee5db] bg-white p-12 text-center text-sm text-[#918277]">
              Loading your products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ddcbbc] bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8eee5] text-3xl text-[#a5684e]">
                ♧
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                Your collection starts here
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#918277]">
                Add your first handmade product to start building your shop.
              </p>
              <button
                onClick={startCreate}
                className="mt-6 rounded-xl bg-[#8b4c35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#713c29]"
              >
                + Add your first product
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-[#eee5db] bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] bg-[#f3ece4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                        product.status === "active"
                          ? "bg-white text-green-700"
                          : "bg-white text-[#8b4c35]"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#a5684e]">
                      {product.category}
                    </p>
                    <h3 className="mt-2 truncate text-lg font-semibold">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#918277]">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold">
                          LKR {Number(product.price).toLocaleString("en-LK")}
                        </p>
                        <p className="mt-1 text-xs text-[#918277]">
                          Stock: {product.stock}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-lg border border-[#e8dcd1] px-3 py-2 text-xs font-semibold hover:bg-[#f8f1e9]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void deleteProduct(product)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
