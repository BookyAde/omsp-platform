"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  image_urls?: string[] | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
};

const categories = [
  { value: "general", label: "General" },
  { value: "field_work", label: "Field Work" },
  { value: "academic_event", label: "Academic Event" },
  { value: "conference", label: "Conference" },
  { value: "training", label: "Training" },
  { value: "announcement", label: "Announcement" },
];

function IconGallery() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5A1.5 1.5 0 0 0 21.75 18V6A1.5 1.5 0 0 0 20.25 4.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z" />
    </svg>
  );
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [images, setImages] = useState<File[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  async function fetchGallery() {
    try {
      setFetching(true);
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchGallery();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || images.length === 0) {
      alert("Please add a title and select at least one image.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("is_featured", isFeatured ? "true" : "false");

    images.forEach((file) => {
      formData.append("images", file);
    });

    const res = await fetch("/api/gallery", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.error || "Upload failed.");
      setLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("general");
    setImages([]);
    setIsFeatured(false);

    const fileInput = document.getElementById("gallery-image") as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    await fetchGallery();
    setLoading(false);
  }

  async function togglePublish(item: GalleryItem) {
    await fetch(`/api/gallery/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !item.is_published }),
    });

    fetchGallery();
  }

  async function toggleFeatured(item: GalleryItem) {
    await fetch(`/api/gallery/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !item.is_featured }),
    });

    fetchGallery();
  }

  async function deleteItem(id: string) {
    const confirmed = confirm("Delete this gallery item?");
    if (!confirmed) return;

    await fetch(`/api/gallery/${id}`, {
      method: "DELETE",
    });

    fetchGallery();
  }

  const publishedCount = items.filter((item) => item.is_published).length;
  const featuredCount = items.filter((item) => item.is_featured).length;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-ocean-800 to-ocean-800/50 border border-ocean-700/50 px-7 py-6 flex items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">
            Gallery & Updates
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Manage OMSP field work photos, academic events, conferences,
            trainings and public updates.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-mono text-teal-400">
            {publishedCount} published
          </span>

          <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-mono text-yellow-300">
            {featuredCount} featured
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-1 rounded-2xl border border-ocean-700/50 bg-ocean-900/60 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-400/20 text-teal-400 flex items-center justify-center">
              <IconGallery />
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Upload New Update
              </h3>

              <p className="text-xs text-slate-400">
                Add one or more photos under a single public update.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Title
            </label>

            <input
              className="mt-2 w-full rounded-xl border border-ocean-700 bg-ocean-950/70 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400/70"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="OMSP field work at Lagos coastline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              className="mt-2 w-full rounded-xl border border-ocean-700 bg-ocean-950/70 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-teal-400/70"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this activity or update"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Category
            </label>

            <select
              className="mt-2 w-full rounded-xl border border-ocean-700 bg-ocean-950/70 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-400/70"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-ocean-700 accent-teal-400"
            />

            <span>
              <span className="block text-sm font-semibold text-yellow-300">
                Mark as featured
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">
                Featured uploads stay above regular updates on the public site.
              </span>
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Images
            </label>

            <input
              id="gallery-image"
              type="file"
              accept="image/*"
              multiple
              className="mt-2 w-full rounded-xl border border-ocean-700 bg-ocean-950/70 px-4 py-2.5 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-400 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ocean-950"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || []);
                setImages(selectedFiles);
              }}
            />

            {images.length > 0 && (
              <p className="mt-2 text-xs text-teal-400">
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-semibold text-ocean-950 transition hover:bg-teal-300 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Update"}
          </button>
        </form>

        <section className="xl:col-span-2 rounded-2xl border border-ocean-700/50 bg-ocean-900/40 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Uploaded Items
              </h3>

              <p className="text-xs text-slate-400">
                Publish, feature, hide or remove public gallery updates.
              </p>
            </div>

            <span className="rounded-full border border-ocean-700 px-3 py-1 text-xs text-slate-400">
              {items.length} total
            </span>
          </div>

          {fetching ? (
            <p className="text-sm text-slate-400">Loading gallery items...</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ocean-700 bg-ocean-950/40 p-8 text-center">
              <p className="text-sm text-slate-400">
                No gallery items uploaded yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {items.map((item) => {
                const imageCount =
                  item.image_urls && item.image_urls.length > 0
                    ? item.image_urls.length
                    : item.image_url
                    ? 1
                    : 0;

                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border bg-ocean-950/60 ${
                      item.is_featured
                        ? "border-yellow-400/40 shadow-lg shadow-yellow-950/20"
                        : "border-ocean-700/50"
                    }`}
                  >
                    <div className="relative">
                      <div className="relative h-72 w-full overflow-hidden bg-ocean-950 md:h-80">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            sizes="(max-width: 1280px) 100vw, 66vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <p className="text-sm text-slate-500">
                              No preview image
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {item.is_featured && (
                          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-ocean-950">
                            Featured
                          </span>
                        )}

                        {imageCount > 1 && (
                          <span className="rounded-full bg-ocean-950/85 px-3 py-1 text-xs font-medium text-white">
                            {imageCount} photos
                          </span>
                        )}
                      </div>

                      <span
                        className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${
                          item.is_published
                            ? "bg-teal-400 text-ocean-950"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.is_published ? "Published" : "Hidden"}
                      </span>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-teal-400">
                          {item.category.replace("_", " ")}
                        </p>

                        <h4 className="mt-2 font-display text-xl font-semibold text-white">
                          {item.title}
                        </h4>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => togglePublish(item)}
                          className="rounded-lg border border-ocean-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-teal-400/60 hover:text-teal-400"
                        >
                          {item.is_published ? "Hide" : "Publish"}
                        </button>

                        <button
                          onClick={() => toggleFeatured(item)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                            item.is_featured
                              ? "bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20"
                              : "border border-ocean-700 text-slate-300 hover:border-yellow-400/50 hover:text-yellow-300"
                          }`}
                        >
                          {item.is_featured ? "Unfeature" : "Feature"}
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}